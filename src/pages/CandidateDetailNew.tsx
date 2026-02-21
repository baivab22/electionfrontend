             
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  User, MapPin, Mail, Phone, Calendar, Globe,
  GraduationCap, Briefcase, Building2, Flag,
  Heart, Wallet, Scale, Target, Award,
  Share2, ArrowLeft, Facebook, Twitter, Instagram, Youtube, Linkedin,
  FileText, Download, MessageCircle, Send, CheckCircle,
  AlertCircle, Clock, Users, BookOpen, Home, Maximize2, X, Link, Copy, Check
} from 'lucide-react';
import API from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CandidateFeedbackSection from '@/components/CandidateFeedbackSection';

// Normalize party names - replace all variations with standard NCP name
const normalizePartyName = (partyName?: string): string => {
  if (!partyName) return '';
  const normalized = partyName.trim();
  // Replace any variation of NCP with the standard name
  if (
    normalized.includes('कम्युनिस्ट') ||
    normalized.includes('कम्युनिसट') ||
    normalized.includes('कम्युनिष्ट')
  ) {
    return 'नेपाली कम्युनिष्ट पार्टी';
  }
  return normalized;
};

interface Candidate {
  _id: string;
  candidateId?: string;
  rawSource?: {
    AGE_YR?: number;
    CandidateID?: number;
    CandidateName?: string;
    [key: string]: any;
  };
  personalInfo?: {
    fullName?: string;
    fullName_np?: string;
    nickname?: string;
    nickname_np?: string;
    dateOfBirth?: string;
    age?: number;
    gender?: string;
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
    contactNumber?: string;
    email?: string;
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
    district?: string;
    district_np?: string;
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
  const [candidate, setCandidate] = useState< any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch candidate');
        const data = await response.json();

        
        setCandidate(data.data);
        setImageLoadError(false);
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
        await navigator.share({ title: candidate?.personalInfo?.fullName, url });
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
    const title = encodeURIComponent(candidate?.personalInfo?.fullName || '');
    const text = encodeURIComponent(`Check out ${candidate?.personalInfo?.fullName}`);

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
      { key: 'website', url: candidate?.personalInfo?.website, Icon: Globe, label: 'Website' }
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

  const getCandidateImageUrl = (candidate: any): string | null => {
    // Prefer CandidateID (number or string), fallback to candidateId
    const id = candidate.CandidateID || candidate.candidateId;
    if (id) return `https://result.election.gov.np/Images/Candidate/${id}.jpg`;
    return null;
  };

  const getAge = (): number | string => {
    // Priority 1: Use AGE_YR from rawSource if available
    if (candidate?.rawSource?.AGE_YR && candidate?.rawSource?.AGE_YR > 0) {
      return candidate?.rawSource?.AGE_YR;
    }
    // Priority 2: Use personalInfo.age if available
    if (candidate?.personalInfo?.age && candidate?.personalInfo?.age > 0) {
      return candidate?.personalInfo?.age;
    }
    // Priority 3: Calculate from dateOfBirth
    return calculateAge(candidate?.personalInfo?.dateOfBirth || '');
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

    // If date is the default 1970-01-01, data is missing - return "Not provided"
    if (y === 1970 && m === 0 && d === 1) return 'Not provided';
    
    const today = new Date();
    
    // Since data is in BS (Bikram Sambat), calculate age using BS:
    // Current BS year is 2082
    // Age = Current BS year - Birth BS year
    if (y >= 1940 && y <= 2082) {
      const currentBsYear = 2082;
      const age = currentBsYear - y;
      
      // Validate age is reasonable (18-120 years)
      if (age >= 18 && age <= 120) {
        return age;
      }
    }
    
    // Fallback to AD calculation if BS calculation fails
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
    
    if (age >= 18 && age <= 120) {
      return age;
    }
    
    return '';
  };

  const formatDateOfBirth = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Not provided';
    const raw = String(dateOfBirth).trim();

    const parts = raw.split(/[\/\-\.\s]+/).map(p => p.trim()).filter(Boolean);
    let y: number | undefined;
    let m: number | undefined;
    let d: number | undefined;

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = Number(parts[0]); m = Number(parts[1]); d = Number(parts[2]);
      } else {
        y = Number(parts[2]); m = Number(parts[1]); d = Number(parts[0]);
      }
    } else {
      const dt = new Date(raw);
      if (!isNaN(dt.getTime())) {
        y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
      }
    }

    if (!y || !m || !d) return raw;

    if (y === 1970 && m === 1 && d === 1) return 'Not provided';

    // BS dates should be shown as-is (avoid AD conversion)
    if (y >= 1940 && y <= 2082) return raw;

    const dt = new Date(y, m - 1, d);
    if (isNaN(dt.getTime())) return raw;
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const InfoItem = ({ icon: Icon, label, value, valueNp }: { icon: any; label: string; value?: string; valueNp?: string }) => {
    if (!value && !valueNp) return null;
    return (
      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
        <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-bold mb-1">{label}</p>
          <p className="text-base text-gray-900 font-bold">{value}</p>
          {valueNp && <p className="text-sm text-gray-700 font-semibold mt-1">{valueNp}</p>}
        </div>
      </div>
    );
  };

  const SectionCard = ({ title, titleNp, icon: Icon, children }: { title: string; titleNp: string; icon: any; children: React.ReactNode }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all mb-4 overflow-hidden rounded-xl bg-white">
      <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100 py-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-gray-900 font-bold text-lg">{titleNp}</span>
            <span className="text-sm font-semibold text-gray-600">{title}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );

  const TextBlock = ({ label, value, valueNp }: { label: string; value?: string; valueNp?: string }) => {
    if (!value && !valueNp) return null;
    return (
      <div className="mb-5">
        <h4 className="text-base font-bold text-gray-800 mb-2.5">{label}</h4>
        {value && <p className="text-base text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{value}</p>}
        {valueNp && <p className="text-base text-gray-600 font-medium mt-2 whitespace-pre-wrap leading-relaxed">{valueNp}</p>}
      </div>
    );
  };

  const ElectionSymbolCard = ({ symbolImage, symbolText, symbolTextNp }: { symbolImage?: string; symbolText?: string; symbolTextNp?: string }) => {
    if (!symbolImage && !symbolText && !symbolTextNp) return null;
    return (
      <Card className="border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-400 border-b-4 border-yellow-500 py-5 px-6">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <div className="p-3 bg-yellow-600 rounded-lg shadow-md animate-pulse">
              <Award className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <span className="block text-yellow-900 font-black text-2xl md:text-3xl">निर्वाचन चिन्ह</span>
              <span className="text-sm font-bold text-yellow-800">Election Symbol</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {symbolImage && (
              <div className="flex-shrink-0">
                <div className="w-40 h-40 md:w-56 md:h-56 p-4 bg-white border-4 border-yellow-300 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                  <img 
                    src={symbolImage} 
                    alt="Election Symbol"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200?text=Symbol';
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="space-y-4">
                <h3 className="text-lg md:text-2xl font-black text-yellow-900">चिन्ह (Symbol)</h3>
                {symbolTextNp && (
                  <p className="text-lg md:text-xl font-bold text-gray-800 leading-relaxed">
                    {symbolTextNp}
                  </p>
                )}
                {symbolText && (
                  <p className="text-base md:text-lg font-semibold text-gray-700 leading-relaxed">
                    {symbolText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const formatRawValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  };

  // Format field names to be human-readable
  const formatFieldName = (key: string): string => {
    const fieldNameMap: Record<string, string> = {
      'CandidateID': 'Candidate ID',
      'CandidateName': 'Candidate Name',
      'AGE_YR': 'Age (Years)',
      'Gender': 'Gender',
      'FATHER_NAME': 'Father\'s Name',
      'MOTHER_NAME': 'Mother\'s Name',
      'ADDRESS': 'Address',
      'ContactNumber': 'Contact Number',
      'Email': 'Email Address',
      'PoliticalPartyName': 'Political Party',
      'PartySymbol': 'Party Symbol',
      'DistrictName': 'District Name',
      'ConstName': 'Constituency Name',
      'ConstituencyNumber': 'Constituency Number',
      'QUALIFICATION': 'Educational Qualification',
      'EXPERIENCE': 'Professional Experience',
      'Occupation': 'Occupation',
      'ImageURL': 'Image URL',
      'Assets': 'Total Assets',
      'Liabilities': 'Total Liabilities',
      'CriminalCases': 'Criminal Cases',
      'ElectionSymbol': 'Election Symbol'
    };
    return fieldNameMap[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Categorize raw data fields
  const categorizeRawData = (rawSource: Record<string, any>) => {
    const personalFields = [
      'CandidateName', 'AGE_YR', 'Age', 'Gender',
      'FATHER_NAME', 'FatherName', 'MOTHER_NAME', 'MotherName',
      'ADDRESS', 'Address', 'ContactNumber', 'Contact', 'Email',
      'Nationality', 'Religion', 'Caste', 'MaritalStatus'
    ];
    
    const politicalFields = [
      'PoliticalPartyName', 'PartyName', 'Party', 'PartySymbol',
      'DistrictName', 'District', 'ConstName', 'Constituency',
      'ConstituencyNumber', 'ElectionSymbol', 'CandidacyLevel'
    ];
    
    const educationFields = [
      'QUALIFICATION', 'Qualification', 'Education', 'HighestQualification',
      'Degree', 'University', 'Institution', 'EducationalBackground'
    ];
    
    const professionalFields = [
      'EXPERIENCE', 'Experience', 'Occupation', 'Profession',
      'ProfessionalBackground', 'CurrentJob', 'Employment'
    ];
    
    const financialFields = [
      'Assets', 'TotalAssets', 'Movable', 'Immovable',
      'Liabilities', 'TotalLiabilities', 'Income', 'NetWorth'
    ];
    
    const legalFields = [
      'CriminalCases', 'PendingCases', 'ConvictedCases',
      'CourtCases', 'LegalIssues'
    ];

    const categorized: Record<string, Record<string, any>> = {
      personal: {},
      political: {},
      education: {},
      professional: {},
      financial: {},
      legal: {},
      other: {}
    };

    Object.entries(rawSource).forEach(([key, value]) => {
      if (personalFields.includes(key)) {
        categorized.personal[key] = value;
      } else if (politicalFields.includes(key)) {
        categorized.political[key] = value;
      } else if (educationFields.includes(key)) {
        categorized.education[key] = value;
      } else if (professionalFields.includes(key)) {
        categorized.professional[key] = value;
      } else if (financialFields.includes(key)) {
        categorized.financial[key] = value;
      } else if (legalFields.includes(key)) {
        categorized.legal[key] = value;
      } else if (key !== 'CandidateID' && key !== 'ImageURL') {
        // Skip technical fields but include everything else in other
        categorized.other[key] = value;
      }
    });

    // Remove empty categories
    Object.keys(categorized).forEach(category => {
      if (Object.keys(categorized[category]).length === 0) {
        delete categorized[category];
      }
    });

    return categorized;
  };

  console.log(candidate,"candidate hai")

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="border-gray-200 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{error || 'Candidate not found'}</p>
            <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile/desktop responsive search bar at the top */}
      {/* <div className="w-full flex flex-col items-center py-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="w-full max-w-2xl px-2 sm:px-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="🔍 Search candidate details..."
            className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg rounded-full border-4 border-primary/80 focus:border-accent focus:ring-4 focus:ring-accent/30 shadow-lg font-semibold text-gray-900 bg-white placeholder-gray-400 outline-none transition-all duration-200"
            style={{ boxShadow: '0 0 0 3px #f87171, 0 2px 8px rgba(0,0,0,0.08)' }}
          />
        </div>
      </div> */}
      {/* Hero Section */}
  

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Vertical Tabs Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-100 overflow-hidden lg:sticky lg:top-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-2 sm:p-3">
                <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  मैनु / Menu
                </h3>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'general'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">General Detail</div>
                    <div className="text-xs opacity-70 truncate">सामान्य विवरण</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'personal'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">व्यक्तिगत</div>
                    <div className="text-[10px] sm:text-xs opacity-70 truncate">Personal</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('political')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'political'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Flag className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">राजनीतिक</div>
                    <div className="text-xs opacity-70 truncate">Political</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('education')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'education'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">शिक्षा</div>
                    <div className="text-xs opacity-70 truncate">Education</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'professional'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">पेशागत</div>
                    <div className="text-xs opacity-70 truncate">Professional</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('social')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'social'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Heart className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">सामाजिक</div>
                    <div className="text-xs opacity-70 truncate">Social</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('financial')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'financial'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Wallet className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">आर्थिक</div>
                    <div className="text-xs opacity-70 truncate">Financial</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('legal')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'legal'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Scale className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">कानुनी</div>
                    <div className="text-xs opacity-70 truncate">Legal</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'vision'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">दृष्टि</div>
                    <div className="text-xs opacity-70 truncate">Vision</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('additional')}
                  className={`w-full px-3 py-2.5 text-left font-medium transition-all flex items-center gap-2.5 rounded-lg ${
                    activeTab === 'additional'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">अतिरिक्त</div>
                    <div className="text-xs opacity-70 truncate">Additional</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* General Detail Tab */}
            {activeTab === 'general' && candidate && (
              <div className="space-y-6">
                {/* Banner with profile photo, name, area */}
                <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden flex items-end bg-red-600 shadow-lg">
                  <img
                    src={candidate.profilepicture}
                    alt={candidate.name}
                    className="absolute inset-0 w-full h-full object-contain object-center opacity-80"
                    style={{ background: '#fff' }}
                  />
                  {/* Fullscreen button overlay */}
                  <button
                    className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition"
                    onClick={() => setPhotoModalOpen(true)}
                    aria-label="View profile photo in full screen"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </button>
                  <div className="relative z-10 w-full flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow mb-1">{candidate.name}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-6 h-6 text-white/80" />
                      <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/90 drop-shadow">{candidate.area}</span>
                    </div>
                  </div>
                </div>
                {/* Cards for each detail */}
                {/* Battleground Analysis Section */}
           
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Age & Gender Card */}
                  <Card className="bg-white border-0 shadow-lg rounded-2xl col-span-1 md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-extrabold text-red-600 tracking-wide border-b-2 border-red-100 pb-1 mb-2">About Candidate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Content before Battleground Analysis */}
                      {candidate.detaildescription && (() => {
                        const desc = candidate.detaildescription;
                        const highlight = 'Battleground Analysis';
                        const highlightIdx = desc.indexOf(highlight);
                        let beforeBattleground = '';
                        if (highlightIdx !== -1) {
                          beforeBattleground = desc.slice(0, highlightIdx).trim();
                        } else {
                          beforeBattleground = desc.trim();
                        }
                        return (
                          <div className="prose max-w-none text-gray-900 text-base font-semibold leading-relaxed whitespace-pre-line mb-6">
                            {beforeBattleground}
                          </div>
                        );
                      })()}
                      {/* Battleground Analysis parsing and cards */}
                      {candidate.detaildescription && candidate.detaildescription.includes('Battleground Analysis') && (() => {
                        const desc = candidate.detaildescription;
                        const highlight = 'Battleground Analysis';
                        const highlightIdx = desc.indexOf(highlight);
                        let analysisBlock = '';
                        if (highlightIdx !== -1) {
                          analysisBlock = desc.slice(highlightIdx);
                        }
                        // Split by 'अनुकूलता' and 'प्रतिकूलता'
                        const favorableIdx = analysisBlock.indexOf('अनुकूलता');
                        const unfavorableIdx = analysisBlock.indexOf('प्रतिकूलता');
                        let beforeFavorable = '';
                        let favorableBlock = '';
                        let unfavorableBlock = '';
                        let afterUnfavorable = '';
                        if (favorableIdx !== -1) {
                          beforeFavorable = analysisBlock.slice(0, favorableIdx).trim();
                          if (unfavorableIdx !== -1) {
                            favorableBlock = analysisBlock.slice(favorableIdx + 'अनुकूलता'.length, unfavorableIdx).trim();
                            unfavorableBlock = analysisBlock.slice(unfavorableIdx + 'प्रतिकूलता'.length).trim();
                          } else {
                            favorableBlock = analysisBlock.slice(favorableIdx + 'अनुकूलता'.length).trim();
                          }
                        } else {
                          beforeFavorable = analysisBlock.trim();
                        }
                        // Extract points
                        const favorablePoints = favorableBlock ? favorableBlock.split(/\s{10,}|\r\n{2,}|\n{2,}/).map(p => p.trim()).filter(Boolean) : [];
                        const unfavorablePoints = unfavorableBlock ? unfavorableBlock.split(/\s{10,}|\r\n{2,}|\n{2,}/).map(p => p.trim()).filter(Boolean) : [];
                        // After 3 points, rest go to afterUnfavorable
                        afterUnfavorable = unfavorablePoints.length > 3 ? unfavorablePoints.slice(3).join('\n\n') : '';
                        return (
                          <>
                            <div className="text-lg font-extrabold text-red-600 mb-4">Battleground Analysis</div>
                            {/* Main card for content before अनुकूलता */}
                            {beforeFavorable && (
                              <div className="text-base font-semibold text-gray-800 whitespace-pre-line mb-6">{beforeFavorable}</div>
                            )}
                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                              {/* अनुकूलता card */}
                              {favorablePoints.length > 0 && (
                                <div className="flex-1 bg-green-50 border-0 rounded-2xl p-6 shadow-sm flex flex-col">
                                  <div className="flex items-center mb-4">
                                    <span className="text-2xl font-bold text-green-900 mr-2">अनुकूलता</span>
                                    <span className="ml-auto bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center">
                                      <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7.5 13.5l-3-3 1.41-1.41L7.5 10.67l6.09-6.09L15 6l-7.5 7.5z" fill="currentColor"/></svg>
                                    </span>
                                  </div>
                                  <ul className="space-y-3">
                                    {favorablePoints.map((point, idx) => (
                                      <li key={idx} className="flex items-center text-gray-800 font-semibold text-base">
                                        <span className="mr-2 text-gray-400">
                                          <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" stroke="#BDBDBD" strokeWidth="2"/><path d="M7 9l2 2 4-4" stroke="#BDBDBD" strokeWidth="2" fill="none"/></svg>
                                        </span>
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {/* प्रतिकूलता card (first 3 points) */}
                              {unfavorablePoints.length > 0 && (
                                <div className="flex-1 bg-red-50 border-0 rounded-2xl p-6 shadow-sm flex flex-col">
                                  <div className="flex items-center mb-4">
                                    <span className="text-2xl font-bold text-red-900 mr-2">प्रतिकूलता</span>
                                    <span className="ml-auto bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center">
                                      <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6.5 6.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="2"/></svg>
                                    </span>
                                  </div>
                                  <ul className="space-y-3">
                                    {unfavorablePoints.slice(0, 3).map((point, idx) => (
                                      <li key={idx} className="flex items-center text-gray-800 font-semibold text-base">
                                        <span className="mr-2 text-gray-400">
                                          <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" stroke="#BDBDBD" strokeWidth="2"/><path d="M7 9l2 2 4-4" stroke="#BDBDBD" strokeWidth="2" fill="none"/></svg>
                                        </span>
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            {/* Main card for rest of प्रतिकूलता points */}
                            {afterUnfavorable && (
                              <div className="text-base font-semibold text-gray-800 whitespace-pre-line mt-6">{afterUnfavorable}</div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
                  {/* Political History Card */}
                  {candidate.politicalhistory && (
                    <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-extrabold text-blue-600 tracking-wide border-b-2 border-blue-100 pb-1 mb-2">Political History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none text-gray-900 text-base font-semibold leading-relaxed whitespace-pre-line">
                          {candidate.politicalhistory}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Political Behaviour Card */}
                  {candidate.politicalBehaviour && (
                    <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-extrabold text-green-600 tracking-wide border-b-2 border-green-100 pb-1 mb-2">Political Behaviour</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none text-gray-900 text-base font-semibold leading-relaxed whitespace-pre-line">
                          {candidate.politicalBehaviour}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Political Timeline Card */}
                  {candidate.politicaltimeline && (
                    <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-extrabold text-red-600 tracking-wide border-b-2 border-red-100 pb-1 mb-2">Political Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          let timelineData = candidate.politicaltimeline;
                          // Reduce excessive multiline gaps to single line gap
                          if (typeof timelineData === 'string') {
                            timelineData = timelineData.replace(/(\r\n|\n|\r){2,}/g, '\n');
                          }
                          // Try to parse as JSON array
                          try {
                            if (typeof timelineData === 'string' && timelineData.trim().startsWith('[')) {
                              timelineData = JSON.parse(timelineData);
                            }
                          } catch {}
                          // If array of objects, render as timeline with two points side by side
                          if (Array.isArray(timelineData) && timelineData.length > 0 && typeof timelineData[0] === 'object') {
                            // Group timelineData into pairs
                            const pairs = [];
                            for (let i = 0; i < timelineData.length; i += 2) {
                              pairs.push([timelineData[i], timelineData[i + 1]]);
                            }
                            return (
                              <div className="relative">
                                <div className="absolute left-2 top-0 bottom-0 w-1 bg-red-200 rounded-full" style={{marginLeft: '0.5rem'}}></div>
                                <div className="space-y-6 pl-10">
                                  {pairs.map((pair, idx) => (
                                    <div key={idx} className="flex gap-6">
                                      {pair.map((item, jdx) => item && (
                                        <div key={jdx} className="relative flex-1 flex items-start gap-4 bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
                                          <div className="absolute left-0 top-6 w-4 h-4 flex items-center justify-center">
                                            <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="inline-block px-3 py-1 rounded-md bg-red-500 text-white font-bold text-sm mb-2" style={{width: 'fit-content'}}>{item.year || item.tag || Object.keys(item)[0]}</span>
                                            <div className="font-bold text-lg text-gray-900 mb-1">{item.title || item[Object.keys(item)[1]]}</div>
                                            <div className="text-base font-semibold text-gray-700 leading-relaxed whitespace-pre-line">{(item.content || item[Object.keys(item)[2]] || '').replace(/(\r\n|\n|\r){2,}/g, '\n')}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          // Fallback: show as text
                          return (
                            <div className="prose max-w-none text-gray-900 text-base font-semibold leading-relaxed whitespace-pre-line">
                              {typeof timelineData === 'string' ? (timelineData.replace(/(\r\n|\n|\r){2,}/g, '\n')) : JSON.stringify(timelineData)}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                       {/* PoliticalHIstory Card */}
                  {candidate.politicalHIstory && (
                    <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-extrabold text-blue-600 tracking-wide border-b-2 border-blue-100 pb-1 mb-2">PoliticalHIstory</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none text-gray-900 text-base font-semibold leading-relaxed whitespace-pre-line">
                          {candidate.politicalHIstory}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
            
            )}
            
            
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <>
                <SectionCard title="Basic Personal Information" titleNp="१. आधारभूत व्यक्तिगत विवरण" icon={User}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* ...existing code... */}
                    {(!searchTerm || (candidate.personalInfo?.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={User} label="उपनाम / Nickname" value={candidate.personalInfo?.nickname} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.dateOfBirth || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={Calendar} label="जन्म मिति / Date of Birth" value={formatDateOfBirth(candidate.personalInfo?.dateOfBirth || (candidate as any)['DOB'])} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.age ? `${candidate.personalInfo.age}` : ((candidate as any)['AGE_YR'] ? `${(candidate as any)['AGE_YR']}` : `${getAge()}`)).toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={User} label="उमेर / Age" value={candidate.personalInfo?.age ? `${candidate.personalInfo.age} वर्ष` : ((candidate as any)['AGE_YR'] ? `${(candidate as any)['AGE_YR']} वर्ष` : `${getAge()} वर्ष`)} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.gender || (candidate as any)['Gender'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={User} label="लिङ्ग / Gender" value={candidate.personalInfo?.gender || (candidate as any)['Gender']} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.maritalStatus || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={Heart} label="वैवाहिक स्थिति / Marital Status" value={candidate.personalInfo?.maritalStatus} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.permanentAddress || (candidate as any)['ADDRESS'] || (candidate as any)['Address'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={Home} label="स्थायी ठेगाना / Permanent Address" value={candidate.personalInfo?.permanentAddress || (candidate as any)['ADDRESS'] || (candidate as any)['Address']} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.currentAddress || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={MapPin} label="हालको ठेगाना / Current Address" value={candidate.personalInfo?.currentAddress} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.citizenshipNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={FileText} label="नागरिकता नम्बर / Citizenship No." value={candidate.personalInfo?.citizenshipNumber} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.citizenshipIssuedDistrict || (candidate as any)['CTZDIST'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={MapPin} label="नागरिकता जारी जिल्ला / Citizenship District" value={candidate.personalInfo?.citizenshipIssuedDistrict || (candidate as any)['CTZDIST']} />
                    )}
                    {(!searchTerm || ((candidate as any)['FATHER_NAME'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={User} label="पिता / Father's Name" value={(candidate as any)['FATHER_NAME']} />
                    )}
                    {(!searchTerm || ((candidate as any)['SPOUCE_NAME'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={User} label="पति/पत्नी / Spouse Name" value={(candidate as any)['SPOUCE_NAME']} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.email || (candidate as any)['Email'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={Mail} label="इमेल / Email" value={candidate.personalInfo?.email || (candidate as any)['Email']} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.website || ((candidate.socialMedia as any)?.website) || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={Globe} label="वेबसाइट / Website" value={candidate.personalInfo?.website || ((candidate.socialMedia as any)?.website)} />
                    )}
                    {(!searchTerm || (candidate.personalInfo?.contactNumber || (candidate as any)['ContactNumber'] || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <InfoItem icon={Phone} label="सम्पर्क नम्बर / Contact Number" value={candidate.personalInfo?.contactNumber || (candidate as any)['ContactNumber']} />
                    )}
                  </div>
                </SectionCard>

                {/* Raw Personal Data */}
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.personal && Object.keys(categorized.personal).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Additional Personal Details / अतिरिक्त व्यक्तिगत विवरण
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.personal).filter(([key, value]) => !searchTerm || (formatFieldName(key).toLowerCase().includes(searchTerm.toLowerCase()) || formatRawValue(value).toLowerCase().includes(searchTerm.toLowerCase()))).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-blue-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Political Info Tab */}
            {activeTab === 'political' && (
              <>
                {/* Prominent Election Symbol Display */}
                <ElectionSymbolCard 
                  symbolImage={candidate.politicalInfo?.electionSymbolImage}
                  symbolText={candidate.politicalInfo?.electionSymbol}
                  symbolTextNp={candidate.politicalInfo?.electionSymbol_np}
                />

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

                {/* Raw Political Data */}
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.political && Object.keys(categorized.political).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Additional Political Details / अतिरिक्त राजनीतिक विवरण
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.political).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-purple-200 bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-purple-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <>
                <SectionCard title="Educational Qualification" titleNp="३. शैक्षिक योग्यता" icon={GraduationCap}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <InfoItem icon={GraduationCap} label="उच्चतम शैक्षिक योग्यता / Highest Qualification" value={normalizeEducationQualification(candidate.education?.highestQualification)} valueNp={normalizeEducationQualification(candidate.education?.highestQualification_np)} />
                    <InfoItem icon={BookOpen} label="विषय / संकाय / Subject" value={candidate.education?.subject} valueNp={candidate.education?.subject_np} />
                    <InfoItem icon={Building2} label="अध्ययन गरेको संस्था / Institution" value={candidate.education?.institution} valueNp={candidate.education?.institution_np} />
                    <InfoItem icon={Globe} label="देश / Country" value={candidate.education?.country} valueNp={candidate.education?.country_np} />
                  </div>
                  <TextBlock label="अतिरिक्त तालिम / प्रमाणपत्र / अनुसन्धान" value={candidate.education?.additionalTraining} valueNp={candidate.education?.additionalTraining_np} />
                </SectionCard>

                {/* Raw Education Data */}
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.education && Object.keys(categorized.education).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Additional Education Details / अतिरिक्त शैक्षिक विवरण
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.education).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-indigo-200 bg-gradient-to-br from-white to-indigo-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-indigo-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <>
                <SectionCard title="Professional Experience" titleNp="४. पेशागत अनुभव" icon={Briefcase}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InfoItem icon={Briefcase} label="हालको पेशा / Current Profession" value={candidate.professionalExperience?.currentProfession} valueNp={candidate.professionalExperience?.currentProfession_np} />
                  </div>
                  <TextBlock label="विगतको पेशागत अनुभव / Previous Experience" value={candidate.professionalExperience?.previousExperience} valueNp={candidate.professionalExperience?.previousExperience_np} />
                  <TextBlock label="संस्थामा जिम्मेवारी / Organization Responsibility" value={candidate.professionalExperience?.organizationResponsibility} valueNp={candidate.professionalExperience?.organizationResponsibility_np} />
                  <TextBlock label="नेतृत्व वा व्यवस्थापन अनुभव / Leadership Experience" value={candidate.professionalExperience?.leadershipExperience} valueNp={candidate.professionalExperience?.leadershipExperience_np} />
                </SectionCard>

                {/* Raw Professional Data */}
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.professional && Object.keys(categorized.professional).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Additional Professional Details / अतिरिक्त पेशागत विवरण
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.professional).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-green-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <>
                <SectionCard title="Social & Community Engagement" titleNp="६. सामाजिक तथा सामुदायिक संलग्नता" icon={Heart}>
                  <TextBlock label="सामाजिक सेवा / NGO संलग्नता" value={candidate.socialEngagement?.ngoInvolvement} valueNp={candidate.socialEngagement?.ngoInvolvement_np} />
                  <TextBlock label="शिक्षा, स्वास्थ्य, युवा, महिला, कृषि क्षेत्रमा काम" value={candidate.socialEngagement?.sectorWork} valueNp={candidate.socialEngagement?.sectorWork_np} />
                  <TextBlock label="प्राप्त सम्मान वा पुरस्कार / Awards & Honors" value={candidate.socialEngagement?.awardsHonors} valueNp={candidate.socialEngagement?.awardsHonors_np} />
                </SectionCard>

                {/* Social Media Links */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow mt-6">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 py-4">
                    <CardTitle className="flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="block text-base sm:text-lg font-bold">सामाजिक सञ्जाल</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-600">Social Media Profiles</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                      {/* Facebook */}
                      {candidate.socialMedia?.facebook ? (
                        <a
                          href={candidate.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#1877F2] text-white rounded-lg sm:rounded-xl hover:bg-[#166FE5] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full group-hover:bg-white/20 transition-all">
                            <Facebook className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">Facebook</span>
                        </a>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#1877F2] text-white rounded-lg sm:rounded-xl opacity-70">
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                            <Facebook className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">Facebook</span>
                        </div>
                      )}

                      {/* Twitter */}
                      {candidate.socialMedia?.twitter ? (
                        <a
                          href={candidate.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#1DA1F2] text-white rounded-lg sm:rounded-xl hover:bg-[#1A94DA] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full group-hover:bg-white/20 transition-all">
                            <Twitter className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">Twitter</span>
                        </a>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#1DA1F2] text-white rounded-lg sm:rounded-xl opacity-70">
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                            <Twitter className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">Twitter</span>
                        </div>
                      )}

                      {/* Instagram */}
                      {candidate.socialMedia?.instagram ? (
                        <a
                          href={candidate.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white rounded-lg sm:rounded-xl hover:from-[#7432A6] hover:via-[#E51A1A] hover:to-[#F5A742] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full group-hover:bg-white/20 transition-all">
                            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">Instagram</span>
                        </a>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white rounded-lg sm:rounded-xl opacity-70">
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">Instagram</span>
                        </div>
                      )}

                      {/* YouTube */}
                      {candidate.socialMedia?.youtube ? (
                        <a
                          href={candidate.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#FF0000] text-white rounded-lg sm:rounded-xl hover:bg-[#E60000] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full group-hover:bg-white/20 transition-all">
                            <Youtube className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">YouTube</span>
                        </a>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#FF0000] text-white rounded-lg sm:rounded-xl opacity-70">
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                            <Youtube className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">YouTube</span>
                        </div>
                      )}

                      {/* LinkedIn */}
                      {candidate.socialMedia?.linkedin ? (
                        <a
                          href={candidate.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#0A66C2] text-white rounded-lg sm:rounded-xl hover:bg-[#095196] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full group-hover:bg-white/20 transition-all">
                            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">LinkedIn</span>
                        </a>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-[#0A66C2] text-white rounded-lg sm:rounded-xl opacity-70">
                          <div className="bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} fill="white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">LinkedIn</span>
                        </div>
                      )}

                      {/* TikTok */}
                      {candidate.socialMedia?.tiktok ? (
                        <a
                          href={candidate.socialMedia.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-black text-white rounded-lg sm:rounded-xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <div className="bg-gradient-to-br from-[#00F2EA] to-[#FF0050] p-[2px] rounded-full group-hover:from-[#00E5DD] group-hover:to-[#E6004A] transition-all">
                            <div className="bg-black p-2 sm:p-2.5 rounded-full">
                              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">TikTok</span>
                        </a>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-black text-white rounded-lg sm:rounded-xl opacity-70">
                          <div className="bg-gradient-to-br from-[#00F2EA] to-[#FF0050] p-[2px] rounded-full">
                            <div className="bg-black p-2 sm:p-2.5 rounded-full">
                              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold">TikTok</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Share Candidate Profile */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow mt-6">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 py-4">
                    <CardTitle className="flex items-center gap-3 text-gray-800">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Share2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="block">यो उम्मेदवार साझा गर्नुहोस्</span>
                        <span className="text-sm font-normal text-gray-600">Share This Candidate</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Copy Link */}
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={window.location.href}
                          className="flex-1 bg-gray-50"
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopySuccess(true);
                            toast({
                              title: "Link Copied!",
                              description: "Candidate profile link copied to clipboard"
                            });
                            setTimeout(() => setCopySuccess(false), 2000);
                          }}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copySuccess ? 'Copied' : 'Copy'}
                        </Button>
                      </div>

                      {/* Social Share Buttons */}
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-3">Share on social media:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {/* Share on Facebook */}
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                          >
                            <Facebook className="w-5 h-5" />
                            <span className="text-sm font-medium">Facebook</span>
                          </a>

                          {/* Share on Twitter */}
                          <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${candidate?.personalInfo?.fullName} - Election Candidate Profile`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg"
                          >
                            <Twitter className="w-5 h-5" />
                            <span className="text-sm font-medium">Twitter</span>
                          </a>

                          {/* Share on LinkedIn */}
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
                          >
                            <Linkedin className="w-5 h-5" />
                            <span className="text-sm font-medium">LinkedIn</span>
                          </a>

                          {/* Share via WhatsApp */}
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out ${candidate?.personalInfo?.fullName} - Election Candidate Profile: ${window.location.href}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">WhatsApp</span>
                          </a>

                          {/* Share via Email */}
                          <a
                            href={`mailto:?subject=${encodeURIComponent(`Election Candidate: ${candidate?.personalInfo?.fullName}`)}&body=${encodeURIComponent(`Check out this candidate profile: ${window.location.href}`)}`}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
                          >
                            <Mail className="w-5 h-5" />
                            <span className="text-sm font-medium">Email</span>
                          </a>

                          {/* Share via Telegram */}
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${candidate?.personalInfo?.fullName} - Election Candidate`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-md hover:shadow-lg"
                          >
                            <Send className="w-5 h-5" />
                            <span className="text-sm font-medium">Telegram</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <>
                <SectionCard title="Financial Information" titleNp="७. आर्थिक विवरण" icon={Wallet}>
                  <TextBlock label="चल सम्पत्ति विवरण / Movable Assets" value={candidate.financialInfo?.movableAssets} valueNp={candidate.financialInfo?.movableAssets_np} />
                  <TextBlock label="अचल सम्पत्ति विवरण / Immovable Assets" value={candidate.financialInfo?.immovableAssets} valueNp={candidate.financialInfo?.immovableAssets_np} />
                  <TextBlock label="वार्षिक आय स्रोत / Annual Income Source" value={candidate.financialInfo?.annualIncomeSource} valueNp={candidate.financialInfo?.annualIncomeSource_np} />
                  <TextBlock label="बैंक ऋण वा अन्य दायित्व / Bank Loans" value={candidate.financialInfo?.bankLoans} valueNp={candidate.financialInfo?.bankLoans_np} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={FileText} label="कर तिरेको स्थिति / Tax Status" value={candidate.financialInfo?.taxStatus} valueNp={candidate.financialInfo?.taxStatus_np} />
                  </div>
                </SectionCard>

                {/* Raw Financial Data */}
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.financial && Object.keys(categorized.financial).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-600" />
                        Additional Financial Details / अतिरिक्त आर्थिक विवरण
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.financial).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-yellow-200 bg-gradient-to-br from-white to-yellow-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-yellow-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Legal Tab */}
            {activeTab === 'legal' && (
              <>
                <SectionCard title="Legal Status" titleNp="८. कानुनी अवस्था" icon={Scale}>
                  <div className="mb-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md ${candidate.legalStatus?.hasCriminalCase ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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

                {/* Raw Legal Data */}
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.legal && Object.keys(categorized.legal).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        Additional Legal Details / अतिरिक्त कानुनी विवरण
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.legal).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-red-200 bg-gradient-to-br from-white to-red-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-red-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Vision Tab */}
            {activeTab === 'vision' && (
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
            )}

            {/* Additional Information Tab */}
            {activeTab === 'additional' && (
              <>
                {candidate.rawSource && (() => {
                  const categorized = categorizeRawData(candidate.rawSource);
                  return categorized.other && Object.keys(categorized.other).length > 0 ? (
                    <SectionCard title="Additional Information" titleNp="अतिरिक्त जानकारी" icon={FileText}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categorized.other).map(([key, value]) => (
                          <div key={key} className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all duration-200">
                            <p className="text-xs font-bold text-gray-700 mb-2 break-words uppercase tracking-wide">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium leading-relaxed">
                              {formatRawValue(value) || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  ) : (
                    <SectionCard title="Additional Information" titleNp="अतिरिक्त जानकारी" icon={FileText}>
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No additional information available</p>
                        <p className="text-sm mt-2">कुनै अतिरिक्त जानकारी उपलब्ध छैन</p>
                      </div>
                    </SectionCard>
                  );
                })()}
              </>
            )}
          </div>
        </div>



        {/* Feedback Section */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <CandidateFeedbackSection candidateId={id as string} candidateName={candidate?.personalInfo?.fullName} />
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <div className="text-center">
            <Button onClick={() => navigate('/candidates')} variant="outline" className="border-primary text-primary shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              सबै उम्मेदवारहरू हेर्नुहोस् / View All Candidates
            </Button>
          </div>
        </div>
      </div>

      {/* Full Screen Photo Modal */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="max-w-full w-full h-screen p-0 border-0 bg-white flex flex-col items-center justify-center rounded-none overflow-hidden">
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setPhotoModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white/80 backdrop-blur-sm shadow-md"
              aria-label="Close photo modal"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
          </div>
          
          <div className="w-full h-full flex items-center justify-center p-4 md:p-6">
            {/* Photo */}
            {!imageLoadError && getCandidateImageUrl(candidate) ? (
              <img
                src={getCandidateImageUrl(candidate) || ''}
                alt={candidate?.personalInfo?.fullName}
                className="min-w-[50vw] max-w-[90vw] max-h-[85vh] object-contain"
              />
            ) : candidate?.personalInfo?.profilePhoto ? (
              <img
                src={candidate?.personalInfo?.profilePhoto}
                alt={candidate?.personalInfo?.fullName}
                className="min-w-[50vw] max-w-[90vw] max-h-[85vh] object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <User className="w-32 h-32 text-gray-400" />
              </div>
            )}
          </div>

          {/* Candidate Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {candidate?.personalInfo?.fullName}
            </h2>
            {candidate?.personalInfo?.fullName_np && (
              <p className="text-lg text-gray-200 mb-3">{candidate?.personalInfo?.fullName_np}</p>
            )}
            {candidate.politicalInfo?.constituency && (
              <div className="flex items-center justify-center gap-2 text-gray-200">
                <MapPin className="w-4 h-4" />
                <span>{candidate.politicalInfo.constituency}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CandidateDetailPage;
