"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  addDays,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  setHours,
  startOfWeek,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

// Constants for timezone
const INDIA_TIMEZONE = "Asia/Kolkata";

interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  interviewer: string;
  scheduledAt: Date;
  duration: number;
  type: "phone" | "video" | "in-person";
}

interface InterviewCalendarProps {
  interviews: Interview[];
  onInterviewClick?: (interviewId: string) => void;
}

// Helper function to format date in Indian timezone
function formatInIndianTime(date: Date, formatStr: string) {
  return formatInTimeZone(date, INDIA_TIMEZONE, formatStr);
}

// Helper to check if a date is the same day in Indian timezone
function isIndianSameDay(date1: Date, date2: Date) {
  const zonedDate1 = toZonedTime(date1, INDIA_TIMEZONE);
  const zonedDate2 = toZonedTime(date2, INDIA_TIMEZONE);
  return isSameDay(zonedDate1, zonedDate2);
}

export function InterviewCalendar({
  interviews: interviewsList,
  onInterviewClick,
}: InterviewCalendarProps) {
  // Set initial date to the week of May 4, 2025 in Indian timezone
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date("2025-05-04");
    return new Date(formatInIndianTime(date, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  });
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    console.log("Received interviews:", interviewsList);
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, 6),
    });
    setCalendarDays(days);
  }, [currentDate]);

  const handlePreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const getDayClass = (day: Date) => {
    const isToday = isIndianSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);

    return cn(
      "text-center p-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto",
      {
        "bg-primary text-primary-foreground": isToday,
        "": !isCurrentMonth,
      }
    );
  };

  // Time slots from 12 AM to 11 PM (Indian time)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0:00 to 23:00

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex justify-between items-center flex-row">
        <CardTitle className="text-lg font-medium">
          Interview Calendar
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          {calendarDays.length > 0 && (
            <span className="text-sm font-medium">
              {formatInIndianTime(calendarDays[0], "MMM d")} -{" "}
              {formatInIndianTime(calendarDays[6], "MMM d, yyyy")}
            </span>
          )}
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 border-b pb-2">
          <div className="text-muted-foreground text-sm font-medium text-right pr-3">
            Time
          </div>
          {calendarDays.map((day) => (
            <div key={day.toString()} className="text-center">
              <div className="text-muted-foreground text-xs mb-1">
                {formatInIndianTime(day, "EEE")}
              </div>
              <div className={getDayClass(day)}>
                {formatInIndianTime(day, "d")}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 mt-2">
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              <div className="text-xs text-muted-foreground text-right pr-3 mt-1">
                {hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:00{" "}
                {hour >= 12 ? "PM" : "AM"}
              </div>

              {calendarDays.map((day) => {
                const dayWithHour = setHours(day, hour);
                const dayInterviews = interviewsList.filter((interview) => {
                  const interviewDate = toZonedTime(
                    interview.scheduledAt,
                    INDIA_TIMEZONE
                  );
                  const interviewHour = parseInt(
                    formatInIndianTime(interviewDate, "H")
                  );
                  return (
                    isIndianSameDay(interviewDate, day) &&
                    Math.floor(interviewHour) === hour
                  );
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border-t relative min-h-[80px]"
                  >
                    {dayInterviews.map((interview) => {
                      const bgClass =
                        interview.type === "video"
                          ? "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700"
                          : interview.type === "phone"
                          ? "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700"
                          : "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700";

                      return (
                        <div
                          key={interview.id}
                          className={`absolute inset-x-1 rounded-md border text-xs p-2 cursor-pointer transition-opacity hover:opacity-80 ${bgClass}`}
                          style={{ top: "4px", bottom: "4px" }}
                          onClick={() => onInterviewClick?.(interview.id)}
                        >
                          <div className="font-medium truncate">
                            {interview.candidateName}
                          </div>
                          <div className="truncate">{interview.jobTitle}</div>
                          <div className="truncate text-muted-foreground">
                            {formatInIndianTime(
                              interview.scheduledAt,
                              "h:mm a"
                            )}{" "}
                            ({interview.type})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
