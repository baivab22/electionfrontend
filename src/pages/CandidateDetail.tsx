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
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CandidateFeedbackSection from '@/components/CandidateFeedbackSection';

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
  };
  likes?: number;
  shares?: number;
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
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://api.abhushangallery.com'}/api/candidates/${id}`);
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || 'Candidate not found'}</p>
            <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/')} className="text-primary hover:underline">Home</button>
          <span className="text-muted-foreground">/</span>
          <button onClick={() => navigate('/candidates')} className="text-primary hover:underline">Candidates</button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">{candidate.personalInfo.fullName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg sticky top-8">
              <CardContent className="p-0">
                {/* Profile Image */}
                <div className="relative">
                  <div className="h-40 bg-gradient-to-br from-primary to-secondary"></div>
                  <div className="px-6 pb-6">
                    <div className="flex justify-center -mt-20 mb-4">
                      {candidate.biography?.profilePhoto ? (
                        <img
                          src={candidate.biography.profilePhoto}
                          alt={candidate.personalInfo.fullName}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-white text-white text-4xl font-bold shadow-lg">
                          {candidate.personalInfo.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name and Position */}
                    <h2 className="text-2xl font-bold text-foreground text-center mb-2">
                      {candidate.personalInfo.fullName}
                    </h2>
                    <Badge className="bg-primary text-white block text-center w-full mb-4 py-1 text-sm">
                      {candidate.personalInfo.position}
                    </Badge>

                    {/* Contact Buttons */}
                    <div className="space-y-2 mb-6">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => window.location.href = `tel:${candidate.personalInfo.contactNumber}`}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Number
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10"
                        onClick={() => window.location.href = `mailto:${candidate.personalInfo.email}`}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address
                      </Button>
                    </div>

                    {/* Social Media Links */}
                    {candidate.socialMedia && (Object.keys(candidate.socialMedia).length > 0) && (
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Connect On Social Media</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {candidate.socialMedia.facebook && (
                            <a
                              href={candidate.socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              title="Facebook"
                            >
                              <Facebook className="w-5 h-5" />
                            </a>
                          )}
                          {candidate.socialMedia.twitter && (
                            <a
                              href={candidate.socialMedia.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                              title="Twitter/X"
                            >
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                          {candidate.socialMedia.instagram && (
                            <a
                              href={candidate.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 hover:opacity-90 text-white transition-opacity"
                              title="Instagram"
                            >
                              <Instagram className="w-5 h-5" />
                            </a>
                          )}
                          {candidate.socialMedia.youtube && (
                            <a
                              href={candidate.socialMedia.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                              title="YouTube"
                            >
                              <Youtube className="w-5 h-5" />
                            </a>
                          )}
                          {(candidate.socialMedia as any).website && (
                            <a
                              href={(candidate.socialMedia as any).website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-700 hover:bg-gray-800 text-white transition-colors"
                              title="Website"
                            >
                              <Globe className="w-5 h-5" />
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
            <Card className="border-0 shadow-lg mt-6">
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
                        className={`w-full px-6 py-4 text-left font-medium transition-colors flex items-center gap-3 ${
                          activeTab === item.id
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
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
            {/* Social Engagement Card */}
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                      onClick={handleLike}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      {sharesCount} {sharesCount === 1 ? 'Share' : 'Shares'}
                    </Button>
                  </div>
                </div>

                {/* Comment Form */}
                {showCommentForm && (
                  <form onSubmit={handleCommentSubmit} className="mt-6 space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <Input
                          required
                          value={commentForm.name}
                          onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                          placeholder="your.email@example.com (optional)"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment *</label>
                      <Textarea
                        required
                        value={commentForm.comment}
                        onChange={(e) => setCommentForm({...commentForm, comment: e.target.value})}
                        placeholder="Share your thoughts..."
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {commentForm.comment.length}/1000 characters
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Comment
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCommentForm(false)}>
                        Cancel
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your comment will be reviewed before it appears publicly.
                    </p>
                  </form>
                )}

                {/* Display Comments */}
                {comments.length > 0 && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
                    {comments.map((comment) => (
                      <div key={comment._id} className="border-l-4 border-primary/30 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{comment.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Information Section */}
            {activeTab === 'general' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                  <CardTitle className="text-2xl text-primary flex items-center gap-3">
                    <Briefcase className="w-6 h-6" />
                    General Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Full Name</p>
                        <p className="text-lg text-foreground">{candidate.personalInfo.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Position</p>
                        <p className="text-lg text-foreground">{candidate.personalInfo.position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Constituency</p>
                        <p className="text-lg text-foreground">{candidate.personalInfo.constituency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Gender</p>
                        <p className="text-lg text-foreground">{candidate.personalInfo.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Date of Birth</p>
                        <p className="text-lg text-foreground">{new Date(candidate.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Age</p>
                        <p className="text-lg text-foreground">{calculateAge(candidate.personalInfo.dateOfBirth)} years</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Address</p>
                        <p className="text-lg text-foreground">{candidate.personalInfo.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                        <a href={`mailto:${candidate.personalInfo.email}`} className="text-lg text-primary hover:underline">
                          {candidate.personalInfo.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Contact Number</p>
                        <a href={`tel:${candidate.personalInfo.contactNumber}`} className="text-lg text-primary hover:underline">
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
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                    <CardTitle className="text-2xl text-primary flex items-center gap-3">
                      <BookOpen className="w-6 h-6" />
                      Biography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <p className="text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap">
                      {candidate.biography?.bio_en || 'No biography available'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10 border-b border-secondary/20">
                    <CardTitle className="text-2xl text-secondary flex items-center gap-3">
                      <Award className="w-6 h-6" />
                      Education & Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <p className="text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap">
                      {candidate.biography?.backgroundEducation || 'No background information available'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-accent/20">
                    <CardTitle className="text-2xl text-accent flex items-center gap-3">
                      <Briefcase className="w-6 h-6" />
                      Professional Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <p className="text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap">
                      {candidate.biography?.experience || 'No experience information available'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Manifesto Section */}
            {activeTab === 'manifesto' && (
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-red-500/10 to-yellow-500/10 border-b border-red-500/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-red-700 flex items-center gap-3">
                        <FileText className="w-6 h-6" />
                        {candidate.manifesto?.title_en || 'Election Manifesto'}
                      </CardTitle>
                      {candidate.manifesto?.manifestoBrochure && (
                        <a
                          href={candidate.manifesto.manifestoBrochure}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8">
                    {candidate.manifesto?.content_en ? (
                      <div className="prose prose-lg max-w-none">
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {candidate.manifesto.content_en}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No manifesto content available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Manifesto Brochure Preview */}
                {candidate.manifesto?.manifestoBrochure && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                      <CardTitle className="text-xl text-blue-700">Manifesto Document</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {candidate.manifesto.manifestoBrochure.endsWith('.pdf') ? (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 mb-4">PDF Document</p>
                          <a
                            href={candidate.manifesto.manifestoBrochure}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
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
              <div className="space-y-4">
                {candidate.issues.length > 0 ? (
                  candidate.issues.map((issue, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-primary">
                              {issue.issueTitle_en}
                            </CardTitle>
                            <Badge className="mt-2 bg-secondary text-white" variant="default">
                              {issue.issueCategory}
                            </Badge>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-muted-foreground mb-1">Priority</p>
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-secondary" 
                                  style={{ width: `${(issue.priority / 10) * 100}%` }}
                                ></div>
                              </div>
                              <p className="text-2xl font-bold text-secondary w-12">{issue.priority}/10</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/90 leading-relaxed">
                          {issue.issueDescription_en}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Target className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">No key issues listed</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Achievements Section */}
            {activeTab === 'achievements' && (
              <div className="space-y-4">
                {candidate.achievements.length > 0 ? (
                  candidate.achievements.map((achievement, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      {achievement.achievementImage && (
                        <img
                          src={achievement.achievementImage}
                          alt={achievement.achievementTitle_en}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl text-primary">
                              {achievement.achievementTitle_en}
                            </CardTitle>
                            <Badge className="mt-2 bg-accent text-white" variant="default">
                              {achievement.achievementCategory}
                            </Badge>
                          </div>
                          <Award className="w-6 h-6 text-secondary flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/90 leading-relaxed mb-3">
                          {achievement.achievementDescription_en}
                        </p>
                        {achievement.achievementDate && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(achievement.achievementDate).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Award className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">No achievements listed</p>
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
