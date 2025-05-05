"use client"; // Keep this as the component still needs to be a client component for interactivity

import {
  fetchCandidates,
  fetchInterviews,
  scheduleInterview,
} from "@/app/actions/action";
// Import server actions
import { InterviewCalendar } from "@/components/core/interview-calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDays,
  addMonths,
  format,
  isValid,
  parseISO,
  subMonths,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Constants for timezone
const INDIA_TIMEZONE = "Asia/Kolkata";

interface Candidate {
  id: string;
  name: string;
  email: string;
  job_status: string;
}

interface Interview {
  id: string;
  candidate_id: string;
  name: string;
  job_title: string;
  interviewer: string;
  scheduled_at: string;
  duration: number;
  type: "phone" | "video" | "in-person";
  user_id: string;
}

// Helper function to convert UTC date string to Indian Time
function convertToIndianTime(dateStr: string) {
  try {
    const parsedDate = parseISO(dateStr);
    return parsedDate;
  } catch (error) {
    console.error("Invalid date format:", dateStr);
    return new Date(); // Fallback to current date
  }
}

// Helper function to format date in Indian timezone
function formatInIndianTime(date: Date, formatStr: string) {
  return formatInTimeZone(date, INDIA_TIMEZONE, formatStr);
}

// Helper to check if a date is today in Indian timezone
function isIndianToday(date: Date) {
  const todayInIndia = new Date();
  const dateInIndia = date;

  return (
    dateInIndia.getDate() === todayInIndia.getDate() &&
    dateInIndia.getMonth() === todayInIndia.getMonth() &&
    dateInIndia.getFullYear() === todayInIndia.getFullYear()
  );
}

