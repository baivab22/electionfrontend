import Header from '../components/Header';
import { provincesAndDistricts } from '../../constants/provincesAndDistricts';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Users, Lightbulb, Target, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NewsCard from '@/components/NewsCard';
import bannerImage from '@/assets/images/banner.png';
import mobileBannerImage from '@/assets/images/mobilebanner.png';
// import ModernYouTubeSection from '@/components/youtubeSection';
import API, { Post, StatsResponse } from '@/lib/api';
import { ModernYoutubeSection } from '@/components/youtubeSection';
import CandidateCard from '@/components/CandidateCard';
// import API, { Post, StatsResponse } from '@/services/api';
import ActivePolls from '@/components/ActivePolls';
import LivePollResults from '@/components/LivePollResults';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-6 sm:gap-8">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="text-center">
        <div className="w-12 xs:w-16 h-12 xs:h-16 rounded-full bg-muted mx-auto mb-2 xs:mb-4 animate-pulse" />
        <div className="h-6 xs:h-8 bg-muted w-12 mx-auto mb-1 xs:mb-2 rounded animate-pulse" />
        <div className="h-3 xs:h-4 bg-muted w-16 mx-auto rounded animate-pulse" />
      </div>
    ))}
  </div>
);

const PostsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="bg-muted h-40 xs:h-48 w-full rounded-lg mb-2 xs:mb-4"></div>
        <div className="bg-muted h-5 w-full rounded mb-2"></div>
        <div className="bg-muted h-3 w-3/4 rounded"></div>
      </div>
    ))}
  </div>
);

const CategoriesSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="animate-pulse bg-muted h-32 xs:h-40 rounded-lg"></div>
    ))}
  </div>
);

