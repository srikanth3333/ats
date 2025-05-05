"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Award, UserCheck, UserCog, Users, UserX } from "lucide-react";

type StatType = "assigned" | "rejected" | "reviewed" | "offered";

interface StatBadgeProps {
  type: StatType;
  count: number;
}

export function StatBadge({ type, count }: StatBadgeProps) {
  const getStatConfig = () => {
    switch (type) {
      case "assigned":
        return {
          icon: Users,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
          label: "Assigned",
        };
      case "rejected":
        return {
          icon: UserX,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
          label: "Rejected",
        };
      case "reviewed":
        return {
          icon: UserCog,
          className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
          label: "Reviewed",
        };
      case "offered":
        return {
          icon: Award,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
          label: "Offered",
        };
      default:
        return {
          icon: UserCheck,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
          label:
            (type as StatType).charAt(0).toUpperCase() +
            (type as StatType).slice(1),
        };
    }
  };

  const { icon: Icon, className, label } = getStatConfig();

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 py-1 px-2 font-medium text-xs transition-colors",
        className
      )}
    >
      <Icon size={12} />
      <span>{count}</span>
      <span className="hidden sm:inline ml-1">{label}</span>
    </Badge>
  );
}