export default function InterviewsPage() {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(
    null
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidate_id: "",
    job_title: "",
    interviewer: "",
    scheduled_date: "",
    scheduled_time: "",
    duration: "60",
    type: "video" as "phone" | "video" | "in-person",
  });
  const [filterInterviewer, setFilterInterviewer] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Initialize data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const [candidateResponse, interviewResponse] = await Promise.all([
          fetchCandidates(),
          fetchInterviews({ filterInterviewer, filterType }),
        ]);

        if (!candidateResponse.success) {
          throw new Error("Failed to load candidates");
        }
        if (!interviewResponse.success) {
          throw new Error("Failed to load interviews");
        }

        setCandidates(candidateResponse.data);
        setInterviews(interviewResponse.data);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError("Failed to initialize data");
        toast.error(err.message || "Failed to initialize data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [filterInterviewer, filterType]);

  // Handle interview click
  const handleInterviewClick = (interviewId: string) => {
    setSelectedInterview(interviewId);
  };

  // Handle month navigation
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Handle schedule interview form
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !newInterview.candidate_id ||
        !newInterview.job_title ||
        !newInterview.interviewer ||
        !newInterview.scheduled_date ||
        !newInterview.scheduled_time
      ) {
        throw new Error("Please fill all required fields");
      }

      const candidate = candidates.find(
        (c) => c.id === newInterview.candidate_id
      );
      if (!candidate) {
        throw new Error("Invalid candidate selected");
      }

      // Convert local time to UTC for storage
      // When scheduling, we need to convert from Indian time to UTC for storage
      const scheduledLocalDate = new Date(
        `${newInterview.scheduled_date}T${newInterview.scheduled_time}:00`
      );

      if (!isValid(scheduledLocalDate)) {
        throw new Error("Invalid date or time");
      }

      // Convert to UTC ISO string for Supabase
      const scheduledAtUTC = scheduledLocalDate.toISOString();

      const interviewData = {
        candidate_id: newInterview.candidate_id,
        name: candidate.name,
        job_title: newInterview.job_title,
        interviewer: newInterview.interviewer,
        scheduled_at: scheduledAtUTC,
        duration: parseInt(newInterview.duration),
        type: newInterview.type,
      };

      const response = await scheduleInterview(interviewData);

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || "Failed to schedule interview"
        );
      }

      setInterviews([...interviews, response.data]);
      setIsScheduleModalOpen(false);
      setNewInterview({
        candidate_id: "",
        job_title: "",
        interviewer: "",
        scheduled_date: "",
        scheduled_time: "",
        duration: "60",
        type: "video",
      });
      toast.success("Interview scheduled successfully");
    } catch (err: any) {
      console.error("Error scheduling interview:", err);
      toast.error(err.message || "Failed to schedule interview");
    }
  };

  // Filter interviews for cards
  const todayInterviews = interviews.filter((interview) => {
    try {
      const interviewDate = convertToIndianTime(interview.scheduled_at);
      return isIndianToday(interviewDate);
    } catch {
      console.warn(`Invalid scheduled_at for interview ${interview.id}`);
      return false;
    }
  });

  const upcomingInterviews = interviews.filter((interview) => {
    try {
      const interviewDate = convertToIndianTime(interview.scheduled_at);
      const now = new Date();
      return interviewDate > now && interviewDate <= addDays(now, 7);
    } catch {
      console.warn(`Invalid scheduled_at for interview ${interview.id}`);
      return false;
    }
  });

  const selectedInterviewData = interviews.find(
    (interview) => interview.id === selectedInterview
  );

  // Log calendar props for debugging
  const calendarInterviews = interviews
    .map((interview) => {
      try {
        const interviewDate = convertToIndianTime(interview.scheduled_at);
        return {
          id: interview.id,
          candidateName: interview.name || "Unknown",
          jobTitle: interview.job_title || "Unknown",
          interviewer: interview.interviewer || "Unknown",
          scheduledAt: interviewDate,
          duration: interview.duration || 60,
          type: interview.type || "video",
        };
      } catch (err) {
        console.warn(`Invalid interview data for ID ${interview.id}`, err);
        return null;
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Helper to get current date in Indian timezone
  const currentDateInIndia = new Date();

  return (
    <div className="@container/main p-5">
      <div className="space-y-6 mb-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Interviews</h1>
          <Button onClick={() => setIsScheduleModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1" />

          <Select
            value={filterInterviewer}
            onValueChange={setFilterInterviewer}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Interviewer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interviewers</SelectItem>
              {Array.from(new Set(interviews.map((i) => i.interviewer)))
                .sort()
                .map((interviewer) => (
                  <SelectItem key={interviewer} value={interviewer}>
                    {interviewer}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="in-person">In-person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Todays Interviews</CardTitle>
              <CardDescription>
                {formatInTimeZone(
                  currentDateInIndia,
                  INDIA_TIMEZONE,
                  "MMMM d, yyyy"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No interviews scheduled for today.
                </p>
              ) : (
                <div className="space-y-4">
                  {todayInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{interview.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {interview.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatInTimeZone(
                            convertToIndianTime(interview.scheduled_at),
                            INDIA_TIMEZONE,
                            "h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming interviews in the next 7 days.
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{interview.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {interview.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatInTimeZone(
                            convertToIndianTime(interview.scheduled_at),
                            INDIA_TIMEZONE,
                            "MMM d, yyyy"
                          )}{" "}
                          at{" "}
                          {formatInTimeZone(
                            convertToIndianTime(interview.scheduled_at),
                            INDIA_TIMEZONE,
                            "h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Feedback</CardTitle>
              <CardDescription>Interviews without feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No pending feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">
          Loading interviews...
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">
          {error}. Please try again later.
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No interviews scheduled. Click Schedule Interview to add one.
        </div>
      ) : (
        <InterviewCalendar
          interviews={calendarInterviews}
          onInterviewClick={handleInterviewClick}
        />
      )}

      <Dialog
        open={!!selectedInterview}
        onOpenChange={(open) => !open && setSelectedInterview(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              {selectedInterviewData && (
                <>
                  {formatInTimeZone(
                    convertToIndianTime(selectedInterviewData.scheduled_at),
                    INDIA_TIMEZONE,
                    "MMMM d, yyyy"
                  )}{" "}
                  at{" "}
                  {formatInTimeZone(
                    convertToIndianTime(selectedInterviewData.scheduled_at),
                    INDIA_TIMEZONE,
                    "h:mm a"
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedInterviewData && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Candidate</h3>
                <p className="text-sm">
                  {selectedInterviewData.name || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Position</h3>
                <p className="text-sm">
                  {selectedInterviewData.job_title || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Interviewer</h3>
                <p className="text-sm">
                  {selectedInterviewData.interviewer || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Type</h3>
                <p className="text-sm capitalize">
                  {selectedInterviewData.type || "Unknown"} Interview
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Duration</h3>
                <p className="text-sm">
                  {selectedInterviewData.duration || 60} minutes
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInterview(null)}
                >
                  Close
                </Button>
                <Button disabled>Add Feedback</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Enter details for the new interview.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="candidate" className="mb-3">
                Candidate
              </Label>
              <Select
                value={newInterview.candidate_id}
                onValueChange={(value) =>
                  setNewInterview({ ...newInterview, candidate_id: value })
                }
              >
                <SelectTrigger id="candidate" className="w-full">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {candidates.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">
                      No candidates available
                    </div>
                  ) : (
                    candidates.map((candidate) => (
                      <SelectItem
                        className="w-full"
                        key={candidate.id}
                        value={candidate.id}
                      >
                        {candidate.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={newInterview.job_title}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    job_title: e.target.value,
                  })
                }
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewer" className="mb-3">
                Interviewer
              </Label>
              <Input
                id="interviewer"
                value={newInterview.interviewer}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    interviewer: e.target.value,
                  })
                }
                placeholder="e.g., John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="scheduled_date" className="mb-3">
                Date
              </Label>
              <Input
                id="scheduled_date"
                type="date"
                value={newInterview.scheduled_date}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    scheduled_date: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="scheduled_time" className="mb-3">
                Time
              </Label>
              <Input
                id="scheduled_time"
                type="time"
                name="time"
                value={newInterview.scheduled_time}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    scheduled_time: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="duration" className="mb-3">
                Duration (minutes)
              </Label>
              <Select
                value={newInterview.duration}
                onValueChange={(value) =>
                  setNewInterview({ ...newInterview, duration: value })
                }
              >
                <SelectTrigger id="duration" className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type" className="mb-3">
                Type
              </Label>
              <Select
                value={newInterview.type}
                onValueChange={(value) =>
                  setNewInterview({
                    ...newInterview,
                    type: value as "phone" | "video" | "in-person",
                  })
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in-person">In-person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
