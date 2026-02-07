import React, { useState, useEffect, useMemo } from 'react';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

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
  const [minAgeFilter, setMinAgeFilter] = useState<number | null>(null);
  const [maxAgeFilter, setMaxAgeFilter] = useState<number | null>(null);

  const positions = ['Presidential', 'Vice Presidential', 'Parliamentary', 'Local Body', 'Other'];

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates`
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

    // Age range filter
    if ((minAgeFilter !== null && !isNaN(minAgeFilter)) || (maxAgeFilter !== null && !isNaN(maxAgeFilter))) {
      result = result.filter(c => {
        const dob = c.personalInfo?.dateOfBirth ? new Date(c.personalInfo.dateOfBirth) : null;
        if (!dob || isNaN(dob.getTime())) return false;
        const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        if (minAgeFilter !== null && age < minAgeFilter) return false;
        if (maxAgeFilter !== null && age > maxAgeFilter) return false;
        return true;
      });
    }

    setFilteredCandidates(result);
    setCurrentPage(1);
  }, [searchTerm, selectedPosition, selectedConstituency, candidates]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const constituencies = [...new Set(candidates.map(c => c.personalInfo.constituency))];

  // Derived age stats
  const ages = useMemo(() => {
    return candidates
      .map(c => {
        const dob = c.personalInfo?.dateOfBirth ? new Date(c.personalInfo.dateOfBirth) : null;
        if (!dob || isNaN(dob.getTime())) return null;
        return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      })
      .filter(a => a !== null) as number[];
  }, [candidates]);

  const ageMin = ages.length ? Math.min(...ages) : 18;
  const ageMax = ages.length ? Math.max(...ages) : 80;

  // Chart data: age distribution buckets
  const ageBuckets = useMemo(() => {
    const buckets: Record<string, number> = {};
    const step = 10;
    ages.forEach(age => {
      const key = `${Math.floor(age / step) * step}-${Math.floor(age / step) * step + step - 1}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.keys(buckets)
      .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]) )
      .map(k => ({ range: k, count: buckets[k] }));
  }, [ages]);

  const genderData = useMemo(() => {
    const map: Record<string, number> = {};
    candidates.forEach(c => {
      const g = (c.personalInfo?.gender || 'Unknown').toString();
      map[g] = (map[g] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [candidates]);

  const provinceData = useMemo(() => {
    const map: Record<string, number> = {};
    candidates.forEach(c => {
      const p = (c.personalInfo?.province || c.personalInfo?.position || 'Unknown').toString();
      map[p] = (map[p] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ province: k, count: map[k] })).slice(0, 12);
  }, [candidates]);

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
      <div className="bg-gradient-to-r from-primary via-primary/80 to-secondary text-white py-8 xs:py-12 sm:py-16 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-2 xs:mb-4">Know Our Candidates</h1>
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-white/90 px-2">
            Discover detailed information about our political candidates and their vision for the future
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 -mt-6 xs:-mt-8 sm:-mt-10 mb-6 xs:mb-8 sm:mb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-3 xs:pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
                    <div className={`p-2 xs:p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-4 xs:w-5 sm:w-6 h-4 xs:h-5 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs xs:text-sm font-medium">{stat.label}</p>
                      <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 mb-6 xs:mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 xs:pb-4">
            <CardTitle className="text-sm xs:text-base sm:text-lg text-foreground">Filter Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-8 xs:pl-10 border-gray-200 focus:border-primary text-xs xs:text-sm h-9 xs:h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Position Filter */}
              <Select value={selectedPosition || "all"} onValueChange={setSelectedPosition}>
                <SelectTrigger className="border-gray-200 focus:border-primary text-xs xs:text-sm h-9 xs:h-10">
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
                <SelectTrigger className="border-gray-200 focus:border-primary text-xs xs:text-sm h-9 xs:h-10">
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
                    setMinAgeFilter(null);
                    setMaxAgeFilter(null);
                  }}
                  className="border-gray-200 text-primary hover:bg-primary/10 text-xs xs:text-sm h-9 xs:h-10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Filter + Charts */}
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 mb-6 xs:mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 xs:pb-4">
            <CardTitle className="text-sm xs:text-base sm:text-lg text-foreground">Age Filter & Visualizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-2">Filter by age (years)</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={minAgeFilter ?? ageMin}
                    min={ageMin}
                    max={ageMax}
                    onChange={(e) => setMinAgeFilter(e.target.value === '' ? null : Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="number"
                    value={maxAgeFilter ?? ageMax}
                    min={ageMin}
                    max={ageMax}
                    onChange={(e) => setMaxAgeFilter(e.target.value === '' ? null : Number(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    onClick={() => { setMinAgeFilter(null); setMaxAgeFilter(null); }}
                    className="ml-2"
                  >Clear</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Detected age range: {ageMin}–{ageMax}</p>
              </div>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48">
                  <p className="text-xs text-muted-foreground mb-2">Age Distribution</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={ageBuckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-48">
                  <p className="text-xs text-muted-foreground mb-2">Gender Breakdown</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={60} fill="#8884d8">
                        {genderData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={['#60a5fa', '#34d399', '#f97316', '#f43f5e'][idx % 4]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={20} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Top provinces (sample)</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={provinceData} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="province" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 pb-12 xs:pb-16">
        {loading ? (
          <div className="text-center py-12 xs:py-16">
            <div className="animate-spin rounded-full h-8 xs:h-12 w-8 xs:w-12 border-b-2 border-primary mx-auto mb-3 xs:mb-4"></div>
            <p className="text-muted-foreground text-sm xs:text-base">Loading candidates...</p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <>
            {/* Results Info */}
            <div className="mb-4 xs:mb-6 flex items-center justify-between flex-wrap gap-2 xs:gap-4">
              <div className="flex items-center gap-1 xs:gap-2 flex-wrap">
                <Badge className="bg-primary text-white px-2 xs:px-3 py-0.5 xs:py-1 text-xs xs:text-sm">
                  {filteredCandidates.length} result{filteredCandidates.length !== 1 ? 's' : ''}
                </Badge>
                {selectedPosition && (
                  <Badge variant="outline" className="border-secondary text-secondary text-xs xs:text-sm">
                    {selectedPosition}
                  </Badge>
                )}
                {selectedConstituency && (
                  <Badge variant="outline" className="border-accent text-accent text-xs xs:text-sm">
                    {selectedConstituency}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-6 xs:mb-8">
              {paginatedCandidates.map(candidate => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 flex-wrap">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="border-gray-200 text-xs xs:text-sm h-8 xs:h-9 px-2 xs:px-3"
                >
                  <ChevronLeft className="w-3 xs:w-4 h-3 xs:h-4" />
                  <span className="hidden xs:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1 xs:gap-2 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className={`text-xs xs:text-sm h-8 xs:h-9 px-2 xs:px-3 ${currentPage === page ? 'bg-primary text-white' : 'border-gray-200'}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="border-gray-200 text-xs xs:text-sm h-8 xs:h-9 px-2 xs:px-3"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="w-3 xs:w-4 h-3 xs:h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 xs:pt-12 sm:pt-16 pb-8 xs:pb-12 sm:pb-16 text-center">
              <Users className="w-12 xs:w-16 h-12 xs:h-16 text-primary/30 mx-auto mb-3 xs:mb-4" />
              <p className="text-sm xs:text-base sm:text-lg text-muted-foreground mb-4 xs:mb-6">No candidates found matching your filters</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPosition('');
                  setSelectedConstituency('');
                }}
                className="bg-primary hover:bg-primary/90 text-white text-xs xs:text-sm h-8 xs:h-9 px-3 xs:px-4"
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
