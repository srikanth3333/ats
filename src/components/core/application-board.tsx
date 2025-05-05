"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";

interface Candidate {
  id: number;
  created_at: string;
  name: string;
  email: string;
  email_verified: boolean | null;
  phone_verified: boolean | null;
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
  job_status: string;
}

interface ApplicationBoardProps {
  applications: {
    new: Candidate[];
    reviewed: Candidate[];
    interviewScheduled: Candidate[];
    rejected: Candidate[];
    offered: Candidate[];
  };
  onStatusChange?: (
    candidateId: number,
    newStatus: string,
    oldStatus: string
  ) => void;
  view: "board" | "list";
}

export function ApplicationBoard({
  applications,
  onStatusChange,
  view,
}: ApplicationBoardProps) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [draggingSource, setDraggingSource] = useState<string | null>(null);

  const statuses = [
    { key: "new", label: "New", color: "border-blue-400" },
    { key: "reviewed", label: "Reviewed", color: "border-purple-400" },
    {
      key: "interviewScheduled",
      label: "Interview Scheduled",
      color: "border-amber-400",
    },
    { key: "offered", label: "Offered", color: "border-green-400" },
    { key: "rejected", label: "Rejected", color: "border-gray-400" },
  ];

  const handleDragStart = (e: React.DragEvent, id: number, status: string) => {
    setDraggingId(id);
    setDraggingSource(status);
    e.dataTransfer.setData("application/reactflow", id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();

    const id = draggingId;
    const sourceStatus = draggingSource;

    if (id !== null && sourceStatus && sourceStatus !== targetStatus) {
      onStatusChange?.(id, targetStatus, sourceStatus);
    }

    setDraggingId(null);
    setDraggingSource(null);
  };

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    return nameParts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (view === "list") {
    const allCandidates = Object.values(applications).flat();
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCandidates.length > 0 ? (
                allCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, candidate.id, candidate.job_status)
                    }
                  >
                    <TableCell>
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="hover:underline"
                      >
                        {candidate.name}
                      </Link>
                    </TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.current_company}</TableCell>
                    <TableCell>{candidate.current_location}</TableCell>
                    <TableCell>
                      {statuses.find((s) => s.key === candidate.job_status)
                        ?.label || candidate.job_status}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(candidate.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No candidates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statuses.map((status) => (
        <div
          key={status.key}
          className="flex flex-col h-full"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status.key)}
        >
          <Card className={`border-t-4 ${status.color} h-full`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {status.label} (
                {applications[status.key as keyof typeof applications]
                  ?.length || 0}
                )
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-13rem)]">
              {applications[status.key as keyof typeof applications]?.map(
                (candidate) => (
                  <div
                    key={candidate.id}
                    className="p-3 bg-card border rounded-md cursor-move hover:shadow-sm transition-shadow"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, candidate.id, status.key)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="block text-sm font-medium truncate hover:underline"
                        >
                          {candidate.name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied{" "}
                          {formatDistanceToNow(new Date(candidate.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              {(!applications[status.key as keyof typeof applications] ||
                applications[status.key as keyof typeof applications].length ===
                  0) && (
                <div className="p-3 border border-dashed rounded-md text-center">
                  <p className="text-xs text-muted-foreground">No candidates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
