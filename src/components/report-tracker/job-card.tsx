"use client";

import { fetchCandidateById } from "@/app/actions/action";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDate } from "@/lib/date-utils";
import { Job } from "@/types/job";
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  MapPinIcon,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "full_time":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "part_time":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "contract":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getCandidateStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "interviewscheduled":
      case "review":
        return "bg-blue-100 text-blue-800";
      case "offered":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "new":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateStatusCounts = () => {
    const counts = {
      reviewed: 0,
      offered: 0,
      new: 0,
      other: 0,
    };

    data.forEach((candidate) => {
      switch (candidate.job_status.toLowerCase()) {
        case "interviewscheduled":
        case "review":
          counts.reviewed += 1;
          break;
        case "offered":
          counts.offered += 1;
          break;
        case "new":
          counts.new += 1;
          break;
        default:
          counts.other += 1;
          break;
      }
    });

    return counts;
  };

  const statusCounts = calculateStatusCounts();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchCandidateById(job?.id?.toString());
      setData(response?.data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  console.log(job);
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 w-full p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl font-bold capitalize tracking-tight">
          {job?.client?.name}
        </h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              View Details
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gray-50 dark:bg-gray-900">
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Job Details
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Client:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {job?.client?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Job Role:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {job.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Position:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {job.position}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Assigned To:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {job.user_profile?.name}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Candidates
                </h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : data.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No candidates found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.map((record) => (
                      <Card
                        key={record.id}
                        className="p-4 bg-white dark:bg-gray-800"
                      >
                        <CardContent className="p-0 space-y-2">
                          <div className="flex justify-between items-center">
                            <h6 className="font-medium text-gray-900 dark:text-gray-100">
                              {record?.name}
                            </h6>
                            <Badge
                              className={getCandidateStatusColor(
                                record?.job_status
                              )}
                            >
                              {record?.job_status
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Email: {record?.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Experience: {record?.exp_min} years
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {job.role}
              </h3>
              <Badge className={`${getStatusColor(job.job_status)} capitalize`}>
                {job.job_status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {job.position}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              variant="outline"
              className="mb-2 border-blue-200 text-blue-600"
            >
              {job.client.contract_type}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ID: {job.id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <BriefcaseIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm">
              {job.exp_min}-{job.exp_max} years
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPinIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm">{job.location.join(", ")}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm">{formatDate(job.date_of_posting)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="text-sm capitalize">{job.mode_of_job}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.skills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {skill}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-sm">
              <span className="font-medium">{job.assign}</span> Assigned
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-sm">
              <span className="font-medium">{statusCounts.reviewed}</span>{" "}
              Reviewed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm">
              <span className="font-medium">{statusCounts.offered}</span>{" "}
              Offered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-purple-500" />
            <span className="text-sm">
              <span className="font-medium">{statusCounts.new}</span> New
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
