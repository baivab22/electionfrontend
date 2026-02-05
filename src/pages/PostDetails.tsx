import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, AlertCircle, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import NewsCard from '@/components/NewsCard';
import API from '@/lib/api';

interface Author {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: string;
  author: Author | string;
  authorBio?: string;
  authorImage?: string;
  publishedAt: string;
  readTime?: string;
  tags?: string[];
  excerpt?: string;
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  author: Author | string;
  publishedAt: string;
}

// Social Media Icons
const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedInIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.863 3.488"/>
  </svg>
);

const TelegramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const RedditIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const EmailIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Error Boundary Component
class PostErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PostDetails Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              Something went wrong displaying this post. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Sanitize HTML content
const sanitizeContent = (content: string): string => {
  if (!content) return '';
  
  try {
    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
    
    return sanitized;
  } catch (error) {
    console.error('Error sanitizing content:', error);
    return '';
  }
};

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const API_URL = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_URL || 'https://api.abhushangallery.com/api'
    : import.meta.env.VITE_DEV_URL || 'http://localhost:3000/api';
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSocialPlugin, setShowSocialPlugin] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [id, i18n.language]);

  const fetchPostDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const language = i18n.language === 'np' ? 'np' : 'en';
      const response = await API.posts.getPost(id, language);
      
      setPost(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load post details');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

      const API_ASSET_URL = 
 import.meta.env.MODE === 'production'
   ? import.meta.env.VITE_PROD_URL ||
  
  'https://api.abhushangallery.com/'
  :
    import.meta.env.VITE_DEV_URL || 'http://localhost:3000/';

  const getImageUrl = () => {
    if (!post?.image) return '/placeholder-image.jpg';
    
    if (post.image.startsWith('http://') || post.image.startsWith('https://')) {
      return post.image;
    }
    
    return `${API_ASSET_URL}uploads/posts/${post.image}`;
  };

  const getAuthorName = (author: Author | string): string => {
    return typeof author === 'string' ? author : author.name;
  };

  const getAuthorAvatar = (author: Author | string): string | undefined => {
    if (typeof author === 'object' && author.avatar) {
      return author.avatar;
    }
    return post?.authorImage;
  };

  const getAuthorBio = (author: Author | string): string | undefined => {
    if (typeof author === 'object' && author.bio) {
      return author.bio;
    }
    return post?.authorBio;
  };

  const getCategoryColor = (cat: string): string => {
    const colors: { [key: string]: string } = {
      technology: 'bg-blue-100 text-blue-800 border-blue-200',
      digitalTransformation: 'bg-green-100 text-green-800 border-green-200',
      socialJustice: 'bg-purple-100 text-purple-800 border-purple-200',
      events: 'bg-orange-100 text-orange-800 border-orange-200',
      innovation: 'bg-teal-100 text-teal-800 border-teal-200',
      policy: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      education: 'bg-pink-100 text-pink-800 border-pink-200',
      startups: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const postUrl = window.location.href;
  const encodedTitle = encodeURIComponent(post?.title || '');
  const encodedUrl = encodeURIComponent(postUrl);

  const socialShareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
  };

  const handleSocialShare = (platform: string) => {
    const url = socialShareLinks[platform as keyof typeof socialShareLinks];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      setShowSocialPlugin(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Post link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <PostDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center space-x-4">
            <Button onClick={fetchPostDetails} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate('/news')} variant="default">
              Back to News
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <Button onClick={() => navigate('/news')}>
            <ArrowLeft className="mr-2" size={20} />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PostErrorBoundary>
      <div className="min-h-screen bg-gray-50 relative">
        
        {/* Social Media Plugin - Fixed Position */}
        {showSocialPlugin && (
          <div 
            className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50 bg-white rounded-l-xl xs:rounded-l-2xl shadow-2xl border border-gray-200 p-2 xs:p-3 flex flex-col gap-1.5 xs:gap-2 max-w-[200px] xs:max-w-none"
            style={{
              animation: 'slideIn 0.3s ease-out forwards'
            }}
          >
            <style>{`
              @keyframes slideIn {
                from {
                  transform: translateX(100%) translateY(-50%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0) translateY(-50%);
                  opacity: 1;
                }
              }
            `}</style>
            
            <button
              onClick={() => setShowSocialPlugin(false)}
              className="absolute -left-6 xs:-left-8 top-1/2 -translate-y-1/2 bg-white rounded-l-lg shadow-lg border border-gray-200 p-1.5 xs:p-2 hover:bg-gray-50 transition-colors"
              title="Close"
            >
              <X size={16} className="text-gray-600" />
            </button>
            
            <div className="flex flex-col gap-1 xs:gap-2">
              <p className="text-[10px] xs:text-xs font-semibold text-gray-700 px-1.5 xs:px-2 pb-1 border-b border-gray-200">
                Share Article
              </p>
              
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-200 hover:scale-105"
                title="Share on Facebook"
              >
                <FacebookIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-all duration-200 hover:scale-105"
                title="Share on Twitter"
              >
                <TwitterIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-all duration-200 hover:scale-105"
                title="Share on LinkedIn"
              >
                <LinkedInIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">LinkedIn</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-green-50 text-green-600 transition-all duration-200 hover:scale-105"
                title="Share on WhatsApp"
              >
                <WhatsAppIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-all duration-200 hover:scale-105"
                title="Share on Telegram"
              >
                <TelegramIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">Telegram</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('reddit')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-all duration-200 hover:scale-105"
                title="Share on Reddit"
              >
                <RedditIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">Reddit</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('email')}
                className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-200 hover:scale-105"
                title="Share via Email"
              >
                <EmailIcon size={16} />
                <span className="text-xs xs:text-sm font-medium">Email</span>
              </button>
              
              <div className="border-t border-gray-200 pt-1.5 xs:pt-2">
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg w-full transition-all duration-200 hover:scale-105 ${
                    copied 
                      ? 'bg-green-50 text-green-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  title={copied ? "Link copied!" : "Copy link"}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-xs xs:text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Share Button - Fixed Position */}
        {!showSocialPlugin && (
          <button
            onClick={() => setShowSocialPlugin(true)}
            className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-l-lg shadow-lg p-2 xs:p-3 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 hover:pr-3 xs:hover:pr-4 group/share"
            title="Share this article"
          >
            <Share2 className="w-4 xs:w-[18px] h-4 xs:h-[18px] group-hover/share:scale-110 transition-transform" />
          </button>
        )}

        {/* Back Navigation */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-3 xs:px-4 py-2 xs:py-3 sm:py-4">
            <Link to="/news">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 h-8 xs:h-9 sm:h-10 text-xs xs:text-sm sm:text-base px-2 xs:px-3 sm:px-4">
                <ArrowLeft className="mr-1 xs:mr-2 w-4 xs:w-5 h-4 xs:h-5" />
                Back to News
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <section className="py-6 xs:py-8 sm:py-12 bg-white">
          <div className="container mx-auto px-3 xs:px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 xs:mb-6">
                <Badge className={`${getCategoryColor(post.category)} border mb-3 xs:mb-4 text-xs xs:text-sm`}>
                  {t(`categories.${post.category}`)}
                </Badge>
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3 xs:mb-4 sm:mb-6">
                  {post.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 xs:gap-3 sm:gap-4 md:gap-6 text-gray-600 mb-4 xs:mb-6 sm:mb-8 text-xs xs:text-sm sm:text-base">
                <div className="flex items-center space-x-1 xs:space-x-2">
                  <User className="w-3.5 xs:w-4 sm:w-[18px] h-3.5 xs:h-4 sm:h-[18px]" />
                  <span>{getAuthorName(post.author)}</span>
                </div>
                <div className="flex items-center space-x-1 xs:space-x-2">
                  <Calendar className="w-3.5 xs:w-4 sm:w-[18px] h-3.5 xs:h-4 sm:h-[18px]" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                {post.readTime && (
                  <div className="text-xs xs:text-sm">
                    {post.readTime}
                  </div>
                )}
              </div>

              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 xs:mb-6 sm:mb-8 gap-3 xs:gap-4">
                <div className="flex flex-wrap gap-1.5 xs:gap-2">
                  {post.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-[10px] xs:text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-1.5 xs:space-x-2">
                  <Button variant="outline" size="sm" className="h-7 xs:h-8 sm:h-9 text-xs xs:text-sm px-2 xs:px-3">
                    <Heart className="w-3 xs:w-4 h-3 xs:h-4 mr-1" />
                    Like
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSocialPlugin(true)}
                    className="h-7 xs:h-8 sm:h-9 text-xs xs:text-sm px-2 xs:px-3"
                  >
                    <Share2 className="w-3 xs:w-4 h-3 xs:h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.image && (
          <section className="pb-6 xs:pb-8 sm:pb-12 bg-white">
            <div className="container mx-auto px-3 xs:px-4">
              <div className="max-w-4xl mx-auto">
                <img
                  src={getImageUrl()}
                  alt={post.title}
                  className="w-full h-48 xs:h-56 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="pb-8 xs:pb-12 sm:pb-16 bg-white">
          <div className="container mx-auto px-3 xs:px-4">
            <div className="max-w-4xl mx-auto">
              {post.content ? (
                <div 
                  className="prose prose-sm xs:prose sm:prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeContent(post.content) }}
                />
              ) : (
                <p className="text-gray-600 text-sm xs:text-base sm:text-lg">No content available.</p>
              )}
            </div>
          </div>
        </section>

        {/* Author Bio */}
        {(getAuthorBio(post.author) || typeof post.author === 'object') && (
          <section className="py-6 xs:py-8 sm:py-12 bg-gray-50">
            <div className="container mx-auto px-3 xs:px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 xs:p-6 sm:p-8">
                    <div className="flex flex-col xs:flex-row items-center xs:items-start gap-4 xs:gap-5 sm:gap-6">
                      {getAuthorAvatar(post.author) && (
                        <img
                          src={getAuthorAvatar(post.author)}
                          alt={getAuthorName(post.author)}
                          className="w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 rounded-full object-cover border-4 border-green-500 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 text-center xs:text-left">
                        <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-1 xs:mb-2">
                          {getAuthorName(post.author)}
                        </h3>
                        {getAuthorBio(post.author) && (
                          <p className="text-gray-600 mb-3 xs:mb-4 text-xs xs:text-sm sm:text-base">
                            {getAuthorBio(post.author)}
                          </p>
                        )}
                        <div className="flex justify-center xs:justify-start space-x-2 xs:space-x-3 sm:space-x-4">
                          <Button variant="outline" size="sm" className="h-7 xs:h-8 sm:h-9 text-xs xs:text-sm">Follow</Button>
                          <Button variant="outline" size="sm" className="h-7 xs:h-8 sm:h-9 text-xs xs:text-sm">
                            <MessageCircle className="w-3 xs:w-4 h-3 xs:h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-8 xs:py-12 sm:py-16 bg-white">
            <div className="container mx-auto px-3 xs:px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-6 xs:mb-8 sm:mb-12">
                  <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
                    {t('post.relatedPosts')}
                  </h2>
                  <div className="w-16 xs:w-20 sm:w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6 sm:gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <NewsCard key={relatedPost.id} {...relatedPost} content="" viewCount={0} commentCount={0} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </PostErrorBoundary>
  );
};

// Loading Skeleton Component
const PostDetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-3 xs:px-4 py-2 xs:py-3 sm:py-4">
          <Skeleton className="h-8 xs:h-9 sm:h-10 w-28 xs:w-32 sm:w-40" />
        </div>
      </div>

      {/* Article Header Skeleton */}
      <section className="py-6 xs:py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-3 xs:px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 xs:h-7 sm:h-8 w-24 xs:w-28 sm:w-32 mb-3 xs:mb-4" />
            <Skeleton className="h-8 xs:h-10 sm:h-12 w-full mb-2 xs:mb-3 sm:mb-4" />
            <Skeleton className="h-8 xs:h-10 sm:h-12 w-3/4 mb-4 xs:mb-5 sm:mb-6" />

            <div className="flex flex-wrap items-center gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 sm:mb-8">
              <Skeleton className="h-4 xs:h-5 w-24 xs:w-28 sm:w-32" />
              <Skeleton className="h-4 xs:h-5 w-28 xs:w-32 sm:w-40" />
              <Skeleton className="h-4 xs:h-5 w-16 xs:w-20 sm:w-24" />
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 mb-4 xs:mb-6 sm:mb-8">
              <div className="flex flex-wrap gap-1.5 xs:gap-2">
                <Skeleton className="h-5 xs:h-6 w-16 xs:w-20 sm:w-24" />
                <Skeleton className="h-5 xs:h-6 w-16 xs:w-20 sm:w-24" />
                <Skeleton className="h-5 xs:h-6 w-16 xs:w-20 sm:w-24" />
              </div>
              <div className="flex space-x-1.5 xs:space-x-2">
                <Skeleton className="h-7 xs:h-8 sm:h-9 w-14 xs:w-16 sm:w-20" />
                <Skeleton className="h-7 xs:h-8 sm:h-9 w-14 xs:w-16 sm:w-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image Skeleton */}
      <section className="pb-6 xs:pb-8 sm:pb-12 bg-white">
        <div className="container mx-auto px-3 xs:px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="w-full h-48 xs:h-56 sm:h-72 md:h-80 lg:h-96 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="pb-8 xs:pb-12 sm:pb-16 bg-white">
        <div className="container mx-auto px-3 xs:px-4">
          <div className="max-w-4xl mx-auto space-y-2 xs:space-y-3 sm:space-y-4">
            <Skeleton className="h-3 xs:h-4 w-full" />
            <Skeleton className="h-3 xs:h-4 w-full" />
            <Skeleton className="h-3 xs:h-4 w-5/6" />
            <Skeleton className="h-3 xs:h-4 w-full" />
            <Skeleton className="h-3 xs:h-4 w-4/5" />
            <div className="pt-2 xs:pt-3 sm:pt-4" />
            <Skeleton className="h-3 xs:h-4 w-full" />
            <Skeleton className="h-3 xs:h-4 w-full" />
            <Skeleton className="h-3 xs:h-4 w-3/4" />
            <div className="pt-2 xs:pt-3 sm:pt-4" />
            <Skeleton className="h-3 xs:h-4 w-full" />
            <Skeleton className="h-3 xs:h-4 w-5/6" />
            <Skeleton className="h-3 xs:h-4 w-full" />
          </div>
        </div>
      </section>

      {/* Author Bio Skeleton */}
      <section className="py-6 xs:py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-3 xs:px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 xs:p-6 sm:p-8">
                <div className="flex flex-col xs:flex-row items-center xs:items-start gap-4 xs:gap-5 sm:gap-6">
                  <Skeleton className="w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2 xs:space-y-3 w-full">
                    <Skeleton className="h-5 xs:h-6 w-32 xs:w-36 sm:w-40 mx-auto xs:mx-0" />
                    <Skeleton className="h-3 xs:h-4 w-full" />
                    <Skeleton className="h-3 xs:h-4 w-5/6" />
                    <div className="flex justify-center xs:justify-start space-x-2 xs:space-x-3 sm:space-x-4 pt-1 xs:pt-2">
                      <Skeleton className="h-7 xs:h-8 sm:h-9 w-14 xs:w-16 sm:w-20" />
                      <Skeleton className="h-7 xs:h-8 sm:h-9 w-16 xs:w-20 sm:w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Posts Skeleton */}
      <section className="py-8 xs:py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-3 xs:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 xs:mb-8 sm:mb-12">
              <Skeleton className="h-7 xs:h-8 sm:h-10 w-48 xs:w-56 sm:w-64 mx-auto mb-2 xs:mb-3 sm:mb-4" />
              <Skeleton className="h-1 w-16 xs:w-20 sm:w-24 mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6 sm:gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-36 xs:h-40 sm:h-48" />
                  <CardContent className="p-3 xs:p-4 sm:p-6 space-y-2 xs:space-y-3">
                    <Skeleton className="h-5 xs:h-6 w-3/4" />
                    <Skeleton className="h-3 xs:h-4 w-full" />
                    <Skeleton className="h-3 xs:h-4 w-5/6" />
                    <div className="flex items-center justify-between pt-2 xs:pt-3 sm:pt-4">
                      <Skeleton className="h-3 xs:h-4 w-16 xs:w-20 sm:w-24" />
                      <Skeleton className="h-3 xs:h-4 w-14 xs:w-16 sm:w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostDetails;