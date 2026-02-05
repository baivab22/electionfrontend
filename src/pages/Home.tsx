import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Users, Lightbulb, Target, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NewsCard from '@/components/NewsCard';
// import ModernYouTubeSection from '@/components/youtubeSection';
import API, { Post, StatsResponse } from '@/lib/api';
import { ModernYoutubeSection } from '@/components/youtubeSection';
import CandidateCard from '@/components/CandidateCard';
// import API, { Post, StatsResponse } from '@/services/api';

// Loading skeleton components
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
    ))}
  </div>
);

const PostsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(3)].map((_, index) => (
      <Card key={index} className="shadow-md">
        <CardContent className="p-0">
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <div className="p-6">
            <Skeleton className="h-6 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const CategoriesSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <Card key={index} className="shadow-md">
        <CardContent className="p-6 text-center">
          <Skeleton className="h-10 w-10 rounded mx-auto mb-4" />
          <Skeleton className="h-5 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </CardContent>
      </Card>
    ))}
  </div>
);

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

const FeaturedCandidatesSection: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://api.abhushangallery.com'}/api/candidates?limit=3`
        );
        if (response.ok) {
          const data = await response.json();
          setCandidates(data.data.slice(0, 3));
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Featured Candidates
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Meet some of our outstanding candidates leading the way to a brighter future
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-muted h-80 rounded-lg mb-4"></div>
              </div>
            ))}
          </div>
        ) : candidates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {candidates.map(candidate => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))}
            </div>
            <div className="text-center">
              <Link to="/candidates">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4">
                  View All Candidates
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Candidates coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'np';

  // State management
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

  // Load data on component mount and language change
  useEffect(() => {
    fetchFeaturedPosts();
    fetchStats();
    fetchCategories();
  }, [currentLanguage]);

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
      {/* Hero Section with Background Image */}
      <section className="relative text-white overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://scontent.fktm17-1.fna.fbcdn.net/v/t39.30808-6/359250480_804205261069872_879369025133702046_n.png?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=ssxSTS59sRsQ7kNvwFxuH1b&_nc_oc=Admvr-OWrw0Z3u_xHgkbtVIXmXrFqUfLSdZQFUGpjTYl4RSDRZWboWs92lrFf8hYrltJ1O2ay-ulCtWP0K-mCEfB&_nc_zt=23&_nc_ht=scontent.fktm17-1.fna&_nc_gid=wPtablTgZfR_tTMm6NbYzA&oh=00_AfuI5wm7PVe1uaxlY_yYBO0MH1IJjIwIOOLS3zd4lsEsxw&oe=69862F3F')"
          }}
        ></div>
        
        {/* Dark Overlay */}
        {/* <div className="absolute inset-0 bg-black/60"></div> */}
        
        {/* <div className="relative container mx-auto px-4 py-24 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.hero.title', 'Digital Nepal Initiative')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              {t('home.hero.subtitle', 'Empowering communities through technology, innovation, and social justice')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/about">
                <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white px-8 py-4">
                  {t('home.hero.learnMore', 'Learn More')}
                </Button>
              </Link>
              <Link to="/news">
                <Button size="lg" variant="outline" className="border-2 border-white text-black hover:bg-white hover:text-blue-900 px-8 py-4">
                  {t('home.hero.exploreNews', 'Explore News')}
                </Button>
              </Link>
            </div>
          </div>
        </div> */}
      </section>

      {/* Featured Candidates Section */}
      <FeaturedCandidatesSection />

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.impact.title', 'Our Impact')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
          </div>
          
          {loading.stats ? (
            <StatsSkeleton />
          ) : errors.stats ? (
            <div className="text-center text-red-600 py-8">
              <p>{errors.stats}</p>
              <Button 
                variant="outline" 
                onClick={fetchStats}
                className="mt-4"
              >
                Retry Loading Stats
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {displayStats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-primary via-accent to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CPN Hero Banner Section */}
      <section className="relative bg-gradient-to-r from-primary via-primary/80 to-accent text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              CPN - Building a Better Nepal
            </h2>
            <p className="text-xl md:text-2xl text-primary/20 mb-8">
              Meet our dedicated candidates committed to progress and prosperity
            </p>
            <Link to="/candidates">
              <Button size="lg" className="bg-white text-primary hover:bg-primary/10 text-lg px-8 py-4 font-semibold">
                View All Candidates
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.featuredPosts', 'Featured Posts')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {t('home.featuredPosts.subtitle', 'Stay updated with the latest political developments, party news, and social initiatives.')}
            </p>
          </div>
          
          {loading.posts ? (
            <PostsSkeleton />
          ) : errors.posts ? (
            <div className="text-center text-red-600 py-8">
              <p>{errors.posts}</p>
              <Button 
                variant="outline" 
                onClick={fetchFeaturedPosts}
                className="mt-4"
              >
                Retry Loading Posts
              </Button>
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <p>{t('home.noFeaturedPosts', 'No featured posts available at the moment.')}</p>
              <Link to="/news" className="inline-block mt-4">
                <Button variant="outline">
                  {t('home.browseAllPosts', 'Browse All Posts')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => {
                  console.log(post,"post in home");
                  return(
                  <NewsCard 
                    key={post.id} 
                    id={post.id}
                    // title={currentLanguage === 'np' ? post.title_np : post.title_en}
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
              
              <div className="text-center mt-12">
                <Link to="/news">
                  <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white px-8 py-4">
                    {t('home.viewAll', 'View All Posts')}
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.categories', 'Explore Categories')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {t('home.categories.subtitle', 'Explore different areas of party work and political engagement across Nepal.')}
            </p>
          </div>
          
          {loading.categories ? (
            <CategoriesSkeleton />
          ) : errors.categories ? (
            <div className="text-center text-red-600 py-8">
              <p>{errors.categories}</p>
              <Button 
                variant="outline" 
                onClick={fetchCategories}
                className="mt-4"
              >
                Retry Loading Categories
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category.key} to={`/news?category=${category.key}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {t(`categories.${category.key}`, category.key)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.count} {t('common.posts', 'posts')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>


      <ModernYoutubeSection/>
    </div>
  );
};

export default Home;