import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  User, 
  Clock,
  ArrowRight, 
  Share2,
  Copy,
  Check,
  Eye,
  MessageCircle,
  Bookmark,
  X,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author?: string;
  publishedAt: string;
  featured?: boolean;
  content: string;
  viewCount?: number;
  commentCount?: number;
  location?: string;
}

// Get API URL based on environment (Vite)
const API_URL = (() => {
  const vite = import.meta.env.VITE_API_URL as string | undefined;
  if (vite) return `${vite.replace(/\/+$/g, '')}/api`;
  return import.meta.env.MODE === 'production'
    ? (import.meta.env.VITE_PROD_URL || 'gallery.com/api')
    : (import.meta.env.VITE_DEV_URL || 'http://localhost:3000/api');
})();

const API_ASSET_URL = (() => {
  const vite = import.meta.env.VITE_API_URL as string | undefined;
  if (vite) return `${vite.replace(/\/+$/g, '')}/`;
  return import.meta.env.MODE === 'production'
    ? (import.meta.env.VITE_PROD_URL || 'https://api.abhushangallery.com/')
    : (import.meta.env.VITE_DEV_URL || 'http://localhost:3000/');
})();

// Social Media Icons (keep your existing icons)
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
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.150-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
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

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  excerpt,
  image,
  category,
  author = 'Anonymous',
  publishedAt,
  featured = false,
  content,
  viewCount = 0,
  commentCount = 0,
  location
}) => {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSocialPlugin, setShowSocialPlugin] = useState(false);
  const [imageError, setImageError] = useState(false);

  const postUrl = `${window.location.origin}/post/${id}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(postUrl);

  // Fixed image dimensions
  const IMAGE_HEIGHT = 240; // Fixed height for all cards

  // Construct image URL properly
  const getImageUrl = () => {
    if (!image) return '/placeholder-image.jpg';
    
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    return `${API_ASSET_URL}uploads/posts/${image}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

