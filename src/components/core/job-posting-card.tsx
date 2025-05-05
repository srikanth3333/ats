"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  BriefcaseIcon,
  CalendarIcon,
  DollarSignIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserCheck,
  UserIcon,
} from "lucide-react";
import Link from "next/link";

interface JobPosting {
  id: number;
  created_at: string;
  role: string;
  skills: string[];
  location: string[];
  job_description: string;
  exp_min: number;
  exp_max: number;
  budget_min: number;
  budget_max: number;
  employment_type: string;
  mode_of_job: string;
  date_of_posting: string;
  position: string;
  refer: string | null;
  notify_recruiter: string | null;
  job_status: string;
  client: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  draft_status: string | null;
  assign: number;
  user_id: string;
}

interface JobPostingCardProps {
  data: JobPosting[];
  loading: boolean;
  showMore: () => void;
  hasMore: boolean;
}

export function JobPostingCard({
  data,
  loading,
  showMore,
  hasMore,
}: JobPostingCardProps) {
  const statusColors = {
    full_time: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    contract: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    part_time: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  };

  const getInitials = (role: string, position: string) => {
    const roleChar = role.charAt(0).toUpperCase();
    const positionChar = position.charAt(0).toUpperCase();
    return `${roleChar}${positionChar || roleChar}`;
  };

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {loading && data.length === 0 && (
        <div className="flex justify-center">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
      {data.length === 0 && !loading && (
        <p className="text-center text-muted-foreground">
          No job postings found.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((job) => (
          <Card
            key={job.id}
            className="overflow-hidden transition-all hover:shadow-md py-0"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {getInitials(job.role, job.position)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-lg">{job.role}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {job.position}
                      </p>
                    </div>
                    <Badge
                      className={
                        statusColors[
                          job.job_status as keyof typeof statusColors
                        ] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }
                      variant="outline"
                    >
                      {job.job_status.charAt(0).toUpperCase() +
                        job.job_status.slice(1).replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
                    {job.location?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{job.location.join(", ")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4" />
                      <span>
                        {job.exp_min}-{job.exp_max} years experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>
                        Budget: ${job.budget_min} - ${job.budget_max}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        Posted{" "}
                        {format(new Date(job.date_of_posting), "MMM d, yyyy")}
                      </span>
                    </div>
                    {job.skills?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        <span>Skills: {job.skills.join(", ")}</span>
                      </div>
                    )}
                    {/* {job.job_description && (
                      <div className="mt-2">
                        <p>{truncateDescription(job.job_description, 100)}</p>
                      </div>
                    )} */}
                    {job.client ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>Client Name: {job.client.name}</span>
                        </div>
                        {job.client.email && (
                          <div className="flex items-center gap-2">
                            <MailIcon className="h-4 w-4" />
                            <a
                              href={`mailto:${job.client.email}`}
                              className="hover:underline"
                            >
                              {job.client.email}
                            </a>
                          </div>
                        )}
                        {job.client.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4" />
                            <a
                              href={`tel:${job.client.phone}`}
                              className="hover:underline"
                            >
                              {job.client.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Client: Not assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            {/* <CardFooter className="flex justify-between bg-muted/50 p-4">
              <Link href={`/jobs/${job.id}`} passHref>
                <Button variant="outline" size="sm">
                  View Job
                </Button>
              </Link>
              <Link href={`/jobs/${job.id}/applications`} passHref>
                <Button variant="ghost" size="sm">
                  View Applications
                </Button>
              </Link>
            </CardFooter> */}
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={showMore}
            disabled={loading}
            className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            {loading ? "Loading..." : "Show More"}
          </Button>
        </div>
      )}
    </div>
  );
}
