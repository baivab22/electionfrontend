import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CandidateCard from '@/components/CandidateCard';
import { Search, Users, Target, Award, ChevronLeft, ChevronRight } from 'lucide-react';

interface Candidate {
  _id: string;
  personalInfo: {
    fullName: string;
    position: string;
    constituency: string;
  };
  biography: {
    bio_en: string;
    profilePhoto?: string;
  };
  achievements: Array<any>;
  issues: Array<any>;
}

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const positions = ['Presidential', 'Vice Presidential', 'Parliamentary', 'Local Body', 'Other'];

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://api.abhushangallery.com'}/api/candidates`
        );
        if (!response.ok) throw new Error('Failed to fetch candidates');
        const data = await response.json();
        setCandidates(data.data);
        setFilteredCandidates(data.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    let result = candidates;

    if (searchTerm) {
      result = result.filter(c =>
        c.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.personalInfo.constituency.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPosition && selectedPosition !== 'all') {
      result = result.filter(c => c.personalInfo.position === selectedPosition);
    }

    if (selectedConstituency) {
      result = result.filter(c => c.personalInfo.constituency === selectedConstituency);
    }

    setFilteredCandidates(result);
    setCurrentPage(1);
  }, [searchTerm, selectedPosition, selectedConstituency, candidates]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const constituencies = [...new Set(candidates.map(c => c.personalInfo.constituency))];

  const stats = [
    {
      label: 'Total Candidates',
      value: candidates.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Parliamentary Candidates',
      value: candidates.filter(c => c.personalInfo.position === 'Parliamentary').length,
      icon: Target,
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      label: 'Total Achievements',
      value: candidates.reduce((sum, c) => sum + (c.achievements?.length || 0), 0),
      icon: Award,
      color: 'bg-emerald-100 text-emerald-600'
    }
  ];

  const hasActiveFilters = searchTerm || (selectedPosition && selectedPosition !== 'all') || selectedConstituency;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary via-primary/80 to-secondary text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Know Our Candidates</h1>
          <p className="text-lg text-white/90">
            Discover detailed information about our political candidates and their vision for the future
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">Filter Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-10 border-gray-200 focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Position Filter */}
              <Select value={selectedPosition || "all"} onValueChange={setSelectedPosition}>
                <SelectTrigger className="border-gray-200 focus:border-primary">
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Constituency Filter */}
              <Select value={selectedConstituency || "all"} onValueChange={(value) => setSelectedConstituency(value === "all" ? "" : value)}>
                <SelectTrigger className="border-gray-200 focus:border-primary">
                  <SelectValue placeholder="Select Constituency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Constituencies</SelectItem>
                  {constituencies.map(constituency => (
                    <SelectItem key={constituency} value={constituency}>
                      {constituency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedPosition('all');
                    setSelectedConstituency('');
                  }}
                  className="border-gray-200 text-primary hover:bg-primary/10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <>
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary text-white px-3 py-1 text-base">
                  {filteredCandidates.length} result{filteredCandidates.length !== 1 ? 's' : ''}
                </Badge>
                {selectedPosition && (
                  <Badge variant="outline" className="border-secondary text-secondary">
                    {selectedPosition}
                  </Badge>
                )}
                {selectedConstituency && (
                  <Badge variant="outline" className="border-accent text-accent">
                    {selectedConstituency}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedCandidates.map(candidate => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="border-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-primary text-white' : 'border-gray-200'}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="border-gray-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-16 pb-16 text-center">
              <Users className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-6">No candidates found matching your filters</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPosition('');
                  setSelectedConstituency('');
                }}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CandidatesPage;
