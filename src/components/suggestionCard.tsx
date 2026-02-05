import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Calendar, Clock, Building, FileText, CheckCircle, AlertCircle, PlayCircle, User, Tag } from "lucide-react";

// Category colors and icons
const getCategoryInfo = (category) => {
  switch (category?.toLowerCase()) {
    case "academic":
      return {
        color: "bg-blue-100 text-blue-800",
        icon: <FileText className="w-4 h-4" />,
        border: "border-l-4 border-l-blue-500"
      };
    case "administrative":
      return {
        color: "bg-purple-100 text-purple-800",
        icon: <Building className="w-4 h-4" />,
        border: "border-l-4 border-l-purple-500"
      };
    case "infrastructure":
      return {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
        border: "border-l-4 border-l-green-500"
      };
    case "other":
      return {
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle className="w-4 h-4" />,
        border: "border-l-4 border-l-gray-500"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle className="w-4 h-4" />,
        border: "border-l-4 border-l-gray-500"
      };
  }
};

// Status colors and icons
const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case "received":
      return {
        color: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="w-4 h-4" />
      };
    case "in process":
      return {
        color: "bg-blue-100 text-blue-800",
        icon: <PlayCircle className="w-4 h-4" />
      };
    case "resolved":
      return {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" />
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle className="w-4 h-4" />
      };
  }
};

const SuggestionCard = ({ suggestion }) => {
  const [open, setOpen] = useState(false);
  const categoryInfo = getCategoryInfo(suggestion.category);
  const statusInfo = getStatusInfo(suggestion.status);

  return (
    <>
      {/* Suggestion Card */}
      <Card className={`relative border-0 shadow-md hover:shadow-lg bg-white rounded-lg xs:rounded-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${categoryInfo.border}`}>
        <CardHeader className="pb-2 pt-3 xs:pt-4 px-3 xs:px-4 sm:px-6">
          <div className="flex items-start justify-between gap-2 xs:gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm xs:text-base sm:text-lg leading-tight mb-1.5 xs:mb-2">
                {suggestion.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
                <Badge
                  className={`text-[10px] xs:text-xs font-medium px-2 xs:px-3 py-0.5 xs:py-1 rounded-full flex items-center gap-1 ${categoryInfo.color}`}
                >
                  <span className="hidden xs:inline">{categoryInfo.icon}</span>
                  {suggestion.category}
                </Badge>
                
                <Badge
                  className={`text-[10px] xs:text-xs font-medium px-2 xs:px-3 py-0.5 xs:py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}
                >
                  <span className="hidden xs:inline">{statusInfo.icon}</span>
                  {suggestion.status}
                </Badge>
              </div>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="p-1.5 xs:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 mt-1"
              aria-label="View details"
            >
              <Eye className="w-3 xs:w-4 h-3 xs:h-4" />
            </button>
          </div>
        </CardHeader>
<div className="px-3 xs:px-4 sm:px-6">
        <DetailBox 
                label="Action Taken" 
                value={suggestion.actionTaken} 
                multiline 
                icon={<CheckCircle className="w-3 xs:w-4 h-3 xs:h-4 text-green-500" />}
              />
              </div>

        <CardContent className="pt-0 px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between text-xs xs:text-sm text-gray-600 mt-2 xs:mt-3 gap-2 xs:gap-0">
            <div className="flex flex-wrap items-center gap-2 xs:gap-4">
              <div className="flex items-center">
                <Calendar className="w-3 xs:w-4 h-3 xs:h-4 mr-1 text-gray-500" />
                <span>{suggestion.resolvedDate}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-3 xs:w-4 h-3 xs:h-4 mr-1 text-gray-500" />
                <span className="font-medium">{suggestion.resolutionTime}</span>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <User className="w-3 xs:w-4 h-3 xs:h-4 mr-1" />
              <span className="text-[10px] xs:text-xs">{suggestion.department}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-lg xs:rounded-xl p-0 overflow-hidden shadow-xl bg-white mx-2 xs:mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200">
            <DialogHeader className="mb-1.5 xs:mb-2">
              <DialogTitle className="font-semibold text-base xs:text-lg sm:text-xl text-gray-900">
                Suggestion Details
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base">{suggestion.title}</p>
          </div>
          
          <div className="p-3 xs:p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm">
            <DetailBox 
              label="ID" 
              value={suggestion.id} 
              icon={<Tag className="w-3 xs:w-4 h-3 xs:h-4 text-blue-500" />}
            />
            <DetailBox 
              label="Category" 
              value={suggestion.category} 
              icon={categoryInfo.icon}
              color={categoryInfo.color}
            />
            <DetailBox 
              label="Status" 
              value={suggestion.status} 
              icon={statusInfo.icon}
              color={statusInfo.color}
            />
            <DetailBox 
              label="Department" 
              value={suggestion.department} 
              icon={<Building className="w-3 xs:w-4 h-3 xs:h-4 text-purple-500" />}
            />
            <DetailBox 
              label="Resolved Date" 
              value={suggestion.resolvedDate} 
              icon={<Calendar className="w-3 xs:w-4 h-3 xs:h-4 text-green-500" />}
            />
            <DetailBox 
              label="Resolution Time" 
              value={suggestion.resolutionTime} 
              icon={<Clock className="w-3 xs:w-4 h-3 xs:h-4 text-blue-500" />}
            />

            <div className="sm:col-span-2">
              <DetailBox 
                label="Action Taken" 
                value={suggestion.actionTaken} 
                multiline 
                icon={<CheckCircle className="w-3 xs:w-4 h-3 xs:h-4 text-green-500" />}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper UI component for modal details
const DetailBox = ({ label, value, multiline = false, icon, color }) => (
  <div className="flex flex-col bg-gray-50 rounded-lg p-2 xs:p-3 border border-gray-200">
    <div className="flex items-center mb-0.5 xs:mb-1">
      {icon}
      <span className="text-[10px] xs:text-xs font-medium text-gray-500 ml-1.5 xs:ml-2">
        {label}
      </span>
    </div>
    <span
      className={`text-gray-800 font-medium text-xs xs:text-sm ${multiline ? "mt-0.5 xs:mt-1 whitespace-pre-wrap" : "truncate"}`}
    >
      {value}
    </span>
  </div>
);

export default SuggestionCard;