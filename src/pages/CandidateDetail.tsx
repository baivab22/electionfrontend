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
  candidateId?: string;
  personalInfo: {
    fullName?: string;
    fullName_np?: string;
    nickname?: string;
    nickname_np?: string;
    dateOfBirth?: string;
    dateOfBirth_raw?: string;
    gender?: string;
    maritalStatus?: string;
    permanentAddress?: string;
    currentAddress?: string;
    citizenshipNumber?: string;
    citizenshipIssuedDistrict?: string;
    contactNumber?: string;
    email?: string;
    website?: string;
    profilePhoto?: string;
    position?: string;
    constituency?: string;
    address?: string;
    // New structure fields
    CandidateName?: string;
    CandidateName_np?: string;
    AGE_YR?: number;
    DistrictName?: string;
    PoliticalPartyName?: string;
    SymbolNumber?: string;
    SymbolImage?: string;
    ProvinceName?: string;
    Gender?: string;
    WardNo?: string;
    MunicipalityName?: string;
  };
  politicalInfo?: {
    partyName?: string;
    partyName_np?: string;
    currentPosition?: string;
    currentPosition_np?: string;
    candidacyLevel?: string;
    candidacyLevel_np?: string;
    constituencyNumber?: string;
    constituency?: string;
    constituency_np?: string;
    electionSymbol?: string;
    electionSymbol_np?: string;
    electionSymbolImage?: string;
    isFirstTimeCandidate?: boolean;
    previousElectionHistory?: string;
  };
  education?: {
    highestQualification?: string;
    highestQualification_np?: string;
    subject?: string;
    subject_np?: string;
    institution?: string;
    institution_np?: string;
    country?: string;
    country_np?: string;
    additionalTraining?: string;
  };
  professionalExperience?: {
    currentProfession?: string;
    currentProfession_np?: string;
    previousExperience?: string;
    previousExperience_np?: string;
    organizationResponsibility?: string;
    organizationResponsibility_np?: string;
    leadershipExperience?: string;
  };
  politicalExperience?: {
    partyJoinYear?: string;
    movementRole?: string;
    movementRole_np?: string;
    previousRepresentativePosition?: string;
    previousRepresentativePosition_np?: string;
    majorAchievements?: string;
  };
  socialEngagement?: {
    ngoInvolvement?: string;
    ngoInvolvement_np?: string;
    sectorWork?: string;
    sectorWork_np?: string;
    awardsHonors?: string;
  };
  financialInfo?: {
    movableAssets?: string;
    immovableAssets?: string;
    annualIncomeSource?: string;
    bankLoans?: string;
    taxStatus?: string;
  };
  legalStatus?: {
    hasCriminalCase?: boolean;
    caseDetails?: string;
    eligibilityDeclaration?: string;
  };
  biography?: {
    bio_en?: string;
    bio_np?: string;
    backgroundEducation?: string;
    experience?: string;
  };
  manifesto?: {
    title_en?: string;
    content_en?: string;
    manifestoBrochure?: string;
  };
  issues?: Array<{
    issueTitle_en?: string;
    issueDescription_en?: string;
    issueCategory?: string;
    priority?: number;
  }>;
  achievements?: Array<{
    achievementTitle_en?: string;
    achievementDescription_en?: string;
    achievementDate?: string;
    achievementCategory?: string;
    achievementImage?: string;
  }>;
  campaign?: {
    campaignSlogan?: string;
    votingTarget?: number;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    linkedin?: string;
    tiktok?: string;
  };
  documents?: {
    manifestoBrochure?: string;
    [key: string]: any;
  };
  likes?: number;
  shares?: number;
  votes?: number;
  votePercentage?: number;
  votingEnabled?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rawSource?: any;
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

// Normalize education qualification text - replace old values with new ones
const normalizeEducationQualification = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/विदया वारिणी/g, 'विद्यावारिधि')
    .trim();
};

