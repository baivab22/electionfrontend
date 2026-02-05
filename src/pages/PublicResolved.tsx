import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminList, Suggestion, Category, Status } from '@/lib/api';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Calendar, Clock, BarChart3, X, Image, Download } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import SuggestionCard from '@/components/suggestionCard';

const categories: Category[] = ['academic', 'administrative', 'infrastructure', 'other'];
const statuses: Status[] = ['Received', 'In Process', 'Resolved'];

// Status badge colors mapping
const statusColors: Record<Status, string> = {
  'Received': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'In Process': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'Resolved': 'bg-green-100 text-green-800 hover:bg-green-200'
};

export default function PublicSuggestionsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters - REMOVED DEFAULT 'Resolved' FILTER
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const itemsPerPage = 8;
  const totalPages = Math.ceil(total / itemsPerPage);

  useEffect(() => {
    loadSuggestions();
  }, [page, searchTerm, categoryFilter, statusFilter, departmentFilter, fromDate, toDate]);

  async function loadSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: itemsPerPage,
      };

      // Add filters to params
      if (searchTerm) params.q = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter) params.assignedDepartment = departmentFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const data = await adminList(params);
      setSuggestions(data.suggestions);
      setTotal(data.total);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load suggestions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all'); // Changed from 'Resolved' to 'all'
    setDepartmentFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const handleViewDetails = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setPage(1); // Reset to first page when filter changes
    
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'department':
        setDepartmentFilter(value);
        break;
      case 'fromDate':
        setFromDate(value);
        break;
      case 'toDate':
        setToDate(value);
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Public Suggestions</h1>
          <p className="text-muted-foreground">
            Explore suggestions and their current status in our community
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-600">{error}</div>
              <Button variant="outline" className="mt-2" onClick={loadSuggestions}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suggestions..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value: Category | 'all') => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: Status | 'all') => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  placeholder="Filter by department..."
                  value={departmentFilter}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                />
              </div>

              {/* Date Range Filters */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end md:col-span-2 lg:col-span-1">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {suggestions?.length} of {total} suggestions
          </p>
          {total > 0 && (
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
          )}
        </div>

        {/* Suggestions Grid */}
        {suggestions?.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-muted-foreground mb-4">
                {total === 0 
                  ? "No suggestions found matching your criteria."
                  : "No suggestions available."
                }
              </div>
              {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || departmentFilter || fromDate || toDate) && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {suggestions.map((suggestion: Suggestion, index: number) => {
              const transformedSuggestion = {
                id: suggestion._id || suggestion.id || `SUG-${Date.now()}-${index}`,
                title: suggestion.description || "No title provided",
                category: suggestion.category || "General",
                status: suggestion.status || "Pending",
                impact: suggestion.impact || "Impact not available",
                resolvedDate: suggestion.updatedAt 
                  ? new Date(suggestion.updatedAt).toLocaleDateString() 
                  : "Not resolved",
                department: suggestion.assignedDepartment || "Unassigned",
                resolutionTime: suggestion.createdAt && suggestion.updatedAt 
                  ? `${Math.ceil(
                      (new Date(suggestion.updatedAt).getTime() - new Date(suggestion.createdAt).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days`
                  : "N/A",
                actionTaken: suggestion.actionTaken || "No action yet"
              };

              return (
                <SuggestionCard 
                  key={transformedSuggestion.id} 
                  suggestion={transformedSuggestion}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Have a suggestion?</h3>
            <p className="text-muted-foreground mb-4">
              Help us improve our community by sharing your ideas
            </p>
            <Link to="/submit">
              <Button>Submit a Suggestion</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Suggestion Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedSuggestion && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span className="line-clamp-2">
                      {selectedSuggestion.description}
                    </span>
                    <Badge className={statusColors[selectedSuggestion.status]}>
                      {selectedSuggestion.status}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {selectedSuggestion.category}
                      </Badge>
                      {selectedSuggestion.assignedDepartment && (
                        <Badge variant="secondary">
                          {selectedSuggestion.assignedDepartment}
                        </Badge>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSuggestion.description}
                    </p>
                  </div>

                  {selectedSuggestion.actionTaken && (
                    <div>
                      <h4 className="font-semibold mb-2">Action Taken</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSuggestion.actionTaken}
                      </p>
                    </div>
                  )}

                  {selectedSuggestion.impact && (
                    <div>
                      <h4 className="font-semibold mb-2">Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSuggestion.impact}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Submitted: {format(new Date(selectedSuggestion.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {selectedSuggestion.updatedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Updated: {format(new Date(selectedSuggestion.updatedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedSuggestion.media && selectedSuggestion.media.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Attachments ({selectedSuggestion.media.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedSuggestion.media.map((media, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm truncate">
                              {media.originalName || `Attachment ${idx + 1}`}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(media.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}