"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  BriefcaseIcon,
  CalendarIcon,
  DollarSignIcon,
  MailIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";

interface Candidate {
  id: number;
  created_at: string;
  name: string;
  email: string;
  email_verified: string | null;
  phone_verified: string | null;
  exp_min: number;
  exp_max: number;
  ctc: number;
  current_company: string;
  current_location: string;
  preferred_location: string;
  notice_period: number;
  remarks: string;
  resume_url: string;
  user_id: string;
  status?: string; // Optional, as not present in sample data
}

interface CandidateCardProps {
  data: Candidate[];
  loading: boolean;
  showMore: () => void;
  hasMore: boolean;
}

export function CandidateCard({
  data,
  loading,
  showMore,
  hasMore,
}: CandidateCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800 hover:bg-green-200",
    inactive: "bg-red-100 text-red-800 hover:bg-red-200",
    pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  };

  const getInitials = (name: string) => {
    const nameParts = name.split(" ").filter((part) => part);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
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
          No candidates found.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((candidate) => (
          <Card
            key={candidate.id}
            className="overflow-hidden transition-all hover:shadow-md py-0"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-lg">
                          {candidate.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {candidate.current_company}
                      </p>
                    </div>
                    {candidate.status && (
                      <Badge
                        className={
                          statusColors[
                            candidate.status as keyof typeof statusColors
                          ] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }
                        variant="outline"
                      >
                        {candidate.status.charAt(0).toUpperCase() +
                          candidate.status.slice(1)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
                    {candidate.email && (
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4" />
                        <a
                          href={`mailto:${candidate.email}`}
                          className="hover:underline"
                        >
                          {candidate.email}
                        </a>
                      </div>
                    )}
                    {candidate.current_location && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>Current: {candidate.current_location}</span>
                      </div>
                    )}
                    {candidate.preferred_location && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>Preferred: {candidate.preferred_location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4" />
                      <span>
                        {candidate.exp_min}-{candidate.exp_max} years experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>CTC: ${candidate.ctc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Notice Period: {candidate.notice_period} days</span>
                    </div>
                    {candidate.resume_url && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <a
                          href={candidate.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                    {candidate.remarks && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Remarks: {candidate.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between bg-muted/50 p-4">
              <Link href={`/candidates/${candidate.id}`} passHref>
                <Button variant="outline" size="sm">
                  View Candidate
                </Button>
              </Link>
              <Link href={`/candidates/${candidate.id}/applications`} passHref>
                <Button variant="ghost" size="sm">
                  View Applications
                </Button>
              </Link>
            </CardFooter>
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
