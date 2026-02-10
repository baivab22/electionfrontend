import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  User, MapPin, Mail, Phone, Calendar, Globe,
  GraduationCap, Briefcase, Building2, Flag,
  Heart, Wallet, Scale, Target, Award,
  Share2, ArrowLeft, Facebook, Twitter, Instagram, Youtube,
  FileText, Download, MessageCircle, Send, CheckCircle,
  AlertCircle, Clock, Users, BookOpen, Home
} from 'lucide-react';
import API from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CandidateFeedbackSection from '@/components/CandidateFeedbackSection';

interface Candidate {
  _id: string;
  personalInfo: {
    fullName: string;
    fullName_np?: string;
    nickname?: string;
    nickname_np?: string;
    dateOfBirth: string;
    age?: number;
    gender: string;
    gender_np?: string;
    maritalStatus?: string;
    maritalStatus_np?: string;
    permanentAddress?: string;
    permanentAddress_np?: string;
    currentAddress?: string;
    currentAddress_np?: string;
    citizenshipNumber?: string;
    citizenshipIssuedDistrict?: string;
    citizenshipIssuedDistrict_np?: string;
    contactNumber: string;
    email: string;
    website?: string;
    profilePhoto?: string;
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
    previousElectionHistory_np?: string;
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
    additionalTraining_np?: string;
  };
  professionalExperience?: {
    currentProfession?: string;
    currentProfession_np?: string;
    previousExperience?: string;
    previousExperience_np?: string;
    organizationResponsibility?: string;
    organizationResponsibility_np?: string;
    leadershipExperience?: string;
    leadershipExperience_np?: string;
  };
  politicalExperience?: {
    partyJoinYear?: string;
    movementRole?: string;
    movementRole_np?: string;
    previousRepresentativePosition?: string;
    previousRepresentativePosition_np?: string;
    majorAchievements?: string;
    majorAchievements_np?: string;
  };
  socialEngagement?: {
    ngoInvolvement?: string;
    ngoInvolvement_np?: string;
    sectorWork?: string;
    sectorWork_np?: string;
    awardsHonors?: string;
    awardsHonors_np?: string;
  };
  financialInfo?: {
    movableAssets?: string;
    movableAssets_np?: string;
    immovableAssets?: string;
    immovableAssets_np?: string;
    annualIncomeSource?: string;
    annualIncomeSource_np?: string;
    bankLoans?: string;
    bankLoans_np?: string;
    taxStatus?: string;
    taxStatus_np?: string;
  };
  legalStatus?: {
    hasCriminalCase?: boolean;
    caseDetails?: string;
    caseDetails_np?: string;
    eligibilityDeclaration?: string;
    eligibilityDeclaration_np?: string;
  };
  visionGoals?: {
    vision?: string;
    vision_np?: string;
    goals?: string;
    goals_np?: string;
    declaration?: string;
    declaration_np?: string;
    manifesto?: string;
    manifesto_np?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  campaign?: {
    campaignSlogan?: string;
    campaignSlogan_np?: string;
  };
  likes?: number;
  shares?: number;
  isVerified?: boolean;
  isActive?: boolean;
}

const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch candidate');
        const data = await response.json();
        setCandidate(data.data);
        setLikesCount(data.data.likes || 0);
        setSharesCount(data.data.shares || 0);
        
