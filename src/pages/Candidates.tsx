import React, { useState, useEffect, useMemo } from 'react';
import { provincesAndDistricts } from '../../constants/provincesAndDistricts';
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
import { useTranslation } from 'react-i18next';
import { Search, Users, Target, Award, ChevronLeft, ChevronRight } from 'lucide-react';

// Add range slider styling
const rangeSliderStyles = `
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: white;
    border: 2px solid #e5e7eb;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  input[type="range"]::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: white;
    border: 2px solid #e5e7eb;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  input[type="range"]::-webkit-slider-runnable-track {
    background: transparent;
    height: 0.5rem;
  }

  input[type="range"]::-moz-range-track {
    background: transparent;
    border: none;
  }
`;
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
    fullName_np?: string;
    position?: string;
    constituency?: string;
    profilePhoto?: string;
    dateOfBirth?: string;
    dateOfBirth_raw?: string;
    gender?: string;
    contactNumber?: string;
  };
  biography?: {
    bio_en?: string;
    bio_np?: string;
    profilePhoto?: string;
  };
  politicalInfo?: {
    partyName?: string;
    constituency?: string;
    candidacyLevel?: string;
  };
  achievements?: Array<any>;
  issues?: Array<any>;
}

const CandidatesPage: React.FC = () => {
    const { t } = useTranslation();
  // Get actual age from candidate with proper priority
  const getCandidateAge = (candidate: any): number | null => {
    // Priority 1: Use rawSource.AGE_YR if available
    if (candidate?.rawSource?.AGE_YR && candidate.rawSource.AGE_YR > 0) {
      return candidate.rawSource.AGE_YR;
    }
    
    // Priority 2: Use personalInfo.age if available
    if (candidate?.personalInfo?.age && candidate.personalInfo.age > 0) {
      return candidate.personalInfo.age;
    }
    
    // Priority 3: Use parseAge to calculate
    return parseAge(candidate?.personalInfo?.dateOfBirth || candidate?.personalInfo?.dateOfBirth_raw);
  };

  // Age parser: handles BS (Bikram Sambat) dates. Current BS year is 2082.
  // Returns integer years or null if invalid/unrealistic
  const parseAge = (dobRaw: any): number | null => {
    if (!dobRaw) return null;
    const s = String(dobRaw).trim();
    let y: number|undefined, m: number|undefined, d: number|undefined;
    const parts = s.split(/[\/\-\.\s]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD
        y = Number(parts[0]); m = Number(parts[1]) - 1; d = Number(parts[2]);
      } else { // assume DD-MM-YYYY
        y = Number(parts[2]); m = Number(parts[1]) - 1; d = Number(parts[0]);
      }
    } else if (typeof dobRaw === 'number') {
      const dt = new Date(dobRaw);
      if (!isNaN(dt.getTime())) { y = dt.getFullYear(); m = dt.getMonth(); d = dt.getDate(); }
    } else {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) { y = dt.getFullYear(); m = dt.getMonth(); d = dt.getDate(); }
    }

    if (y === undefined || m === undefined || d === undefined) return null;
    
    // Check for default date (1970-01-01) - invalid data from database
    if (y === 1970 && m === 0 && d === 1) return null;
    
    // Data is in BS (Bikram Sambat) format
    // Current BS year is 2082
    // Age = Current BS year - Birth BS year
    if (y >= 1940 && y <= 2082) {
      const currentBsYear = 2082;
      const age = currentBsYear - y;
      if (age >= 0 && age <= 120) return age;
    }

    // Fallback to AD calculation if BS calculation fails
    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;

    if (age < 0 || age > 120) return null;
    return age;
  };
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedStateName, setSelectedStateName] = useState('');
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
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  console.log('Fetched candidates:', candidates);



  // Derived age stats
  const ages = useMemo(() => {
    return candidates
      .map(c => getCandidateAge(c))
      .filter(a => a !== null) as number[];
  }, [candidates]);
  const ageMin = ages.length ? Math.min(...ages) : 18;
  const ageMax = ages.length ? Math.max(...ages) : 80;

  // Filter candidates by search term (Nepali or romanized name)
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    // Search filter (Nepali or romanized)
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      // Simple transliteration function for Nepali to Latin
      const transliterate = (str: string) => {
        return str
          .replace(/[अआ]/g, 'a')
          .replace(/[इई]/g, 'i')
          .replace(/[उऊ]/g, 'u')
          .replace(/[ए]/g, 'e')
          .replace(/[ओ]/g, 'o')
          .replace(/[क]/g, 'k')
          .replace(/[ख]/g, 'kh')
          .replace(/[ग]/g, 'g')
          .replace(/[घ]/g, 'gh')
          .replace(/[च]/g, 'ch')
          .replace(/[छ]/g, 'chh')
          .replace(/[ज]/g, 'j')
          .replace(/[झ]/g, 'jh')
          .replace(/[ट]/g, 't')
          .replace(/[ठ]/g, 'th')
          .replace(/[ड]/g, 'd')
          .replace(/[ढ]/g, 'dh')
          .replace(/[ण]/g, 'n')
          .replace(/[त]/g, 't')
          .replace(/[थ]/g, 'th')
          .replace(/[द]/g, 'd')
          .replace(/[ध]/g, 'dh')
          .replace(/[न]/g, 'n')
          .replace(/[प]/g, 'p')
          .replace(/[फ]/g, 'ph')
          .replace(/[ब]/g, 'b')
          .replace(/[भ]/g, 'bh')
          .replace(/[म]/g, 'm')
          .replace(/[य]/g, 'y')
          .replace(/[र]/g, 'r')
          .replace(/[ल]/g, 'l')
          .replace(/[व]/g, 'w')
          .replace(/[श]/g, 'sh')
          .replace(/[ष]/g, 'sh')
          .replace(/[स]/g, 's')
          .replace(/[ह]/g, 'h')
          .replace(/[ृ]/g, 'ri')
          .replace(/[ं]/g, 'n')
          .replace(/[ः]/g, 'h')
          .replace(/[ँ]/g, 'n')
          .replace(/[्]/g, '')
          .replace(/[ा]/g, 'a')
          .replace(/[ि]/g, 'i')
          .replace(/[ी]/g, 'i')
          .replace(/[ु]/g, 'u')
          .replace(/[ू]/g, 'u')
          .replace(/[े]/g, 'e')
          .replace(/[ै]/g, 'ai')
          .replace(/[ो]/g, 'o')
          .replace(/[ौ]/g, 'au');
      };
      filtered = filtered.filter(c => {
        const fields = [
          c.personalInfo?.fullName,
          c.name,
          c.personalInfo?.fullName_np,
          c.politicalInfo?.partyName,
          c.politicalInfo?.partyName_np,
          c.personalInfo?.constituency,
          c.politicalInfo?.constituency,
          c.nepaliName,
          c.englishName,
          c.CandidateName,
          c.PartyName,
          c.ConstituencyName
        ];
        return fields.some(f => {
          const val = (f || '').toString().toLowerCase();
          return val.includes(term) || transliterate(val).includes(term);
        });
      });
    }
    // Province filter
        if (selectedProvince && selectedProvince !== 'all') {
          filtered = filtered.filter(c => c.StateName === selectedProvince);
    }
    // District filter (after province)
    if (selectedDistrict && selectedDistrict !== 'all') {
      filtered = filtered.filter(c => c.personalInfo?.district === selectedDistrict || c.politicalInfo?.district === selectedDistrict || c.DistrictName === selectedDistrict);
    }
    // Age filter
    if (minAgeFilter !== null || maxAgeFilter !== null) {
      filtered = filtered.filter(c => {
        const age = getCandidateAge(c);
        if (age === null) return false;
        if (minAgeFilter !== null && age < minAgeFilter) return false;
        if (maxAgeFilter !== null && age > maxAgeFilter) return false;
        return true;
      });
    }
    return filtered;
  }, [candidates, searchTerm, selectedPosition, selectedConstituency, selectedDistrict, selectedProvince, minAgeFilter, maxAgeFilter]);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const constituencies = [...new Set(
    candidates.map(c => c.personalInfo?.constituency || c.politicalInfo?.constituency || 'Unknown')
      .filter(Boolean)
  )];
  // Province options from constants
      const provinceOptions = useMemo(() => {
        return [...new Set(candidates.map(c => c.StateName).filter(Boolean))];
      }, [candidates]);

  // District options depend on selectedProvince
      const districtOptions = useMemo(() => {
        if (!selectedProvince || selectedProvince === 'all') {
          // Show all districts if no province selected
          return [...new Set(candidates.map(c => c.personalInfo?.district || c.politicalInfo?.district || c.DistrictName).filter(Boolean))];
        }
        // Find all districts for candidates in the selected province
        return [...new Set(
          candidates
            .filter(c => c.StateName === selectedProvince)
            .map(c => c.personalInfo?.district || c.politicalInfo?.district || c.DistrictName)
        )].filter(Boolean);
      }, [selectedProvince, candidates]);
  const stateNames = [...new Set(
    candidates.map(c => c.StateName || '').filter(Boolean)
  )];

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
      const p = (c.personalInfo?.position || 'Unknown').toString();
      map[p] = (map[p] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ province: k, count: map[k] })).slice(0, 12);
  }, [candidates]);

  // Get count of candidates from नेपाली कम्युनिष्ट पार्टी (the party being displayed)
  const partyFilteredCandidates = useMemo(() => {
    return candidates.filter(
      c => (c.politicalInfo?.partyName || '').trim() === 'नेपाली कम्युनिष्ट पार्टी'
    );
  }, [candidates]);

  const stats = [
    {
      label: t('candidates.total', 'Total Candidates'),
      value: candidates.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: t('candidates.parliamentary', 'Parliamentary Candidates'),
      value: partyFilteredCandidates.filter(c => c.personalInfo.position === 'Parliamentary').length,
      icon: Target,
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      label: t('candidates.provincial', 'Provincial Candidates'),
      value: partyFilteredCandidates.filter(c => c.personalInfo.position === 'Provincial').length,
      icon: Award,
      color: 'bg-emerald-100 text-emerald-600'
    }
  ];

  const hasActiveFilters = searchTerm || (selectedPosition && selectedPosition !== 'all') || selectedConstituency;

  return (
    <>
      <style>{rangeSliderStyles}</style>
      <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-primary text-white py-8 xs:py-12 sm:py-16 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-2 xs:mb-4">{t('candidates.know', 'Know Our Candidates')}</h1>
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-white/90 px-2">
            {t('candidates.desc', 'Discover detailed information about our political candidates and their vision for the future')}
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
            <CardTitle className="text-sm xs:text-base sm:text-lg text-foreground">{t('candidates.filter', 'Filter Candidates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 xs:gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                              <Search className="absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-muted-foreground" />
                              <Input
                                placeholder={t('candidates.searchPlaceholder', 'Search by name...')}
                                className="pl-8 xs:pl-10 border-gray-200 focus:border-primary text-xs xs:text-sm h-9 xs:h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>

              {/* Province Filter */}
              <Select value={selectedProvince || "all"} onValueChange={value => {
                setSelectedProvince(value === "all" ? '' : value);
                setSelectedDistrict(''); // Reset district when province changes
              }}>
                <SelectTrigger className="border-gray-200 focus:border-primary text-xs xs:text-sm h-9 xs:h-10">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('candidates.allProvinces', 'All Provinces')}</SelectItem>
                  {provinceOptions.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* District Filter (depends on province) */}
              <Select value={selectedDistrict || "all"} onValueChange={value => setSelectedDistrict(value === "all" ? '' : value)}>
                <SelectTrigger className="border-gray-200 focus:border-primary text-xs xs:text-sm h-9 xs:h-10">
                  <SelectValue placeholder={selectedProvince ? "Select District" : "Select Province first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('candidates.allDistricts', 'All Districts')}</SelectItem>
                  {districtOptions.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDistrict('');
                    setSelectedProvince('');
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
    </>
  );
};

export default CandidatesPage;
