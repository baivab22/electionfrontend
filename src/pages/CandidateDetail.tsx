import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Award, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  Target,
  Share2,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  FileText,
  Download,
  Heart,
  MessageCircle,
  Send,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CandidateFeedbackSection from '@/components/CandidateFeedbackSection';
import VotingSystem from '@/components/VotingSystem';

interface Candidate {
  _id: string;
  personalInfo: {
    fullName: string;
    fullName_np?: string;
    position: string;
    constituency: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    contactNumber: string;
    address: string;
  };
  biography: {
    bio_en: string;
    bio_np?: string;
    backgroundEducation: string;
    experience: string;
    profilePhoto?: string;
  };
  manifesto: {
    title_en: string;
    content_en: string;
    manifestoBrochure?: string;
  };
  issues: Array<{
    issueTitle_en: string;
    issueDescription_en: string;
    issueCategory: string;
    priority: number;
  }>;
  achievements: Array<{
    achievementTitle_en: string;
    achievementDescription_en: string;
    achievementDate: string;
    achievementCategory: string;
    achievementImage?: string;
  }>;
  campaign: {
    campaignSlogan_en?: string;
    votingTarget?: number;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
  likes?: number;
  shares?: number;
  votes?: number;
  votePercentage?: number;
  votingEnabled?: boolean;
  comments?: Array<{
    _id: string;
    name: string;
    email?: string;
    comment: string;
    createdAt: string;
    isApproved: boolean;
  }>;
}

interface CommentFormData {
  name: string;
  email: string;
  comment: string;
}

const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Social engagement state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState<CommentFormData>({
    name: '',
    email: '',
    comment: ''
  });

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch candidate');
        const data = await response.json();
        setCandidate(data.data);
        setLikesCount(data.data.likes || 0);
        setSharesCount(data.data.shares || 0);
        
