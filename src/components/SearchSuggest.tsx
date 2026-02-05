import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertCircle, CheckCircle2, ArrowRight, Calendar, Clock, FileText, User, Building, Sparkles, ExternalLink, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { adminList, Suggestion, Category, Status } from '@/lib/api';

// Modern status badge colors mapping
const statusColors: Record<Status, { bg: string; text: string; border: string }> = {
  'Received': { 
    bg: 'bg-blue-50/80', 
    text: 'text-blue-700', 
    border: 'border-blue-200' 
  },
  'In Process': { 
    bg: 'bg-amber-50/80', 
    text: 'text-amber-700', 
    border: 'border-amber-200' 
  },
  'Resolved': { 
    bg: 'bg-emerald-50/80', 
    text: 'text-emerald-700', 
    border: 'border-emerald-200' 
  }
};

interface EnhancedTrackingCardProps {
  className?: string;
}

export default function EnhancedTrackingCard({ className = '' }: EnhancedTrackingCardProps) {
  const [trackId, setTrackId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Suggestion | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const onTrack = async () => {
    if (!trackId.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await adminList({ 
        q: trackId.trim(),
        limit: 10,
        page: 1
      });
      
      if (data.suggestions.length === 0) {
        setError('No suggestions found with that ID. Please check and try again.');
        return;
      }
      
      setResult(data.suggestions[0]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to search suggestions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (result) {
      setIsDetailOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsDetailOpen(false);
  };

  return (
    <>
      <Card className={`w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-2xl overflow-hidden ${className}`}>
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center font-poppins">
                <Search className="w-7 h-7 mr-3 animate-pulse" />
                Track Your Feedback
              </CardTitle>
              <p className="text-base text-indigo-100 mt-2 font-inter">
                Enter your suggestion ID or keywords to check real-time status
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <Label className="block text-base font-semibold text-gray-700 mb-3 font-inter">
                Search Feedback
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search keyword description..."
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onTrack()}
                  className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 font-inter">
                Enter your keywords from your feedback
              </p>
            </div>
            
            <Button 
              onClick={onTrack} 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-105 text-base font-inter shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Search className="w-5 h-5 mr-2" />
                  Track Feedback
                </div>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-shake">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 animate-pulse" />
                  <p className="text-red-700 font-medium text-sm font-inter">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl animate-fadeIn">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mr-2 flex-shrink-0 animate-bounce" />
                    <span className="font-bold text-emerald-900 text-lg font-poppins">Feedback Found!</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200 transform hover:scale-105 transition-all duration-200">
                      <span className="font-semibold text-gray-700 font-inter">Status:</span>
                      <Badge className={`text-sm font-semibold border animate-pulse ${statusColors[result.status].bg} ${statusColors[result.status].text} ${statusColors[result.status].border}`}>
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200 transform hover:scale-105 transition-all duration-200">
                      <span className="font-semibold text-gray-700 font-inter">Category:</span>
                      <span className="font-semibold text-gray-900 font-inter capitalize">{result.category}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-200 transform hover:scale-105 transition-all duration-200">
                      <span className="font-semibold text-gray-700 font-inter">Submitted:</span>
                      <span className="font-medium text-gray-900 font-inter">
                        {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-emerald-200">
                    <Button 
                      onClick={handleViewDetails}
                      className="w-full border-emerald-300 rounded-lg transform hover:scale-105 transition-all duration-200 font-semibold font-inter"
                    >
                      View Full Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggestion Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0 rounded-2xl">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Suggestion Details
              </DialogTitle>
              <DialogDescription className="text-base">
                Complete information for your suggestion
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {result && (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="capitalize bg-white border-gray-200 text-sm"
                >
                  {result.category}
                </Badge>
                <Badge className={`
                  text-sm ${statusColors[result.status].bg}
                  ${statusColors[result.status].text}
                  ${statusColors[result.status].border}
                  border
                `}>
                  {result.status}
                </Badge>
                <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700 text-xs">
                  ID: {result._id?.substring(0, 8)}...
                </Badge>
              </div>
              
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Description
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-md text-sm leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Action Taken Section */}
              {result.actionTaken && (
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    Action Taken
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {result.actionTaken}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-800 font-medium">
                        {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-800 font-medium">
                        {format(new Date(result.updatedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    Submission
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anonymous:</span>
                      <span className="text-gray-800 font-medium">
                        {result.anonymous ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {result.assignedDepartment && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    Assignment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <p className="text-gray-800 font-medium">{result.assignedDepartment}</p>
                    </div>
                    {result.assignedTo && (
                      <div>
                        <span className="text-gray-600">Assigned To:</span>
                        <p className="text-gray-800 font-medium">{result.assignedTo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.media && result.media.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Attachments ({result.media.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {result.media.map((media, index) => (
                      <div key={index} className="border rounded-lg p-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-700 truncate">
                            {media.filename || `Attachment ${index + 1}`}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild className="text-xs h-8">
                          <a href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            View
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}