        const likedCandidates = JSON.parse(localStorage.getItem('likedCandidates') || '[]');
        setIsLiked(likedCandidates.includes(id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCandidate();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      const response = await API.candidates.likeCandidate(id);
      setLikesCount(response.data.likes);
      setIsLiked(response.data.isLiked);
      
      const likedCandidates = JSON.parse(localStorage.getItem('likedCandidates') || '[]');
      if (response.data.isLiked) {
        likedCandidates.push(id);
      } else {
        const index = likedCandidates.indexOf(id);
        if (index > -1) likedCandidates.splice(index, 1);
      }
      localStorage.setItem('likedCandidates', JSON.stringify(likedCandidates));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleShare = async () => {
    // Toggle inline share menu on desktop; use native share on supporting devices
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: candidate?.personalInfo.fullName, url });
        await recordShare();
      } catch (err) {
        // user cancelled or error
      }
      return;
    }

    // Show custom share menu for non-supported devices
    setShowShareMenu(prev => !prev);
  };

  const recordShare = async () => {
    if (!id) return;
    try {
      const res = await API.candidates.shareCandidate(id);
      setSharesCount(res.data.shares ?? (sharesCount + 1));
    } catch (e) {
      // ignore server errors
      setSharesCount(prev => prev + 1);
    }
  };

  const openShareWindow = async (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    await recordShare();
    setShowShareMenu(false);
  };

  const handleShareTo = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'linkedin' | 'email' | 'copy') => {
    const pageUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(candidate?.personalInfo.fullName || '');
    const text = encodeURIComponent(`Check out ${candidate?.personalInfo.fullName}`);

    if (platform === 'facebook') {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      await openShareWindow(shareUrl);
      return;
    }

    if (platform === 'twitter') {
      const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`;
      await openShareWindow(shareUrl);
      return;
    }

    if (platform === 'whatsapp') {
      const shareUrl = `https://api.whatsapp.com/send?text=${text}%20${pageUrl}`;
      await openShareWindow(shareUrl);
      return;
    }

    if (platform === 'linkedin') {
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
      await openShareWindow(shareUrl);
      return;
    }

    if (platform === 'email') {
      const mailto = `mailto:?subject=${title}&body=${text}%0A%0A${pageUrl}`;
      window.location.href = mailto;
      await recordShare();
      setShowShareMenu(false);
      return;
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied', description: 'Profile link copied to clipboard' });
        await recordShare();
      } catch (e) {
        toast({ title: 'Copy failed', description: 'Could not copy link', variant: 'destructive' });
      }
      setShowShareMenu(false);
      return;
    }
  };

  const SocialLinks = ({ socialMedia }: { socialMedia?: Candidate['socialMedia'] }) => {
    if (!socialMedia) return null;

    const links: Array<{ key: string; url?: string; Icon: any; label: string }> = [
      { key: 'facebook', url: socialMedia.facebook, Icon: Facebook, label: 'Facebook' },
      { key: 'twitter', url: socialMedia.twitter, Icon: Twitter, label: 'Twitter' },
      { key: 'instagram', url: socialMedia.instagram, Icon: Instagram, label: 'Instagram' },
      { key: 'youtube', url: socialMedia.youtube, Icon: Youtube, label: 'YouTube' },
      { key: 'linkedin', url: socialMedia.linkedin, Icon: Users, label: 'LinkedIn' },
      { key: 'tiktok', url: socialMedia.tiktok, Icon: Users, label: 'TikTok' },
      { key: 'website', url: candidate?.personalInfo.website, Icon: Globe, label: 'Website' }
    ];

    const visible = links.filter(l => l.url && l.url.trim() !== '');
    if (visible.length === 0) return null;

    return (
      <div className="mt-4">
        <p className="text-sm text-white/90 mb-2 font-medium">Connect on</p>
        <div className="flex flex-wrap gap-3">
          {visible.map(link => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${link.label}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md transition"
            >
              <link.Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const parts = String(dateOfBirth).trim().split(/[\/\-\.\s]+/).map(p => p.trim()).filter(Boolean);
    let y: number, m: number, d: number;
    if (parts.length === 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD
        y = Number(parts[0]); m = Number(parts[1]) - 1; d = Number(parts[2]);
      } else { // assume DD-MM-YYYY
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

  const InfoItem = ({ icon: Icon, label, value, valueNp }: { icon: any; label: string; value?: string; valueNp?: string }) => {
    if (!value && !valueNp) return null;
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-red-100 rounded-lg">
          <Icon className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-sm text-gray-800 font-semibold">{value}</p>
          {valueNp && <p className="text-sm text-gray-600">{valueNp}</p>}
        </div>
      </div>
    );
  };

  const SectionCard = ({ title, titleNp, icon: Icon, children }: { title: string; titleNp: string; icon: any; children: React.ReactNode }) => (
    <Card className="border-0 shadow-lg mb-6 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="block">{titleNp}</span>
            <span className="text-sm font-normal opacity-80">{title}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );

  const TextBlock = ({ label, value, valueNp }: { label: string; value?: string; valueNp?: string }) => {
    if (!value && !valueNp) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{label}</h4>
        {value && <p className="text-gray-600 whitespace-pre-wrap">{value}</p>}
        {valueNp && <p className="text-gray-500 mt-1 whitespace-pre-wrap">{valueNp}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
        <Card className="border-red-200 bg-red-50 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'Candidate not found'}</p>
            <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6 text-red-100">
            <button onClick={() => navigate('/')} className="hover:text-white flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/candidates')} className="hover:text-white">Candidates</button>
            <span>/</span>
            <span className="text-white font-semibold">{candidate.personalInfo.fullName}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                {candidate.personalInfo.profilePhoto ? (
                  <img
                    src={candidate.personalInfo.profilePhoto}
                    alt={candidate.personalInfo.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-100">
                    <User className="w-20 h-20 text-red-300" />
                  </div>
                )}
              </div>
              {candidate.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {candidate.personalInfo.fullName}
              </h1>
              {candidate.personalInfo.fullName_np && (
                <p className="text-xl text-red-100 mb-4">{candidate.personalInfo.fullName_np}</p>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                {candidate.politicalInfo?.partyName && (
                  <Badge className="bg-yellow-500 text-black px-3 py-1">
                    <Flag className="w-3 h-3 mr-1" />
                    {candidate.politicalInfo.partyName}
                  </Badge>
                )}
                {candidate.politicalInfo?.constituency && (
                  <Badge className="bg-white/20 text-white px-3 py-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {candidate.politicalInfo.constituency}
                  </Badge>
                )}
                {candidate.politicalInfo?.candidacyLevel && (
                  <Badge className="bg-white/20 text-white px-3 py-1">
                    {candidate.politicalInfo.candidacyLevel}
                  </Badge>
                )}
              </div>

              {candidate.campaign?.campaignSlogan && (
                <p className="text-lg italic text-red-100 mb-4">
                  "{candidate.campaign.campaignSlogan}"
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Age: {candidate.personalInfo.age || calculateAge(candidate.personalInfo.dateOfBirth)} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>  {candidate.personalInfo.contactNumber.slice(0, -2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.personalInfo.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-6">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? "default" : "outline"}
                  aria-pressed={isLiked}
                  className={`flex items-center gap-2 ${isLiked ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'border-white text-black hover:bg-white/20'}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current text-white' : ''}`} />
                  {likesCount} Likes
                </Button>
                <div className="relative">
                  <Button onClick={handleShare} variant="outline" className="border-white text-black hover:bg-white/20">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share ({sharesCount})
                  </Button>
                  {/* Share menu for non-native share-capable browsers */}
                  {showShareMenu && (
                    <div className="absolute mt-2 bg-white rounded-lg shadow-lg right-0 z-50 w-56 text-sm">
                      <div className="p-2">
                        <button onClick={() => handleShareTo('facebook')} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
                          <Facebook className="w-4 h-4" /> Share on Facebook
                        </button>
                        <button onClick={() => handleShareTo('twitter')} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
                          <Twitter className="w-4 h-4" /> Share on Twitter
                        </button>
                        <button onClick={() => handleShareTo('whatsapp')} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
                          <Instagram className="w-4 h-4" /> Share on WhatsApp
                        </button>
                        <button onClick={() => handleShareTo('linkedin')} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
                          <Globe className="w-4 h-4" /> Share on LinkedIn
                        </button>
                        <div className="border-t my-1" />
                      <button onClick={() => handleShareTo('copy')} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
                        <FileText className="w-4 h-4" /> Copy Link
                      </button>
                      <button onClick={() => handleShareTo('email')} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
                        <Mail className="w-4 h-4" /> Share via Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Social links */}
              <SocialLinks socialMedia={candidate.socialMedia} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-white p-2 rounded-lg shadow mb-6">
            <TabsTrigger value="personal" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />व्यक्तिगत
            </TabsTrigger>
            <TabsTrigger value="political" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Flag className="w-4 h-4 mr-2" />राजनीतिक
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <GraduationCap className="w-4 h-4 mr-2" />शिक्षा
            </TabsTrigger>
            <TabsTrigger value="professional" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" />पेशागत
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />सामाजिक
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Wallet className="w-4 h-4 mr-2" />आर्थिक
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Scale className="w-4 h-4 mr-2" />कानुनी
            </TabsTrigger>
            <TabsTrigger value="vision" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />दृष्टि
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <SectionCard title="Basic Personal Information" titleNp="१. आधारभूत व्यक्तिगत विवरण" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem icon={User} label="पूरा नाम / Full Name" value={candidate.personalInfo.fullName} valueNp={candidate.personalInfo.fullName_np} />
                <InfoItem icon={User} label="उपनाम / Nickname" value={candidate.personalInfo.nickname} valueNp={candidate.personalInfo.nickname_np} />
                <InfoItem icon={Calendar} label="जन्म मिति / Date of Birth" value={new Date(candidate.personalInfo.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <InfoItem icon={User} label="उमेर / Age" value={`${candidate.personalInfo.age || calculateAge(candidate.personalInfo.dateOfBirth)} वर्ष`} />
                <InfoItem icon={User} label="लिङ्ग / Gender" value={candidate.personalInfo.gender} valueNp={candidate.personalInfo.gender_np} />
                <InfoItem icon={Heart} label="वैवाहिक स्थिति / Marital Status" value={candidate.personalInfo.maritalStatus} valueNp={candidate.personalInfo.maritalStatus_np} />
                <InfoItem icon={Home} label="स्थायी ठेगाना / Permanent Address" value={candidate.personalInfo.permanentAddress} valueNp={candidate.personalInfo.permanentAddress_np} />
                <InfoItem icon={MapPin} label="हालको ठेगाना / Current Address" value={candidate.personalInfo.currentAddress} valueNp={candidate.personalInfo.currentAddress_np} />
                <InfoItem icon={FileText} label="नागरिकता नम्बर / Citizenship No." value={candidate.personalInfo.citizenshipNumber} />
                <InfoItem icon={MapPin} label="नागरिकता जारी जिल्ला / Citizenship District" value={candidate.personalInfo.citizenshipIssuedDistrict} valueNp={candidate.personalInfo.citizenshipIssuedDistrict_np} />
                <InfoItem icon={Phone} label="सम्पर्क नम्बर / Contact" value={candidate.personalInfo.contactNumber} />
                <InfoItem icon={Mail} label="इमेल / Email" value={candidate.personalInfo.email} />
                <InfoItem icon={Globe} label="वेबसाइट / Website" value={candidate.personalInfo.website} />
              </div>
            </SectionCard>
          </TabsContent>

          {/* Political Info Tab */}
          <TabsContent value="political">
            <SectionCard title="Political Introduction" titleNp="२. राजनीतिक परिचय" icon={Flag}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <InfoItem icon={Flag} label="पार्टीको नाम / Party Name" value={candidate.politicalInfo?.partyName} valueNp={candidate.politicalInfo?.partyName_np} />
                <InfoItem icon={Briefcase} label="वर्तमान पद / Current Position" value={candidate.politicalInfo?.currentPosition} valueNp={candidate.politicalInfo?.currentPosition_np} />
                <InfoItem icon={Building2} label="उम्मेदवारी तह / Candidacy Level" value={candidate.politicalInfo?.candidacyLevel} valueNp={candidate.politicalInfo?.candidacyLevel_np} />
                <InfoItem icon={MapPin} label="निर्वाचन क्षेत्र नम्बर / Constituency No." value={candidate.politicalInfo?.constituencyNumber} />
                <InfoItem icon={MapPin} label="निर्वाचन क्षेत्र / Constituency" value={candidate.politicalInfo?.constituency} valueNp={candidate.politicalInfo?.constituency_np} />
                <InfoItem icon={Award} label="निर्वाचन चिन्ह / Election Symbol" value={candidate.politicalInfo?.electionSymbol} valueNp={candidate.politicalInfo?.electionSymbol_np} />
                <InfoItem icon={User} label="पहिलो पटक उम्मेदवार / First Time Candidate" value={candidate.politicalInfo?.isFirstTimeCandidate ? 'हो (Yes)' : 'होइन (No)'} />
              </div>
              <TextBlock label="विगतको निर्वाचन इतिहास / Previous Election History" value={candidate.politicalInfo?.previousElectionHistory} valueNp={candidate.politicalInfo?.previousElectionHistory_np} />
            </SectionCard>

            <SectionCard title="Political Experience & Contribution" titleNp="५. राजनीतिक अनुभव र योगदान" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoItem icon={Calendar} label="पार्टीमा आबद्ध भएको वर्ष / Party Join Year" value={candidate.politicalExperience?.partyJoinYear} />
              </div>
              <TextBlock label="आन्दोलन / अभियानमा भूमिका / Movement Role" value={candidate.politicalExperience?.movementRole} valueNp={candidate.politicalExperience?.movementRole_np} />
              <TextBlock label="जनप्रतिनिधि पद र कार्यकाल / Representative Position" value={candidate.politicalExperience?.previousRepresentativePosition} valueNp={candidate.politicalExperience?.previousRepresentativePosition_np} />
              <TextBlock label="मुख्य उपलब्धिहरू / Major Achievements" value={candidate.politicalExperience?.majorAchievements} valueNp={candidate.politicalExperience?.majorAchievements_np} />
            </SectionCard>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <SectionCard title="Educational Qualification" titleNp="३. शैक्षिक योग्यता" icon={GraduationCap}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <InfoItem icon={GraduationCap} label="उच्चतम शैक्षिक योग्यता / Highest Qualification" value={candidate.education?.highestQualification} valueNp={candidate.education?.highestQualification_np} />
                <InfoItem icon={BookOpen} label="विषय / संकाय / Subject" value={candidate.education?.subject} valueNp={candidate.education?.subject_np} />
                <InfoItem icon={Building2} label="अध्ययन गरेको संस्था / Institution" value={candidate.education?.institution} valueNp={candidate.education?.institution_np} />
                <InfoItem icon={Globe} label="देश / Country" value={candidate.education?.country} valueNp={candidate.education?.country_np} />
              </div>
              <TextBlock label="अतिरिक्त तालिम / प्रमाणपत्र / अनुसन्धान" value={candidate.education?.additionalTraining} valueNp={candidate.education?.additionalTraining_np} />
            </SectionCard>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional">
            <SectionCard title="Professional Experience" titleNp="४. पेशागत अनुभव" icon={Briefcase}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoItem icon={Briefcase} label="हालको पेशा / Current Profession" value={candidate.professionalExperience?.currentProfession} valueNp={candidate.professionalExperience?.currentProfession_np} />
              </div>
              <TextBlock label="विगतको पेशागत अनुभव / Previous Experience" value={candidate.professionalExperience?.previousExperience} valueNp={candidate.professionalExperience?.previousExperience_np} />
              <TextBlock label="संस्थामा जिम्मेवारी / Organization Responsibility" value={candidate.professionalExperience?.organizationResponsibility} valueNp={candidate.professionalExperience?.organizationResponsibility_np} />
              <TextBlock label="नेतृत्व वा व्यवस्थापन अनुभव / Leadership Experience" value={candidate.professionalExperience?.leadershipExperience} valueNp={candidate.professionalExperience?.leadershipExperience_np} />
            </SectionCard>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <SectionCard title="Social & Community Engagement" titleNp="६. सामाजिक तथा सामुदायिक संलग्नता" icon={Heart}>
              <TextBlock label="सामाजिक सेवा / NGO संलग्नता" value={candidate.socialEngagement?.ngoInvolvement} valueNp={candidate.socialEngagement?.ngoInvolvement_np} />
              <TextBlock label="शिक्षा, स्वास्थ्य, युवा, महिला, कृषि क्षेत्रमा काम" value={candidate.socialEngagement?.sectorWork} valueNp={candidate.socialEngagement?.sectorWork_np} />
              <TextBlock label="प्राप्त सम्मान वा पुरस्कार / Awards & Honors" value={candidate.socialEngagement?.awardsHonors} valueNp={candidate.socialEngagement?.awardsHonors_np} />
            </SectionCard>

            {/* Social Media Links */}
            {candidate.socialMedia && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Globe className="w-5 h-5" />
                    सामाजिक सञ्जाल / Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {candidate.socialMedia.facebook && (
                      <a href={candidate.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Facebook className="w-5 h-5" /> Facebook
                      </a>
                    )}
                    {candidate.socialMedia.twitter && (
                      <a href={candidate.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                        <Twitter className="w-5 h-5" /> Twitter
                      </a>
                    )}
                    {candidate.socialMedia.instagram && (
                      <a href={candidate.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                        <Instagram className="w-5 h-5" /> Instagram
                      </a>
                    )}
                    {candidate.socialMedia.youtube && (
                      <a href={candidate.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <Youtube className="w-5 h-5" /> YouTube
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <SectionCard title="Financial Information" titleNp="७. आर्थिक विवरण" icon={Wallet}>
              <TextBlock label="चल सम्पत्ति विवरण / Movable Assets" value={candidate.financialInfo?.movableAssets} valueNp={candidate.financialInfo?.movableAssets_np} />
              <TextBlock label="अचल सम्पत्ति विवरण / Immovable Assets" value={candidate.financialInfo?.immovableAssets} valueNp={candidate.financialInfo?.immovableAssets_np} />
              <TextBlock label="वार्षिक आय स्रोत / Annual Income Source" value={candidate.financialInfo?.annualIncomeSource} valueNp={candidate.financialInfo?.annualIncomeSource_np} />
              <TextBlock label="बैंक ऋण वा अन्य दायित्व / Bank Loans" value={candidate.financialInfo?.bankLoans} valueNp={candidate.financialInfo?.bankLoans_np} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={FileText} label="कर तिरेको स्थिति / Tax Status" value={candidate.financialInfo?.taxStatus} valueNp={candidate.financialInfo?.taxStatus_np} />
              </div>
            </SectionCard>
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal">
            <SectionCard title="Legal Status" titleNp="८. कानुनी अवस्था" icon={Scale}>
              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${candidate.legalStatus?.hasCriminalCase ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {candidate.legalStatus?.hasCriminalCase ? (
                    <><AlertCircle className="w-5 h-5" /> आपराधिक मुद्दा छ (Has Criminal Case)</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> कुनै आपराधिक मुद्दा छैन (No Criminal Case)</>
                  )}
                </div>
              </div>
              {candidate.legalStatus?.hasCriminalCase && (
                <TextBlock label="अदालतको फैसला वा विचाराधीन मुद्दा विवरण" value={candidate.legalStatus?.caseDetails} valueNp={candidate.legalStatus?.caseDetails_np} />
              )}
              <TextBlock label="निर्वाचन लड्न योग्यताको घोषणा / Eligibility Declaration" value={candidate.legalStatus?.eligibilityDeclaration} valueNp={candidate.legalStatus?.eligibilityDeclaration_np} />
            </SectionCard>
          </TabsContent>

          {/* Vision Tab */}
          <TabsContent value="vision">
            <SectionCard title="Vision, Goals & Declaration" titleNp="९. दृष्टि, लक्ष्य र घोषण" icon={Target}>
              <TextBlock label="दृष्टि / Vision" value={candidate.visionGoals?.vision} valueNp={candidate.visionGoals?.vision_np} />
              <Separator className="my-4" />
              <TextBlock label="लक्ष्य / Goals" value={candidate.visionGoals?.goals} valueNp={candidate.visionGoals?.goals_np} />
              <Separator className="my-4" />
              <TextBlock label="घोषणा / Declaration" value={candidate.visionGoals?.declaration} valueNp={candidate.visionGoals?.declaration_np} />
              {candidate.visionGoals?.manifesto && (
                <>
                  <Separator className="my-4" />
                  <TextBlock label="घोषणापत्र / Manifesto" value={candidate.visionGoals?.manifesto} valueNp={candidate.visionGoals?.manifesto_np} />
                </>
              )}
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Back Button */}
        <div className="mt-8 text-center">
          {/* Candidate feedback section */}
          <div className="max-w-3xl mx-auto mb-6">
            <CandidateFeedbackSection candidateId={id as string} candidateName={candidate.personalInfo.fullName} />
          </div>
          <Button onClick={() => navigate('/candidates')} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            सबै उम्मेदवारहरू हेर्नुहोस् / View All Candidates
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CandidateDetailPage;