const getCategoryColor = (cat: string) => {
  const colors: { [key: string]: string } = {
    technology: 'bg-gradient-to-r from-primary to-accent text-white',
    digitalTransformation: 'bg-gradient-to-r from-accent to-secondary text-white',
    socialJustice: 'bg-gradient-to-r from-primary/90 to-accent/90 text-white',
    events: 'bg-gradient-to-r from-secondary to-accent text-white',
    innovation: 'bg-gradient-to-r from-accent to-primary text-white',
    policy: 'bg-gradient-to-r from-secondary/90 to-primary/90 text-white',
    education: 'bg-gradient-to-r from-primary to-secondary text-white',
    startups: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
  };
  return colors[cat] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
};

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text?.trim()?.split(/\s+/).length || 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
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

  const readingTime = calculateReadingTime(content);

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-xl border ${
      featured 
        ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-lg' 
        : 'border-gray-100 bg-white'
    } rounded-2xl relative h-full flex flex-col`} style={{padding: 0}}>
      
      {/* Social Media Plugin */}
      {showSocialPlugin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowSocialPlugin(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">Share Article</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-600 transition-all duration-200 border border-transparent hover:border-blue-200"
              >
                <FacebookIcon size={20} />
                <span className="text-sm font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 text-sky-600 transition-all duration-200 border border-transparent hover:border-sky-200"
              >
                <TwitterIcon size={20} />
                <span className="text-sm font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-700 transition-all duration-200 border border-transparent hover:border-blue-200"
              >
                <LinkedInIcon size={20} />
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-green-600 transition-all duration-200 border border-transparent hover:border-green-200"
              >
                <WhatsAppIcon size={20} />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-500 transition-all duration-200 border border-transparent hover:border-blue-200"
              >
                <TelegramIcon size={20} />
                <span className="text-sm font-medium">Telegram</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('reddit')}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-orange-600 transition-all duration-200 border border-transparent hover:border-orange-200"
              >
                <RedditIcon size={20} />
                <span className="text-sm font-medium">Reddit</span>
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-3 p-3 rounded-xl w-full transition-all duration-200 border ${
                  copied 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                <span className="text-sm font-medium">
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Header with Fixed Height */}
      <CardHeader className="p-0 relative flex-shrink-0">
        <Link to={`/post/${id}`} className="block relative overflow-hidden">
          <div 
            className="w-full bg-gray-100 relative overflow-hidden h-40 xs:h-48 sm:h-56 md:h-60"
          >
            <img
              src={getImageUrl()}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-2 xs:top-3 left-2 xs:left-3 right-2 xs:right-3 flex items-start justify-between">
              <div className="flex flex-col gap-1 xs:gap-2">
                {/* Featured Badge */}
                {featured && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg font-semibold text-[10px] xs:text-xs px-2 xs:px-3 py-1 xs:py-1.5 backdrop-blur-sm">
                    ⭐ Featured
                  </Badge>
                )}
                
                {/* Category Badge */}
                <Badge className={`${getCategoryColor(category)} border backdrop-blur-sm font-medium text-[10px] xs:text-xs px-2 xs:px-3 py-1 xs:py-1.5 max-w-[100px] xs:max-w-[120px] truncate`}>
                  {t(`categories.${category}`)}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 xs:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsBookmarked(!isBookmarked);
                  }}
                  className={`p-1.5 xs:p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
                    isBookmarked 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Bookmark 
                    size={14} 
                    fill={isBookmarked ? 'currentColor' : 'none'}
                    className="xs:w-4 xs:h-4"
                  />
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSocialPlugin(true);
                  }}
                  className="p-1.5 xs:p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-md transition-all duration-300 shadow-lg"
                >
                  <Share2 size={14} className="xs:w-4 xs:h-4" />
                </button>
              </div>
            </div>

            {/* Location Badge */}
            {location && (
              <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm font-medium text-[10px] xs:text-xs px-2 xs:px-3 py-1 xs:py-1.5 flex items-center gap-1">
                  <MapPin size={10} className="xs:w-3 xs:h-3" />
                  {location}
                </Badge>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>

      {/* Content Area */}
      <CardContent className="p-4 xs:p-6 sm:p-8 flex-1 flex flex-col">
        {/* Meta Info */}
        <div className="flex items-center gap-2 xs:gap-3 text-[10px] xs:text-xs text-gray-500 mb-3 xs:mb-4">
          <div className="flex items-center gap-1 xs:gap-1.5">
            <Calendar size={12} className="xs:w-3.5 xs:h-3.5" />
            <span>{formatDate(publishedAt)}</span>
          </div>
          <span className="hidden xs:inline">•</span>
          <div className="hidden xs:flex items-center gap-1 xs:gap-1.5">
            <Clock size={12} className="xs:w-3.5 xs:h-3.5" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/post/${id}`} className="mb-3 xs:mb-4 group/title">
          <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover/title:text-blue-600 transition-colors duration-300 mb-1 xs:mb-2">
            {title}
          </h3>
        </Link>

        {/* Stats Bar */}
        <div className="flex items-center justify-between pt-3 xs:pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2 xs:gap-4 text-[10px] xs:text-xs text-gray-500">
            <span className="flex items-center gap-1 xs:gap-1.5">
              <Eye size={12} className="xs:w-3.5 xs:h-3.5" />
              {viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 xs:gap-1.5">
              <MessageCircle size={12} className="xs:w-3.5 xs:h-3.5" />
              {commentCount}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 xs:px-6 sm:px-8 pb-4 xs:pb-6 sm:pb-8 pt-0 flex items-center justify-between gap-2">
        {/* Author Info */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 min-w-0">
          <div className="w-7 xs:w-8 sm:w-10 h-7 xs:h-8 sm:h-10 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <User size={12} className="text-white xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs xs:text-sm font-semibold text-gray-900 truncate">{author}</p>
            <p className="text-[10px] xs:text-xs text-gray-500 hidden xs:block">Author</p>
          </div>
        </div>

        {/* Read More Button */}
        <Link to={`/post/${id}`} className="flex-shrink-0">
          <Button 
            size="sm"
            className="bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white rounded-full px-2 xs:px-3 sm:px-5 h-7 xs:h-8 sm:h-10 text-[10px] xs:text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
          >
            <span className="hidden xs:inline">Read More</span>
            <span className="xs:hidden">Read</span>
            <ArrowRight size={12} className="ml-1 xs:ml-2 group-hover/btn:translate-x-1 transition-transform xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;