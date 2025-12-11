import { Badge } from "@/components/ui/badge";

type StatusType = 
  | "active" | "inactive" 
  | "completed" | "pending" | "in_progress" | "cancelled" | "delivered" | "planned"
  | "paid" | "partial" | "unpaid" | "delayed" | "hold"
  | "approved" | "rejected"
  | "new" | "resolved" | "responded"
  | "direct" | "contract"
  | "elite" | "smart_basics"
  | "default" | "success" | "warning" | "error" | "info";

interface AdminStatusBadgeProps {
  status: string;
  type?: "status" | "active" | "payment" | "job" | "quality" | "employee" | "inquiry";
  className?: string;
}

const statusColorMap: Record<string, string> = {
  // Active/Inactive states
  active: "bg-green-500 text-white hover:bg-green-600",
  inactive: "bg-gray-400 text-white hover:bg-gray-500",
  
  // Job/Order statuses
  completed: "bg-green-500 text-white hover:bg-green-600",
  delivered: "bg-emerald-500 text-white hover:bg-emerald-600",
  in_progress: "bg-blue-500 text-white hover:bg-blue-600",
  pending: "bg-amber-500 text-white hover:bg-amber-600",
  planned: "bg-gray-500 text-white hover:bg-gray-600",
  cancelled: "bg-red-500 text-white hover:bg-red-600",
  
  // Payment statuses
  paid: "bg-green-500 text-white hover:bg-green-600",
  partial: "bg-amber-500 text-white hover:bg-amber-600",
  unpaid: "bg-red-500 text-white hover:bg-red-600",
  delayed: "bg-orange-500 text-white hover:bg-orange-600",
  hold: "bg-gray-500 text-white hover:bg-gray-600",
  
  // Approval statuses
  approved: "bg-green-500 text-white hover:bg-green-600",
  rejected: "bg-red-500 text-white hover:bg-red-600",
  
  // Inquiry statuses
  new: "bg-blue-500 text-white hover:bg-blue-600",
  resolved: "bg-green-500 text-white hover:bg-green-600",
  responded: "bg-purple-500 text-white hover:bg-purple-600",
  
  // Employee types
  direct: "bg-blue-500 text-white hover:bg-blue-600",
  contract: "bg-purple-500 text-white hover:bg-purple-600",
  
  // Quality tiers
  elite: "bg-violet-500 text-white hover:bg-violet-600",
  smart_basics: "bg-teal-500 text-white hover:bg-teal-600",
  
  // Generic
  default: "bg-gray-500 text-white hover:bg-gray-600",
  success: "bg-green-500 text-white hover:bg-green-600",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  error: "bg-red-500 text-white hover:bg-red-600",
  info: "bg-blue-500 text-white hover:bg-blue-600",
};

export const AdminStatusBadge = ({ status, type, className = "" }: AdminStatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const colorClass = statusColorMap[normalizedStatus] || statusColorMap.default;
  
  const displayText = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  return (
    <Badge className={`${colorClass} ${className}`}>
      {displayText}
    </Badge>
  );
};

// Helper function for getting status colors (for inline usage)
export const getAdminStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  return statusColorMap[normalizedStatus] || statusColorMap.default;
};