        // Check if user has liked (stored in localStorage)
        const likedCandidates = JSON.parse(localStorage.getItem('likedCandidates') || '[]');
        setIsLiked(likedCandidates.includes(id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const response = await API.candidates.getComments(id);
        setComments(response.data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    if (id) {
      fetchCandidate();
      fetchComments();
    }
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      const response = await API.candidates.likeCandidate(id);
      setLikesCount(response.data.likes);
      setIsLiked(response.data.isLiked);
      
      // Update localStorage
      const likedCandidates = JSON.parse(localStorage.getItem('likedCandidates') || '[]');
      if (response.data.isLiked) {
        likedCandidates.push(id);
      } else {
        const index = likedCandidates.indexOf(id);
        if (index > -1) likedCandidates.splice(index, 1);
      }
      localStorage.setItem('likedCandidates', JSON.stringify(likedCandidates));
      
      toast({
        title: response.data.isLiked ? "Liked!" : "Unliked!",
        description: response.data.isLiked ? "You liked this candidate" : "You unliked this candidate"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like candidate",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (!id) return;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${candidate?.personalInfo.fullName} - ${candidate?.personalInfo.position}`,
          text: `Check out ${candidate?.personalInfo.fullName}'s profile`,
          url: url
        });
        // Increment share count
        await API.candidates.shareCandidate(id);
        setSharesCount(prev => prev + 1);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      await API.candidates.shareCandidate(id);
      setSharesCount(prev => prev + 1);
      toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard"
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const response = await API.candidates.addComment(id, commentForm);
      const refreshedComments = await API.candidates.getComments(id);
      setComments(refreshedComments.data);
      toast({
        title: "Comment Submitted!",
        description: response.message
      });
      setCommentForm({ name: '', email: '', comment: '' });
      setShowCommentForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center px-3 xs:px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 xs:h-10 sm:h-12 w-8 xs:w-10 sm:w-12 border-b-2 border-primary mx-auto mb-3 xs:mb-4"></div>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center px-3 xs:px-4">
        <Card className="border-destructive/20 bg-destructive/5 max-w-sm w-full">
          <CardContent className="pt-4 xs:pt-6 text-center">
            <p className="text-destructive mb-3 xs:mb-4 text-sm xs:text-base">{error || 'Candidate not found'}</p>
            <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90 h-8 xs:h-9 sm:h-10 text-xs xs:text-sm">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    // Parse date safely (avoid timezone issues with Date.parse on YYYY-MM-DD)
    const parts = String(dateOfBirth).trim().split(/[\/\-\.\s]+/).map(p => p.trim()).filter(Boolean);
    let y: number, m: number, d: number;
    if (parts.length === 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD
        y = Number(parts[0]); m = Number(parts[1]) - 1; d = Number(parts[2]);
      } else { // assume DD-MM-YYYY or DD/MM/YYYY
        y = Number(parts[2]); m = Number(parts[1]) - 1; d = Number(parts[0]);
      }
    } else {
      const dt = new Date(dateOfBirth);
      if (isNaN(dt.getTime())) return '';
      y = dt.getFullYear(); m = dt.getMonth(); d = dt.getDate();
    }

    // If year looks like Nepali Bikram Sambat (BS) (e.g., 2000-2100), compute age using BS current year 2082
    if (y >= 2000 && y <= 2100) {
      const ageBs = 2082 - y;
      if (ageBs < 0 || ageBs > 120) return '';
      return ageBs;
    }

    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
    if (age < 0 || age > 120) return '';
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 xs:py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mb-4 xs:mb-6 sm:mb-8">
        <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm flex-wrap">
          <button onClick={() => navigate('/')} className="text-primary hover:underline">Home</button>
          <span className="text-muted-foreground">/</span>
          <button onClick={() => navigate('/candidates')} className="text-primary hover:underline">Candidates</button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">{candidate.personalInfo.fullName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg lg:sticky lg:top-8">
              <CardContent className="p-0">
                {/* Profile Image */}
                <div className="relative">
                  <div className="h-28 xs:h-32 sm:h-40 bg-gradient-to-br from-primary to-secondary"></div>
                  <div className="px-3 xs:px-4 sm:px-6 pb-4 xs:pb-5 sm:pb-6">
                    <div className="flex justify-center -mt-14 xs:-mt-16 sm:-mt-20 mb-3 xs:mb-4">
                      {candidate.biography?.profilePhoto ? (
                        <img
                          src={candidate.biography.profilePhoto}
                          alt={candidate.personalInfo.fullName}
                          className="w-24 xs:w-28 sm:w-32 h-24 xs:h-28 sm:h-32 rounded-full object-cover border-3 xs:border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 xs:w-28 sm:w-32 h-24 xs:h-28 sm:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-3 xs:border-4 border-white text-white text-2xl xs:text-3xl sm:text-4xl font-bold shadow-lg">
                          {candidate.personalInfo.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name and Position */}
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground text-center mb-1.5 xs:mb-2">
                      {candidate.personalInfo.fullName}
                    </h2>
                    <Badge className="bg-primary text-white block text-center w-full mb-3 xs:mb-4 py-0.5 xs:py-1 text-xs xs:text-sm">
                      {candidate.personalInfo.position}
                    </Badge>

                    {/* Contact Buttons */}
                    <div className="space-y-1.5 xs:space-y-2 mb-4 xs:mb-5 sm:mb-6">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white h-8 xs:h-9 sm:h-10 text-xs xs:text-sm"
                        onClick={() => window.location.href = `tel:${candidate.personalInfo.contactNumber}`}
                      >
                        <Phone className="w-3 xs:w-4 h-3 xs:h-4 mr-1.5 xs:mr-2" />
                        Contact Number
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10 h-8 xs:h-9 sm:h-10 text-xs xs:text-sm"
                        onClick={() => window.location.href = `mailto:${candidate.personalInfo.email}`}
                      >
                        <Mail className="w-3 xs:w-4 h-3 xs:h-4 mr-1.5 xs:mr-2" />
                        Email Address
                      </Button>
                    </div>

                    {/* Social Media Links */}
                    {candidate.socialMedia && (Object.keys(candidate.socialMedia).length > 0) && (
                      <div className="border-t pt-3 xs:pt-4">
                        <h3 className="text-xs xs:text-sm font-semibold text-muted-foreground mb-2 xs:mb-3">Connect On Social Media</h3>
                        <div className="flex flex-wrap gap-1.5 xs:gap-2 justify-center">
                          {candidate.socialMedia.facebook && (
                            <a
                              href={candidate.socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 xs:p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              title="Facebook"
                            >
                              <Facebook className="w-4 xs:w-5 h-4 xs:h-5" />
                            </a>
                          )}
                          {candidate.socialMedia.twitter && (
                            <a
                              href={candidate.socialMedia.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 xs:p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                              title="Twitter/X"
                            >
                              <Twitter className="w-4 xs:w-5 h-4 xs:h-5" />
                            </a>
                          )}
                          {candidate.socialMedia.instagram && (
                            <a
                              href={candidate.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 xs:p-2 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 hover:opacity-90 text-white transition-opacity"
                              title="Instagram"
                            >
                              <Instagram className="w-4 xs:w-5 h-4 xs:h-5" />
                            </a>
                          )}
                          {candidate.socialMedia.youtube && (
                            <a
                              href={candidate.socialMedia.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 xs:p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                              title="YouTube"
                            >
                              <Youtube className="w-4 xs:w-5 h-4 xs:h-5" />
                            </a>
                          )}
                          {(candidate.socialMedia as any).website && (
                            <a
                              href={(candidate.socialMedia as any).website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 xs:p-2 rounded-full bg-gray-700 hover:bg-gray-800 text-white transition-colors"
                              title="Website"
                            >
                              <Globe className="w-4 xs:w-5 h-4 xs:h-5" />
                            </a>
                          )}
                            {candidate.socialMedia.linkedin && (
                              <a
                                href={candidate.socialMedia.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 xs:p-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                                title="LinkedIn"
                              >
                                <Users className="w-4 xs:w-5 h-4 xs:h-5" />
                              </a>
                            )}
                            {candidate.socialMedia.tiktok && (
                              <a
                                href={candidate.socialMedia.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 xs:p-2 rounded-full bg-black hover:opacity-90 text-white transition-colors"
                                title="TikTok"
                              >
                                <Users className="w-4 xs:w-5 h-4 xs:h-5" />
                              </a>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Card */}
            <Card className="border-0 shadow-lg mt-4 xs:mt-5 sm:mt-6">
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { id: 'general', label: 'General Information', icon: Briefcase },
                    { id: 'biography', label: 'Biography', icon: BookOpen },
                    { id: 'manifesto', label: 'Manifesto', icon: FileText },
                    { id: 'issues', label: 'Key Issues', icon: Target },
                    { id: 'achievements', label: 'Achievements', icon: Award },
                    { id: 'feedback', label: 'Community Feedback', icon: MessageCircle },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 text-left font-medium transition-colors flex items-center gap-2 xs:gap-3 text-xs xs:text-sm sm:text-base ${
                          activeTab === item.id
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 xs:w-5 h-4 xs:h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Voting System */}
            <div className="mb-4 xs:mb-5 sm:mb-6">
              <VotingSystem
                candidateId={candidate._id}
                candidateName={candidate.personalInfo.fullName}
                initialVotes={candidate.votes || 0}
                initialVotePercentage={candidate.votePercentage || 0}
                votingEnabled={candidate.votingEnabled !== false}
              />
            </div>

            {/* Social Engagement Card */}
            <Card className="border-0 shadow-lg mb-4 xs:mb-5 sm:mb-6">
              <CardContent className="p-3 xs:p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 xs:gap-3 sm:gap-4">
                  <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4">
                    <Button
                      variant={isLiked ? "default" : "ghost"}
                      className={`h-8 xs:h-9 sm:h-10 text-xs xs:text-sm ${isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                      onClick={handleLike}
                    >
                      <Heart className={`w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 mr-1 xs:mr-1.5 sm:mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                      className="h-8 xs:h-9 sm:h-10 text-xs xs:text-sm"
                    >
                      <MessageCircle className="w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 mr-1 xs:mr-1.5 sm:mr-2" />
                      {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={handleShare}
                      className="h-8 xs:h-9 sm:h-10 text-xs xs:text-sm"
                    >
                      <Share2 className="w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 mr-1 xs:mr-1.5 sm:mr-2" />
                      {sharesCount} {sharesCount === 1 ? 'Share' : 'Shares'}
                    </Button>
                  </div>
                </div>

                {/* Comment Form */}
                {showCommentForm && (
                  <form onSubmit={handleCommentSubmit} className="mt-4 xs:mt-5 sm:mt-6 space-y-3 xs:space-y-4 border-t pt-4 xs:pt-5 sm:pt-6">
                    <h3 className="text-base xs:text-lg font-semibold mb-3 xs:mb-4">Leave a Comment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                      <div>
                        <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Name *</label>
                        <Input
                          required
                          value={commentForm.name}
                          onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                          placeholder="Your name"
                          className="h-9 xs:h-10 text-sm xs:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Email</label>
                        <Input
                          type="email"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                          placeholder="your.email@example.com (optional)"
                          className="h-9 xs:h-10 text-sm xs:text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Comment *</label>
                      <Textarea
                        required
                        value={commentForm.comment}
                        onChange={(e) => setCommentForm({...commentForm, comment: e.target.value})}
                        placeholder="Share your thoughts..."
                        rows={4}
                        maxLength={1000}
                        className="text-sm xs:text-base"
                      />
                      <p className="text-[10px] xs:text-xs text-muted-foreground mt-1">
                        {commentForm.comment.length}/1000 characters
                      </p>
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2">
                      <Button type="submit" className="bg-primary hover:bg-primary/90 h-8 xs:h-9 sm:h-10 text-xs xs:text-sm">
                        <Send className="w-3 xs:w-4 h-3 xs:h-4 mr-1.5 xs:mr-2" />
                        Submit Comment
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCommentForm(false)} className="h-8 xs:h-9 sm:h-10 text-xs xs:text-sm">
                        Cancel
                      </Button>
                    </div>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                      Your comment will be reviewed before it appears publicly.
                    </p>
                  </form>
                )}

                {/* Display Comments */}
                {comments.length > 0 && (
                  <div className="mt-4 xs:mt-5 sm:mt-6 space-y-3 xs:space-y-4 border-t pt-4 xs:pt-5 sm:pt-6">
                    <h3 className="text-base xs:text-lg font-semibold mb-3 xs:mb-4">Comments ({comments.length})</h3>
                    {comments.map((comment) => (
                      <div key={comment._id} className="border-l-2 xs:border-l-4 border-primary/30 pl-2 xs:pl-3 sm:pl-4 py-1.5 xs:py-2">
                        <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 mb-1">
                          <span className="font-semibold text-xs xs:text-sm sm:text-base">{comment.name}</span>
                          <span className="text-[10px] xs:text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs xs:text-sm text-foreground/80">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Information Section */}
            {activeTab === 'general' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                  <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                    <Briefcase className="w-5 xs:w-6 h-5 xs:h-6" />
                    General Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                  <div className="space-y-3 xs:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Full Name</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{candidate.personalInfo.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Position</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{candidate.personalInfo.position}</p>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Constituency</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{candidate.personalInfo.constituency}</p>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Gender</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{candidate.personalInfo.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Date of Birth</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{new Date(candidate.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Age</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{calculateAge(candidate.personalInfo.dateOfBirth)} years</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Address</p>
                        <p className="text-sm xs:text-base sm:text-lg text-foreground">{candidate.personalInfo.address}</p>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Email</p>
                        <a href={`mailto:${candidate.personalInfo.email}`} className="text-sm xs:text-base sm:text-lg text-primary hover:underline break-all">
                          {candidate.personalInfo.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-muted-foreground mb-0.5 xs:mb-1">Contact Number</p>
                        <a href={`tel:${candidate.personalInfo.contactNumber}`} className="text-sm xs:text-base sm:text-lg text-primary hover:underline">
                          {candidate.personalInfo.contactNumber}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Biography Section */}
            {activeTab === 'biography' && (
              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                    <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                      <BookOpen className="w-5 xs:w-6 h-5 xs:h-6" />
                      Biography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                    <p className="text-foreground/90 leading-relaxed text-sm xs:text-base sm:text-lg whitespace-pre-wrap">
                      {candidate.biography?.bio_en || 'No biography available'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10 border-b border-secondary/20 p-3 xs:p-4 sm:p-6">
                    <CardTitle className="text-lg xs:text-xl sm:text-2xl text-secondary flex items-center gap-2 xs:gap-3">
                      <Award className="w-5 xs:w-6 h-5 xs:h-6" />
                      Education & Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                    <p className="text-foreground/90 leading-relaxed text-sm xs:text-base sm:text-lg whitespace-pre-wrap">
                      {candidate.biography?.backgroundEducation || 'No background information available'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-accent/20 p-3 xs:p-4 sm:p-6">
                    <CardTitle className="text-lg xs:text-xl sm:text-2xl text-accent flex items-center gap-2 xs:gap-3">
                      <Briefcase className="w-5 xs:w-6 h-5 xs:h-6" />
                      Professional Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                    <p className="text-foreground/90 leading-relaxed text-sm xs:text-base sm:text-lg whitespace-pre-wrap">
                      {candidate.biography?.experience || 'No experience information available'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Manifesto Section */}
            {activeTab === 'manifesto' && (
              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-red-500/10 to-yellow-500/10 border-b border-red-500/20 p-3 xs:p-4 sm:p-6">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3">
                      <CardTitle className="text-lg xs:text-xl sm:text-2xl text-red-700 flex items-center gap-2 xs:gap-3">
                        <FileText className="w-5 xs:w-6 h-5 xs:h-6" />
                        <span className="line-clamp-2">{candidate.manifesto?.title_en || 'Election Manifesto'}</span>
                      </CardTitle>
                      {candidate.manifesto?.manifestoBrochure && (
                        <a
                          href={candidate.manifesto.manifestoBrochure}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs xs:text-sm whitespace-nowrap"
                        >
                          <Download className="w-3 xs:w-4 h-3 xs:h-4" />
                          Download PDF
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                    {candidate.manifesto?.content_en ? (
                      <div className="prose prose-sm xs:prose sm:prose-lg max-w-none">
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {candidate.manifesto.content_en}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-6 xs:py-8 text-sm xs:text-base">No manifesto content available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Manifesto Brochure Preview */}
                {candidate.manifesto?.manifestoBrochure && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3 xs:p-4 sm:p-6">
                      <CardTitle className="text-base xs:text-lg sm:text-xl text-blue-700">Manifesto Document</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 xs:pt-6 px-3 xs:px-4 sm:px-6">
                      {candidate.manifesto.manifestoBrochure.endsWith('.pdf') ? (
                        <div className="bg-gray-100 rounded-lg p-4 xs:p-6 sm:p-8 text-center">
                          <FileText className="w-10 xs:w-12 sm:w-16 h-10 xs:h-12 sm:h-16 mx-auto mb-3 xs:mb-4 text-gray-400" />
                          <p className="text-gray-600 mb-3 xs:mb-4 text-sm xs:text-base">PDF Document</p>
                          <a
                            href={candidate.manifesto.manifestoBrochure}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 xs:gap-2 px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-xs xs:text-sm sm:text-base"
                          >
                            <Download className="w-3 xs:w-4 h-3 xs:h-4" />
                            View/Download PDF
                          </a>
                        </div>
                      ) : (
                        <img
                          src={candidate.manifesto.manifestoBrochure}
                          alt="Manifesto Brochure"
                          className="w-full rounded-lg shadow-lg"
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Issues Section */}
            {activeTab === 'issues' && (
              <div className="space-y-3 xs:space-y-4">
                {candidate.issues.length > 0 ? (
                  candidate.issues.map((issue, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader className="p-3 xs:p-4 sm:p-6">
                        <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 xs:gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-base xs:text-lg sm:text-xl text-primary">
                              {issue.issueTitle_en}
                            </CardTitle>
                            <Badge className="mt-1.5 xs:mt-2 bg-secondary text-white text-[10px] xs:text-xs" variant="default">
                              {issue.issueCategory}
                            </Badge>
                          </div>
                          <div className="text-left xs:text-right xs:ml-3 sm:ml-4">
                            <p className="text-[10px] xs:text-xs text-muted-foreground mb-1">Priority</p>
                            <div className="flex items-center xs:justify-end gap-2">
                              <div className="w-20 xs:w-24 sm:w-32 h-1.5 xs:h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-secondary" 
                                  style={{ width: `${(issue.priority / 10) * 100}%` }}
                                ></div>
                              </div>
                              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-secondary w-10 xs:w-12">{issue.priority}/10</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
                        <p className="text-foreground/90 leading-relaxed text-xs xs:text-sm sm:text-base">
                          {issue.issueDescription_en}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="pt-8 xs:pt-10 sm:pt-12 pb-8 xs:pb-10 sm:pb-12 text-center">
                      <Target className="w-10 xs:w-12 sm:w-16 h-10 xs:h-12 sm:h-16 text-primary/30 mx-auto mb-3 xs:mb-4" />
                      <p className="text-muted-foreground text-sm xs:text-base">No key issues listed</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Achievements Section */}
            {activeTab === 'achievements' && (
              <div className="space-y-3 xs:space-y-4">
                {candidate.achievements.length > 0 ? (
                  candidate.achievements.map((achievement, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      {achievement.achievementImage && (
                        <img
                          src={achievement.achievementImage}
                          alt={achievement.achievementTitle_en}
                          className="w-full h-32 xs:h-40 sm:h-48 object-cover"
                        />
                      )}
                      <CardHeader className="p-3 xs:p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base xs:text-lg sm:text-xl text-primary">
                              {achievement.achievementTitle_en}
                            </CardTitle>
                            <Badge className="mt-1.5 xs:mt-2 bg-accent text-white text-[10px] xs:text-xs" variant="default">
                              {achievement.achievementCategory}
                            </Badge>
                          </div>
                          <Award className="w-5 xs:w-6 h-5 xs:h-6 text-secondary flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
                        <p className="text-foreground/90 leading-relaxed mb-2 xs:mb-3 text-xs xs:text-sm sm:text-base">
                          {achievement.achievementDescription_en}
                        </p>
                        {achievement.achievementDate && (
                          <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                            {new Date(achievement.achievementDate).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="pt-8 xs:pt-10 sm:pt-12 pb-8 xs:pb-10 sm:pb-12 text-center">
                      <Award className="w-10 xs:w-12 sm:w-16 h-10 xs:h-12 sm:h-16 text-primary/30 mx-auto mb-3 xs:mb-4" />
                      <p className="text-muted-foreground text-sm xs:text-base">No achievements listed</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Community Feedback Section */}
            {activeTab === 'feedback' && candidate && (
              <CandidateFeedbackSection 
                candidateId={id!} 
                candidateName={candidate.personalInfo.fullName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