const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [imageLoadError, setImageLoadError] = useState(false);
  
  // Generate image URL from candidateId or SymbolNumber
  const getCandidateImageUrl = (candidateId?: string, symbolNumber?: string): string | null => {
    if (candidateId) {
      return `https://result.election.gov.np/Images/Candidate/${candidateId}.jpg`;
    }
    if (symbolNumber) {
      return `https://result.election.gov.np/Images/Candidate/${symbolNumber}.jpg`;
    }
    return null;
  };
  
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
        setImageLoadError(false); // Reset image load state
        
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

  // Helper to get all fields from backend (flat structure)
  const allFields = candidate ? {
    ...candidate,
    ...candidate.personalInfo,
    ...candidate.politicalInfo,
    ...candidate.education,
    ...candidate.professionalExperience,
    ...candidate.politicalExperience,
    ...candidate.socialEngagement,
    ...candidate.financialInfo,
    ...candidate.legalStatus,
    ...candidate.biography,
    ...candidate.manifesto,
    ...candidate.socialMedia,
    ...candidate.campaign,
    ...candidate.rawSource
  } : {};

  // Profile photo URL (always use candidateId)
  const profilePhotoUrl = candidate?.candidateId ? `https://result.election.gov.np/Images/Candidate/${candidate.candidateId}.jpg` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 xs:py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mb-4 xs:mb-6 sm:mb-8">
        <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm flex-wrap">
          <button onClick={() => navigate('/')} className="text-primary hover:underline">Home</button>
          <span className="text-muted-foreground">/</span>
          <button onClick={() => navigate('/candidates')} className="text-primary hover:underline">Candidates</button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">{displayName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Large Profile Image Section - Full Width */}
        <Card className="border-0 shadow-xl overflow-hidden mb-8 xs:mb-10 sm:mb-12">
          <CardContent className="p-0">
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 xs:p-8 sm:p-10 min-h-[400px] xs:min-h-[480px] sm:min-h-[550px] flex items-center justify-center">
              {!imageLoadError && profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={allFields.CandidateName || allFields.fullName || 'Candidate'}
                  className="w-full h-full max-w-2xl max-h-[380px] xs:max-h-[460px] sm:max-h-[530px] rounded-2xl object-cover shadow-2xl border-4 border-white/80"
                  onLoad={() => setImageLoadError(false)}
                  onError={() => setImageLoadError(true)}
                />
              ) : (
                <div className="w-48 xs:w-56 sm:w-64 h-48 xs:h-56 sm:h-64 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-8xl xs:text-9xl font-bold shadow-2xl">
                  {(allFields.CandidateName || allFields.fullName || 'C').charAt(0)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar and Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg lg:sticky lg:top-8">
              <CardContent className="p-0">
                {/* Small Profile Image in Sidebar */}
                <div className="relative">
                  <div className="h-20 xs:h-24 bg-gradient-to-r from-primary/20 to-primary/10"></div>
                  <div className="px-3 xs:px-4 sm:px-6 pb-4 xs:pb-5 sm:pb-6">
                    <div className="flex justify-center -mt-10 xs:-mt-12 mb-2 xs:mb-3">
                      {!imageLoadError && getCandidateImageUrl(candidate.candidateId) ? (
                        <img
                          src={getCandidateImageUrl(candidate.candidateId) || ''}
                          alt={candidate.personalInfo.fullName}
                          className="w-20 xs:w-24 sm:w-28 h-20 xs:h-24 sm:h-28 rounded-full object-cover border-3 xs:border-4 border-white shadow-lg"
                          onLoad={() => setImageLoadError(false)}
                          onError={() => setImageLoadError(true)}
                        />
                      ) : (
                        <div className="w-20 xs:w-24 sm:w-28 h-20 xs:h-24 sm:h-28 rounded-full bg-primary flex items-center justify-center border-3 xs:border-4 border-white text-white text-xl xs:text-2xl sm:text-3xl font-bold shadow-lg">
                          {candidate.personalInfo.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name and Position */}
                    <h2 className="text-base xs:text-lg sm:text-xl font-bold text-foreground text-center mb-1 xs:mb-1.5">
                      {displayName}
                    </h2>
                    <Badge className="bg-primary text-white block text-center w-full mb-3 xs:mb-4 py-0.5 text-xs">
                      {displayParty}
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

            {/* Navigation Card - All tabs for all sections */}
            <Card className="border-0 shadow-lg mt-4 xs:mt-5 sm:mt-6">
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { id: 'general', label: 'General', icon: Briefcase },
                    { id: 'political', label: 'Political', icon: Users },
                    { id: 'education', label: 'Education', icon: Award },
                    { id: 'professional', label: 'Professional', icon: Briefcase },
                    { id: 'social', label: 'Social', icon: Facebook },
                    { id: 'financial', label: 'Financial', icon: FileText },
                    { id: 'legal', label: 'Legal', icon: FileText },
                    { id: 'biography', label: 'Biography', icon: BookOpen },
                    { id: 'manifesto', label: 'Manifesto', icon: FileText },
                    { id: 'issues', label: 'Key Issues', icon: Target },
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
                    {/* Social Media Share Icons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Share to Facebook"
                      className="rounded-full text-blue-600"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <Facebook className="w-5 h-5 xs:w-6 xs:h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Share to Twitter"
                      className="rounded-full text-sky-500"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(candidate.CandidateName || '')}`, '_blank')}
                    >
                      <Twitter className="w-5 h-5 xs:w-6 xs:h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Share to Instagram"
                      className="rounded-full text-pink-500"
                      onClick={() => window.open(`https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <Instagram className="w-5 h-5 xs:w-6 xs:h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Share to WhatsApp"
                      className="rounded-full text-green-500"
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <MessageCircle className="w-5 h-5 xs:w-6 xs:h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Share to LinkedIn"
                      className="rounded-full text-blue-700"
                      onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <Linkedin className="w-5 h-5 xs:w-6 xs:h-6" />
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

            {/* Tab Content - Show all backend fields in each section */}
            {activeTab === 'general' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                  <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                    <Briefcase className="w-5 xs:w-6 h-5 xs:h-6" />
                    General Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                  <div className="space-y-2">
                    {/* Show all main flat fields relevant to general info */}
                    {candidate.CandidateName && <div><span className="text-xs font-semibold text-muted-foreground">पूरा नाम</span><span className="text-sm text-foreground">{candidate.CandidateName}</span></div>}
                    {candidate.Gender && <div><span className="text-xs font-semibold text-muted-foreground">लिङ्ग</span><span className="text-sm text-foreground">{candidate.Gender}</span></div>}
                    {candidate.AGE_YR && <div><span className="text-xs font-semibold text-muted-foreground">उमेर</span><span className="text-sm text-foreground">{candidate.AGE_YR}</span></div>}
                    {candidate.DistrictName && <div><span className="text-xs font-semibold text-muted-foreground">जिल्ला</span><span className="text-sm text-foreground">{candidate.DistrictName}</span></div>}
                    {candidate.StateName && <div><span className="text-xs font-semibold text-muted-foreground">प्रदेश</span><span className="text-sm text-foreground">{candidate.StateName}</span></div>}
                    {candidate.ADDRESS && <div><span className="text-xs font-semibold text-muted-foreground">ठेगाना</span><span className="text-sm text-foreground">{candidate.ADDRESS}</span></div>}
                    {candidate.FATHER_NAME && <div><span className="text-xs font-semibold text-muted-foreground">बुबाको नाम</span><span className="text-sm text-foreground">{candidate.FATHER_NAME}</span></div>}
                    {candidate.SPOUCE_NAME && <div><span className="text-xs font-semibold text-muted-foreground">श्रीमती/श्रीमानको नाम</span><span className="text-sm text-foreground">{candidate.SPOUCE_NAME}</span></div>}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Political Tab */}
            {activeTab === 'political' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                  <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                    <Users className="w-5 xs:w-6 h-5 xs:h-6" />
                    Political Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                  <div className="space-y-2">
                    {candidate.PoliticalPartyName && <div><span className="text-xs font-semibold text-muted-foreground">पार्टी</span><span className="text-sm text-foreground">{candidate.PoliticalPartyName}</span></div>}
                    {candidate.SymbolName && <div><span className="text-xs font-semibold text-muted-foreground">चुनाव चिन्ह</span><span className="text-sm text-foreground">{candidate.SymbolName}</span></div>}
                    {candidate.SYMBOLCODE && <div><span className="text-xs font-semibold text-muted-foreground">चिन्ह कोड</span><span className="text-sm text-foreground">{candidate.SYMBOLCODE}</span></div>}
                    {candidate.ConstName && <div><span className="text-xs font-semibold text-muted-foreground">निर्वाचन क्षेत्र</span><span className="text-sm text-foreground">{candidate.ConstName}</span></div>}
                    {candidate.TotalVoteReceived !== undefined && <div><span className="text-xs font-semibold text-muted-foreground">प्राप्त मत</span><span className="text-sm text-foreground">{candidate.TotalVoteReceived}</span></div>}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Education Tab */}
            {activeTab === 'education' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                  <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                    <Award className="w-5 xs:w-6 h-5 xs:h-6" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                  <div className="space-y-2">
                    {candidate.QUALIFICATION && <div><span className="text-xs font-semibold text-muted-foreground">शिक्षा</span><span className="text-sm text-foreground">{candidate.QUALIFICATION}</span></div>}
                    {candidate.NAMEOFINST && <div><span className="text-xs font-semibold text-muted-foreground">संस्था</span><span className="text-sm text-foreground">{candidate.NAMEOFINST}</span></div>}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                  <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                    <Briefcase className="w-5 xs:w-6 h-5 xs:h-6" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                  <div className="space-y-2">
                    {candidate.EXPERIENCE && <div><span className="text-xs font-semibold text-muted-foreground">अनुभव</span><span className="text-sm text-foreground">{candidate.EXPERIENCE}</span></div>}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Social Tab */}
            {activeTab === 'social' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-3 xs:p-4 sm:p-6">
                  <CardTitle className="text-lg xs:text-xl sm:text-2xl text-primary flex items-center gap-2 xs:gap-3">
                    <Facebook className="w-5 xs:w-6 h-5 xs:h-6" />
                    Social Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 xs:pt-6 sm:pt-8 px-3 xs:px-4 sm:px-6">
                  <div className="space-y-2">
                    {candidate.OTHERDETAILS && <div><span className="text-xs font-semibold text-muted-foreground">थप विवरण</span><span className="text-sm text-foreground">{candidate.OTHERDETAILS}</span></div>}
                  </div>
                </CardContent>
              </Card>
            )}

                    {/* Political Information */}
                    {candidate.politicalInfo && Object.values(candidate.politicalInfo).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Political Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.politicalInfo.partyName && <div><p className="text-xs font-semibold text-muted-foreground">Party Name</p><p className="text-sm text-foreground">{candidate.politicalInfo.partyName}</p></div>}
                          {candidate.politicalInfo.candidacyLevel && <div><p className="text-xs font-semibold text-muted-foreground">Candidacy Level</p><p className="text-sm text-foreground">{candidate.politicalInfo.candidacyLevel}</p></div>}
                          {candidate.politicalInfo.constituency && <div><p className="text-xs font-semibold text-muted-foreground">Constituency</p><p className="text-sm text-foreground">{candidate.politicalInfo.constituency}</p></div>}
                          {candidate.politicalInfo.electionSymbol && <div><p className="text-xs font-semibold text-muted-foreground">Election Symbol</p><p className="text-sm text-foreground">{candidate.politicalInfo.electionSymbol}</p></div>}
                          {candidate.politicalInfo.isFirstTimeCandidate !== undefined && <div><p className="text-xs font-semibold text-muted-foreground">First Time Candidate</p><p className="text-sm text-foreground">{candidate.politicalInfo.isFirstTimeCandidate ? 'Yes' : 'No'}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {candidate.education && Object.values(candidate.education).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Education</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.education.highestQualification && <div><p className="text-xs font-semibold text-muted-foreground">Highest Qualification</p><p className="text-sm text-foreground">{normalizeEducationQualification(candidate.education.highestQualification)}</p></div>}
                          {candidate.education.subject && <div><p className="text-xs font-semibold text-muted-foreground">Subject</p><p className="text-sm text-foreground">{candidate.education.subject}</p></div>}
                          {candidate.education.institution && <div><p className="text-xs font-semibold text-muted-foreground">Institution</p><p className="text-sm text-foreground">{candidate.education.institution}</p></div>}
                          {candidate.education.country && <div><p className="text-xs font-semibold text-muted-foreground">Country</p><p className="text-sm text-foreground">{candidate.education.country}</p></div>}
                          {candidate.education.additionalTraining && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Additional Training</p><p className="text-sm text-foreground">{candidate.education.additionalTraining}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Professional Experience */}
                    {candidate.professionalExperience && Object.values(candidate.professionalExperience).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Professional Experience</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.professionalExperience.currentProfession && <div><p className="text-xs font-semibold text-muted-foreground">Current Profession</p><p className="text-sm text-foreground">{candidate.professionalExperience.currentProfession}</p></div>}
                          {candidate.professionalExperience.previousExperience && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Previous Experience</p><p className="text-sm text-foreground">{candidate.professionalExperience.previousExperience}</p></div>}
                          {candidate.professionalExperience.organizationResponsibility && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Organization Responsibility</p><p className="text-sm text-foreground">{candidate.professionalExperience.organizationResponsibility}</p></div>}
                          {candidate.professionalExperience.leadershipExperience && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Leadership Experience</p><p className="text-sm text-foreground">{candidate.professionalExperience.leadershipExperience}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Political Experience */}
                    {candidate.politicalExperience && Object.values(candidate.politicalExperience).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Political Experience</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.politicalExperience.partyJoinYear && <div><p className="text-xs font-semibold text-muted-foreground">Party Join Year</p><p className="text-sm text-foreground">{candidate.politicalExperience.partyJoinYear}</p></div>}
                          {candidate.politicalExperience.movementRole && <div><p className="text-xs font-semibold text-muted-foreground">Movement Role</p><p className="text-sm text-foreground">{candidate.politicalExperience.movementRole}</p></div>}
                          {candidate.politicalExperience.previousRepresentativePosition && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Previous Representative Position</p><p className="text-sm text-foreground">{candidate.politicalExperience.previousRepresentativePosition}</p></div>}
                          {candidate.politicalExperience.majorAchievements && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Major Achievements</p><p className="text-sm text-foreground">{candidate.politicalExperience.majorAchievements}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Social Engagement */}
                    {candidate.socialEngagement && Object.values(candidate.socialEngagement).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Social Engagement</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.socialEngagement.ngoInvolvement && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">NGO Involvement</p><p className="text-sm text-foreground">{candidate.socialEngagement.ngoInvolvement}</p></div>}
                          {candidate.socialEngagement.sectorWork && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Sector Work</p><p className="text-sm text-foreground">{candidate.socialEngagement.sectorWork}</p></div>}
                          {candidate.socialEngagement.awardsHonors && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Awards & Honors</p><p className="text-sm text-foreground">{candidate.socialEngagement.awardsHonors}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Financial Information */}
                    {candidate.financialInfo && Object.values(candidate.financialInfo).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Financial Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.financialInfo.movableAssets && <div><p className="text-xs font-semibold text-muted-foreground">Movable Assets</p><p className="text-sm text-foreground">{candidate.financialInfo.movableAssets}</p></div>}
                          {candidate.financialInfo.immovableAssets && <div><p className="text-xs font-semibold text-muted-foreground">Immovable Assets</p><p className="text-sm text-foreground">{candidate.financialInfo.immovableAssets}</p></div>}
                          {candidate.financialInfo.annualIncomeSource && <div class="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Annual Income Source</p><p className="text-sm text-foreground">{candidate.financialInfo.annualIncomeSource}</p></div>}
                          {candidate.financialInfo.bankLoans && <div><p className="text-xs font-semibold text-muted-foreground">Bank Loans</p><p className="text-sm text-foreground">{candidate.financialInfo.bankLoans}</p></div>}
                          {candidate.financialInfo.taxStatus && <div><p className="text-xs font-semibold text-muted-foreground">Tax Status</p><p className="text-sm text-foreground">{candidate.financialInfo.taxStatus}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Legal Status */}
                    {candidate.legalStatus && Object.values(candidate.legalStatus).some(v => v) && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Legal Status</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {candidate.legalStatus.hasCriminalCase !== undefined && <div><p className="text-xs font-semibold text-muted-foreground">Has Criminal Case</p><p className="text-sm text-foreground">{candidate.legalStatus.hasCriminalCase ? 'Yes' : 'No'}</p></div>}
                          {candidate.legalStatus.caseDetails && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Case Details</p><p className="text-sm text-foreground">{candidate.legalStatus.caseDetails}</p></div>}
                          {candidate.legalStatus.eligibilityDeclaration && <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Eligibility Declaration</p><p className="text-sm text-foreground">{candidate.legalStatus.eligibilityDeclaration}</p></div>}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-3 pb-2 border-b">Additional Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {candidate.isActive !== undefined && <div><p className="text-xs font-semibold text-muted-foreground">Active</p><p className="text-sm text-foreground">{candidate.isActive ? 'Yes' : 'No'}</p></div>}
                        {candidate.isVerified !== undefined && <div><p className="text-xs font-semibold text-muted-foreground">Verified</p><p className="text-sm text-foreground">{candidate.isVerified ? 'Yes' : 'No'}</p></div>}
                        {candidate.candidateId && <div><p className="text-xs font-semibold text-muted-foreground">Candidate ID</p><p className="text-sm text-foreground">{candidate.candidateId}</p></div>}
                        {candidate.createdAt && <div><p className="text-xs font-semibold text-muted-foreground">Created On</p><p className="text-sm text-foreground">{new Date(candidate.createdAt).toLocaleDateString()}</p></div>}
                        {candidate.updatedAt && <div><p className="text-xs font-semibold text-muted-foreground">Last Updated</p><p className="text-sm text-foreground">{new Date(candidate.updatedAt).toLocaleDateString()}</p></div>}
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