interface Candidate {
  _id: string;
  candidateId?: string;
  CandidateID?: string;
  name?: string;
  nepaliName?: string;
  englishName?: string;
  area?: string;
  provinceName?: string;
  profilepicture?: string;
  profilePhoto?: string;
  CandidateName?: string;
  PartyName?: string;
  ConstituencyName?: string;
  personalInfo?: {
    fullName?: string;
    fullName_np?: string;
    position?: string;
    constituency?: string;
    profilePhoto?: string;
    age?: number;
    dateOfBirth?: string;
    gender?: string;
  };
  biography?: {
    bio_en?: string;
    profilePhoto?: string;
  };
  politicalInfo?: {
    partyName?: string;
    partyName_np?: string;
    constituency?: string;
    candidacyLevel?: string;
  };
  education?: {
    highestQualification?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  achievements?: Array<any>;
  issues?: Array<any>;
}

interface FeaturedCandidatesSectionProps {
  ageRange: [number, number];
  setAgeRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}

const FeaturedCandidatesSection: React.FC<FeaturedCandidatesSectionProps> = ({ ageRange, setAgeRange }) => {
  const { t } = useTranslation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates?limit=8`
        );
        if (response.ok) {
          const data = await response.json();
          setCandidates(data.data.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  return (
    <>
      {/* Header is rendered globally in App.tsx */}
      <section className="py-12 xs:py-16 sm:py-24 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">{t('home.ourCandidates', 'हाम्रा उम्मेदवारहरू')}</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xs:gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="bg-muted h-60 xs:h-80 rounded-lg mb-2 xs:mb-4"></div>
                </div>
              ))}
            </div>
          ) : candidates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-8 xs:mb-12">
                {candidates.map(candidate => (
                  <CandidateCard key={candidate._id} candidate={candidate} />
                ))}
              </div>
              <div className="text-center">
                <Link to="/candidates">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 text-xs xs:text-sm sm:text-base">
                    View All Candidates
                    <ArrowRight className="ml-1 xs:ml-2 w-3 xs:w-5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-6 xs:py-8">
              <p className="text-sm xs:text-base">No candidates found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

interface HomeProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

const Home: React.FC<HomeProps> = ({ searchTerm, setSearchTerm }) => {

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    // Candidate filtering logic (reacts to all filters)
    const filteredCandidates = React.useMemo(() => {
      const lower = searchTerm.trim().toLowerCase();
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
      let filtered = Array.isArray(allCandidates) ? allCandidates : [];
      if (searchTerm.trim()) {
        filtered = filtered.filter(c => {
          const fields = [
            c.personalInfo?.fullName,
            c.personalInfo?.fullName_np,
            c.personalInfo?.constituency,
            c.politicalInfo?.partyName,
            c.politicalInfo?.constituency,
            c.name,
            c.nepaliName,
            c.englishName,
            c.CandidateName,
            c.PartyName,
            c.ConstituencyName,
            c.area,
            c.provinceName
          ];
          return fields.some(f => {
            const val = (f || '').toString().toLowerCase();
            return val.includes(lower) || transliterate(val).includes(lower);
          });
        });
      }
      if (selectedProvince && selectedProvince !== 'all') {
        const provinceObj = provincesAndDistricts.find(p => p.nepali_name === selectedProvince);
        if (provinceObj) {
          filtered = filtered.filter(c => c.provinceName === provinceObj.nepali_name);
        } else {
          filtered = [];
        }
      }
      if (selectedDistrict && selectedDistrict !== 'all') {
        filtered = filtered.filter((c) => {
          const areaVal = c.area || c.personalInfo?.constituency || '';
          if (!areaVal) return false;
          const firstWord = areaVal.split(/\s|-/)[0];
          return firstWord === selectedDistrict;
        });
      }
      return filtered;
    }, [allCandidates, searchTerm, selectedProvince, selectedDistrict]);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'np';
  // Search placeholder for hero search field
  const searchPlaceholder = currentLanguage === 'np'
    ? 'नाम खोज्नुहोस्...'
    : ' Search by candidate name...';
  const navigate = useNavigate();
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 100]);

  // Province/District filter state


  // Search state
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fix stats undefined error
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
    // Fetch latest posts from backend
    const fetchLatestPosts = async () => {
      try {
        setLoading(prev => ({ ...prev, posts: true }));
        setErrors(prev => ({ ...prev, posts: '' }));
        const response = await API.posts.getPosts({ limit: 4, language: currentLanguage });
        if (response.success && response.data) {
          setLatestPosts(response.data.slice(0, 4));
        } else {
          setErrors(prev => ({ ...prev, posts: 'Failed to load latest posts' }));
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, posts: 'Failed to load latest posts' }));
        setLatestPosts([]);
      } finally {
        setLoading(prev => ({ ...prev, posts: false }));
      }
    };
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    posts: true,
    stats: true,
    categories: true,
  });
  const [errors, setErrors] = useState({
    posts: '',
    stats: '',
    categories: '',
  });
  // Candidate search handler

  // Province/district filter logic for Home page
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    // Filter from allCandidates
    const lower = value.trim().toLowerCase();
    // Simple transliteration function for Nepali to Latin
    const transliterate = (str: string) => {
      // Replace Nepali characters with rough Latin equivalents
      // This is a basic mapping, for better results use a library
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
    const filtered = allCandidates.filter(c => {
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
        c.ConstituencyName,
        c.area,
        c.provinceName
      ];
      // Check normal and romanized match
      return fields.some(f => {
        const val = (f || '').toString().toLowerCase();
        return val.includes(lower) || transliterate(val).includes(lower);
      });
    });
    // Province/district filtering (mirroring Candidates.tsx logic)
    let provinceFiltered = filtered;
    if (selectedProvince && selectedProvince !== 'all') {
      const provinceObj = provincesAndDistricts.find(p => p.nepali_name === selectedProvince);
      if (provinceObj) {
        provinceFiltered = provinceFiltered.filter(c => c.provinceName === provinceObj.nepali_name);
      } else {
        provinceFiltered = [];
      }
    }


    console.log(provinceFiltered,"provinceFiltered",selectedProvince);
    if (selectedDistrict && selectedDistrict !== 'all') {
      provinceFiltered = provinceFiltered.filter((c) => {
        const areaVal = c.area || c.personalInfo?.constituency || '';
        if (!areaVal) return false;
        const firstWord = areaVal.split(/\s|-/)[0];
        return firstWord === selectedDistrict;
      });
    }
    setSearchResults(provinceFiltered.slice(0, 10));
    setSearchLoading(false);
  };

  useEffect(() => {
    // Fetch all candidates once on mount
    const fetchAllCandidates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates?limit=1000`
        );
        if (response.ok) {
          const data = await response.json();
          setAllCandidates(data.data || []);
        }
      } catch (error) {
        setAllCandidates([]);
      }
    };
    fetchAllCandidates();
    fetchLatestPosts();
  }, []);
  // Static category data with icons
  const staticCategories = [
    { key: 'technology', icon: '💻' },
    { key: 'digitalTransformation', icon: '🚀' },
    { key: 'socialJustice', icon: '⚖️' },
    { key: 'events', icon: '📅' },
    { key: 'innovation', icon: '💡' },
    { key: 'policy', icon: '📋' },
    { key: 'education', icon: '🎓' },
    { key: 'startups', icon: '🏢' },
  ];

  // Fetch featured posts
  const fetchFeaturedPosts = async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }));
      setErrors(prev => ({ ...prev, posts: '' }));
      
      const response = await API.posts.getFeaturedPosts(currentLanguage);
      
      if (response.success && response.data) {
        setFeaturedPosts(response.data.slice(0, 3)); // Take only first 3 posts
      } else {
        setErrors(prev => ({ ...prev, posts: 'Failed to load featured posts' }));
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      setErrors(prev => ({ 
        ...prev, 
        posts: API.utils.formatErrorMessage(error)
      }));
      
      // Fallback to empty array or you could use mock data
      setFeaturedPosts([]);
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setErrors(prev => ({ ...prev, stats: '' }));
      
      const response = await API.stats.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setErrors(prev => ({ ...prev, stats: 'Failed to load statistics' }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setErrors(prev => ({ 
        ...prev, 
        stats: API.utils.formatErrorMessage(error)
      }));
      
      // Fallback stats will be handled by the API service
      setStats(null);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch category data with post counts
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setErrors(prev => ({ ...prev, categories: '' }));
      
      // Fetch posts for each category to get counts
      const categoryPromises = staticCategories.map(async (category) => {
        try {
          const response = await API.posts.getPostsByCategory(category.key, currentLanguage);
          return {
            ...category,
            count: response.success ? response.count : 0,
          };
        } catch (error) {
          console.error(`Error fetching ${category.key} posts:`, error);
          return {
            ...category,
            count: 0,
          };
        }
      });

      const categoriesWithCounts = await Promise.all(categoryPromises);
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrors(prev => ({ 
        ...prev, 
        categories: API.utils.formatErrorMessage(error)
      }));
      
      // Fallback to static categories without counts
      setCategories(staticCategories.map(cat => ({ ...cat, count: 0 })));
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };



  // Handler for selecting candidate from search results
  const handleCandidateSelect = (candidateId: string) => {
    navigate(`/candidate/${candidateId}`);
  };

  // Generate stats display data
  const displayStats = stats ? [
    { 
      icon: Users, 
      value: `${stats.totalUsers}+`, 
      label: 'Party Members' 
    },
    { 
      icon: Globe, 
      value: `${stats.publishedPosts}+`, 
      label: 'Candidates' 
    },
    { 
      icon: Lightbulb, 
      value: `${stats.featuredPosts}+`, 
      label: 'Community Chapters' 
    },
    { 
      icon: Target, 
      value: `${Math.round(stats.totalViews / 1000)}K+`, 
      label: 'Grassroots Initiatives' 
    },
  ] : [];

  // console.log(latestPosts,"latestPosts");
   
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image - Full Screen Width */}
      <section className="relative text-white overflow-hidden min-h-[60vh] flex items-center w-screen" data-aos="fade-up">
        <picture className="w-full h-full flex justify-center items-center">
          <source media="(max-width: 639px)" srcSet={mobileBannerImage} />
          <img
            src={bannerImage}
            alt="banner"
            className="w-full h-full object-contain object-center block"
            style={{ zIndex: 0, background: '#000' }}
          />
        </picture>
        <div className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center py-16 text-center">
          {/* Add hero content here if needed */}
        </div>
      </section>

      {/* Modern Search UI with description */}
      <section className="flex flex-col items-center mt-8 mb-4 px-4" data-aos="fade-up" data-aos-delay="100">
        <div className="mb-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary mb-4">{t('home.findCandidate', 'Find Your Candidate')}</h3>
          <p className="text-gray-600 text-base md:text-lg mb-6">{t('home.findCandidateDesc', 'Search for candidates by name, constituency, or party. Select a candidate to view their details and profile.')}</p>
        </div>
        <div className="relative w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="candidate-search"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full h-10 pl-10 pr-5 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none border border-gray-300 focus:border-primary focus:ring-0 font-semibold text-gray-900 bg-white placeholder-gray-400 outline-none text-base"
                  autoComplete="off"
                  style={{ boxShadow: 'none', borderRight: 'none' }}
                />
              </div>
            </div>
            <div className="h-px sm:h-10 sm:w-px bg-gray-300 mx-0" />
            <div className="relative w-full sm:w-40">
              <Select value={selectedProvince} onValueChange={value => { setSelectedProvince(value); setSelectedDistrict(''); }}>
                <SelectTrigger className="w-full h-10 text-xs xs:text-sm border-gray-200 rounded-none">
                  <SelectValue placeholder={t('candidates.province', 'प्रदेश छान्नुहोस्')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('candidates.allProvinces', 'All Provinces')}</SelectItem>
                  {provincesAndDistricts.map(p => (
                    <SelectItem key={p.id} value={p.nepali_name}>{p.nepali_name} ({p.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-px sm:h-10 sm:w-px bg-gray-300 mx-0" />
            <div className="relative w-full sm:w-40">
              <Select value={selectedDistrict} onValueChange={value => setSelectedDistrict(value)} disabled={!selectedProvince}>
                <SelectTrigger className="w-full h-10 text-xs xs:text-sm border-gray-200 rounded-none">
                  <SelectValue placeholder={t('candidates.district', 'जिल्ला छान्नुहोस्')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('candidates.allDistricts', 'All Districts')}</SelectItem>
                  {(selectedProvince && selectedProvince !== 'all'
                    ? (provincesAndDistricts.find(p => p.nepali_name === selectedProvince)?.districtList || [])
                    : [])
                    .map(d => (
                      <SelectItem key={d.id} value={d.nepali_name}>{d.nepali_name} ({d.name})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Search Results Dropdown - now below the whole filter row */}
          {searchTerm.trim() && searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto" style={{top: '100%', minWidth: '100%'}}>
              {searchResults.map(candidate => (
                <li
                  key={candidate._id}
                  className="px-4 py-3 cursor-pointer hover:bg-primary/10 transition-all text-base flex items-center gap-5"
                  onClick={() => handleCandidateSelect(candidate._id)}
                >
                  <img
                    src={
                      candidate.profilepicture || candidate.profilePhoto || candidate.personalInfo?.profilePhoto ||
                      `https://result.election.gov.np/Images/Candidate/${candidate.candidateId || candidate.CandidateID || ''}.jpg`
                    }
                    alt={candidate.name || candidate.personalInfo?.fullName || candidate.nepaliName || candidate.englishName || candidate.CandidateName || candidate._id}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">
                      {candidate.name || candidate.personalInfo?.fullName || candidate.nepaliName || candidate.englishName || candidate.CandidateName || candidate._id}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {candidate.area || candidate.personalInfo?.constituency || ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">{t('home.ourCandidates', 'हाम्रा उम्मेदवारहरू')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-8 xs:mb-12">
          {(filteredCandidates.length > 0
            ? filteredCandidates.slice(0, 8)
            : (Array.isArray(allCandidates) ? allCandidates.slice(0, 8) : [])
          ).map(candidate => (
            <CandidateCard key={candidate._id} candidate={candidate} />
          ))}
        </div>
        {(filteredCandidates.length === 0 && (searchTerm.trim() || (selectedProvince && selectedProvince !== 'all') || (selectedDistrict && selectedDistrict !== 'all'))) && (
          <div className="text-center text-muted-foreground py-6 xs:py-8">
            <p className="text-sm xs:text-base">No candidates found.</p>
          </div>
        )}
        <div className="text-center">
          <Link to="/candidates">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 text-xs xs:text-sm sm:text-base">
              View All Candidates
              <ArrowRight className="ml-1 xs:ml-2 w-3 xs:w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Results Dropdown Example (if implemented) */}
      {/*
      {searchResults.length > 0 && (
        <ul className="search-dropdown">
          {searchResults.map(candidate => (
            <li key={candidate._id} onClick={() => handleCandidateSelect(candidate._id)}>
              {candidate.personalInfo?.fullName || candidate._id}
            </li>
          ))}
        </ul>
      )}
      */}


      {/* Polls Section: Results and Participate side by side */}
      <section className="py-8 bg-gradient-to-b from-white to-gray-50" data-aos="fade-up" data-aos-delay="300">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <ActivePolls />
            </div>
            <div>
              <LivePollResults />
            </div>
          </div>
        </div>
      </section>




      {/* Latest Posts Section (News & Forum style) */}
      <section className="py-8 bg-white" data-aos="fade-up" data-aos-delay="500">
        <div className="container mx-auto">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-center">
              {t('home.latestPosts', 'Latest Posts')}
            </h2>
            <div className="w-16 xs:w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
            <p className="text-base sm:text-lg text-gray-600 mt-2 mx-auto text-center">
              {t('home.latestPosts.subtitle', 'Read the latest posts, news, and forum updates.')}
            </p>
          </div>
          {loading.posts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted h-60 xs:h-80 w-full rounded-lg mb-2 xs:mb-4"></div>
                  <div className="bg-muted h-5 w-full rounded mb-2"></div>
                  <div className="bg-muted h-3 w-3/4 rounded"></div>
                </div>
              ))}
            </div>
          ) : errors.posts ? (
            <div className="text-center text-red-600 py-4 xs:py-8">
              <p className="text-sm xs:text-base">{errors.posts}</p>
              <Button 
                variant="outline" 
                onClick={fetchLatestPosts}
                className="mt-2 xs:mt-4 text-xs xs:text-sm"
              >
                Retry Loading Posts
              </Button>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="text-center text-gray-600 py-4 xs:py-8">
              <p className="text-sm xs:text-base">{t('home.noPosts', 'No posts available at the moment.')}</p>
              <Link to="/news" className="inline-block mt-2 xs:mt-4">
                <Button variant="outline" size="sm" className="text-xs xs:text-sm">
                  {t('home.browseAllPosts', 'Browse All Posts')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
                {latestPosts.map((post) => (
                  <NewsCard 
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    excerpt={currentLanguage === 'np' ? post.excerpt_np : post.excerpt_en}
                    image={post.image}
                    category={post.category}
                    author={post.author?.name || 'Anonymous'}
                    publishedAt={post.publishedAt}
                    featured={post.featured}
                    content={post.content}
                  />
                ))}
                {/* Fill with skeletons if less than 4 posts */}
                {latestPosts.length < 4 && [...Array(4 - latestPosts.length)].map((_, idx) => (
                  <div key={"skeleton-"+idx} className="animate-pulse">
                    <div className="bg-muted h-60 xs:h-80 w-full rounded-lg mb-2 xs:mb-4"></div>
                    <div className="bg-muted h-5 w-full rounded mb-2"></div>
                    <div className="bg-muted h-3 w-3/4 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 xs:mt-12">
                <Link to="/news">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 text-xs xs:text-sm sm:text-base">
                    {t('home.viewAll', 'View All Posts')}
                    <ArrowRight className="ml-1 xs:ml-2 w-3 xs:w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )
          }
        </div>
      </section>


      <div data-aos="fade-up" data-aos-delay="600">
        <ModernYoutubeSection/>
      </div>
    </div>
  );
};

export default Home;