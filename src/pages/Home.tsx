import Header from '../components/Header';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Users, Lightbulb, Target, Heart } from 'lucide-react';
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
  personalInfo: {
    fullName: string;
    position: string;
    constituency: string;
    profilePhoto?: string;
    fullName_np?: string;
    age?: number;
    dateOfBirth?: string;
    gender?: string;
  };
  biography?: {
    bio_en: string;
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
  const navigate = useNavigate();
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 100]);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'np';

  // Search state
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fix stats undefined error
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
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
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
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
        c.ConstituencyName
      ];
      return fields.some(f => (f || '').toString().toLowerCase().includes(lower));
    });
    setSearchResults(filtered.slice(0, 10));
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

  // ...existing code...

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

  console.log(featuredPosts,"featuredPosts");
   
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
      <section className="flex flex-col items-center mt-4 mb-2 px-4" data-aos="fade-up" data-aos-delay="100">
        <div className="mb-4 text-center">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">{t('home.findCandidate', 'Find Your Candidate')}</h3>
          <p className="text-gray-600 text-base md:text-lg">{t('home.findCandidateDesc', 'Search for candidates by name, constituency, or party. Select a candidate to view their details and profile.')}</p>
        </div>
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="🔍 Search by candidate name"
            className="w-full px-5 py-3 rounded-xl border border-primary/60 focus:border-primary focus:ring-0 shadow-lg font-semibold text-gray-900 bg-white placeholder-gray-400 outline-none transition-all duration-200 text-lg"
            style={{ minHeight: '3rem', maxWidth: '100%', fontSize: '1.1rem', fontWeight: 600 }}
            autoComplete="off"
          />
          {searchLoading && (
            <div className="absolute right-3 top-3 text-gray-400 animate-spin">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            </div>
          )}
          {searchTerm.trim() && searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto">
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
                    alt={candidate.name || candidate.personalInfo?.fullName || candidate._id}
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

      {/* Featured Candidates Section */}
      <div data-aos="fade-up" data-aos-delay="200">
        <FeaturedCandidatesSection ageRange={ageRange} setAgeRange={setAgeRange} />
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


      {/* CPN Hero Banner Section (now plain background) */}
      <section className="py-8 bg-white" data-aos="fade-up" data-aos-delay="400">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-center">
              {t('home.knowCandidates', 'Know Our Candidates')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 text-center">
              {t('home.knowCandidatesDesc', 'Discover detailed information about our political candidates and their vision for the future')}
            </p>
            <Link to="/candidates">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90 px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 text-xs xs:text-sm sm:text-base font-semibold">
                {t('home.viewAllCandidates', 'View All Candidates')}
                <ArrowRight className="ml-1 xs:ml-2 w-3 xs:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-8 bg-white" data-aos="fade-up" data-aos-delay="500">
        <div className="container mx-auto">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-center">
              {t('home.featuredPosts', 'Featured Posts')}
            </h2>
            <div className="w-16 xs:w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
            <p className="text-base sm:text-lg text-gray-600 mt-2 mx-auto text-center">
              {t('home.featuredPosts.subtitle', 'Stay updated with the latest political developments, party news, and social initiatives.')}
            </p>
          </div>
          
          {loading.posts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted h-40 xs:h-48 w-full rounded-lg mb-2 xs:mb-4"></div>
                </div>
              ))}
            </div>
          ) : errors.posts ? (
            <div className="text-center text-red-600 py-4 xs:py-8">
              <p className="text-sm xs:text-base">{errors.posts}</p>
              <Button 
                variant="outline" 
                onClick={fetchFeaturedPosts}
                className="mt-2 xs:mt-4 text-xs xs:text-sm"
              >
                Retry Loading Posts
              </Button>
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="text-center text-gray-600 py-4 xs:py-8">
              <p className="text-sm xs:text-base">{t('home.noFeaturedPosts', 'No featured posts available at the moment.')}</p>
              <Link to="/news" className="inline-block mt-2 xs:mt-4">
                <Button variant="outline" size="sm" className="text-xs xs:text-sm">
                  {t('home.browseAllPosts', 'Browse All Posts')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
                {featuredPosts.map((post) => {
                  console.log(post,"post in home");
                  return(
                  <NewsCard 
                    key={post.id} 
                    id={post.id}
                    title={post.title}
                    excerpt={currentLanguage === 'np' ? post.excerpt_np : post.excerpt_en}
                    image={post.image}
                    category={post.category}
                    author={post.author.name}
                    publishedAt={post.publishedAt}
                    featured={post.featured}
                    content={post.content}
                  />
                )
                }
              
              )}
              </div>
              
              <div className="text-center mt-8 xs:mt-12">
                <Link to="/news">
                  <Button size="sm" className="bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 text-xs xs:text-sm sm:text-base">
                    {t('home.viewAll', 'View All Posts')}
                    <ArrowRight className="ml-1 xs:ml-2 w-3 xs:w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>


      <div data-aos="fade-up" data-aos-delay="600">
        <ModernYoutubeSection/>
      </div>
    </div>
  );
};

export default Home;