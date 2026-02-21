import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, GraduationCap, Maximize2, Facebook, Twitter, Instagram, X, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CandidateCardProps {
  candidate: {
    _id: string;
    candidateId?: string;
    personalInfo?: {
      fullName?: string;
      fullName_np?: string;
      position?: string;
      constituency?: string;
      profilePhoto?: string;
      gender?: string;
      age?: number;
      dateOfBirth?: string;
    };
    politicalInfo?: {
      partyName?: string;
      partyName_np?: string;
      constituency?: string;
      candidacyLevel?: string;
      electionSymbol?: string;
      electionSymbol_np?: string;
      electionSymbolImage?: string;
    };
    electionInfo?: {
      district?: string;
      municipality?: string;
      constituency?: string;
    };
    rawSource?: {
      DISTRICT?: string;
      District?: string;
      AREA?: string;
      Area?: string;
      CandidateName?: string;
      DistrictName?: string;
      ConstName?: string;
      PoliticalPartyName?: string;
      AGE_YR?: number;
      Gender?: string;
      QUALIFICATION?: string;
      [key: string]: any;
    };
    education?: {
      highestQualification?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
  };
}

// Normalize education qualification text - replace old values with new ones
const normalizeEducationQualification = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/विदया वारिणी/g, 'विद्यावारिधि')
    .trim();
};

// Normalize party names - replace all variations with standard NCP name
const normalizePartyName = (partyName?: string): string => {
  if (!partyName) return 'स्वतन्त्र';
  const normalized = partyName.trim();
  // Replace any variation of NCP with the standard name
  if (normalized.includes('कम्युनिस्ट') || normalized.includes('कम्युनिसट')) {
    return 'नेपाली कम्युनिस्ट पार्टी';
  }
  return normalized;
};

const getPartyBadgeColor = (partyName?: string): string => {
  const normalizedName = normalizePartyName(partyName);
  const partyColors: { [key: string]: string } = {
    'नेपाली कांग्रेस': 'bg-green-100 text-green-800 border-green-200',
    'नेपाली कम्युनिस्ट पार्टी': 'bg-red-100 text-red-800 border-red-200',
    'राप्रपा': 'bg-blue-100 text-blue-800 border-blue-200',
    'स्वतन्त्र': 'bg-purple-100 text-purple-800 border-purple-200',
  };
  return partyColors[normalizedName || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const calculateAge = (dateOfBirth?: string, age?: number, rawSourceAge?: number): number => {
  // Priority 1: Use rawSource.AGE_YR if available
  if (rawSourceAge && rawSourceAge > 0 && rawSourceAge <= 150) return rawSourceAge;
  
  // Priority 2: If age is provided from API, use it
  if (age && age > 0 && age <= 150) return age;
  if (!dateOfBirth) return 0;
  
  // Parse date string
  const parts = String(dateOfBirth).trim().split(/[\/\-\.\s]+/).map(p => p.trim()).filter(Boolean);
  let y: number | undefined, m: number | undefined, d: number | undefined;
  
  if (parts.length === 3) {
    if (parts[0].length === 4) { // YYYY-MM-DD
      y = Number(parts[0]); m = Number(parts[1]) - 1; d = Number(parts[2]);
    } else { // DD-MM-YYYY
      y = Number(parts[2]); m = Number(parts[1]) - 1; d = Number(parts[0]);
    }
  } else {
    const birthDate = new Date(dateOfBirth);
    if (!isNaN(birthDate.getTime())) {
      y = birthDate.getFullYear();
      m = birthDate.getMonth();
      d = birthDate.getDate();
    }
  }
  
  if (y === undefined || m === undefined || d === undefined) return 0;
  
  const today = new Date();
  
  // Try AD calculation first
  let calculatedAge = today.getFullYear() - y;
  const monthDiff = today.getMonth() - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    calculatedAge--;
  }
  
  // If AD result is valid (18-150), use it
  if (calculatedAge >= 18 && calculatedAge <= 150) {
    return calculatedAge;
  }
  
  // If year looks like Nepali Bikram Sambat (BS) (e.g., 2000-2100), compute age using BS current year 2082
  if (y >= 2000 && y <= 2100) {
    const ageBs = 2082 - y;
    if (ageBs >= 18 && ageBs <= 150) return ageBs;
  }
  
  // Return calculated age or 0
  return calculatedAge > 0 && calculatedAge <= 150 ? calculatedAge : 0;
};

// Generate image URL from candidateId
const getCandidateImageUrl = (candidate: any): string | null => {
  const id = candidate.CandidateID || candidate.candidateId;
  if (id) return `https://result.election.gov.np/Images/Candidate/${id}.jpg`;
  return null;
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  // Use new flat backend fields if available, fallback to old
  const fullName = candidate.name || (candidate as any).CandidateName || candidate.personalInfo?.fullName || 'Candidate';
  const area = candidate.area || (candidate.rawSource?.AREA || candidate.rawSource?.Area || candidate.electionInfo?.constituency || candidate.politicalInfo?.constituency || '');
  const district = (candidate as any).DistrictName || (candidate as any).CTZDIST || (candidate as any).StateName || candidate.electionInfo?.district || '';
  const constituency = (candidate as any).ConstName || candidate.politicalInfo?.constituency || candidate.personalInfo?.constituency || 'Unknown';
  const partyName = (candidate as any).PoliticalPartyName || candidate.politicalInfo?.partyName || 'स्वतन्त्र';
  const age = (candidate as any).AGE_YR || candidate.personalInfo?.age || 0;
  const gender = (candidate as any).Gender || candidate.personalInfo?.gender || '';
  const education = (candidate as any).QUALIFICATION || candidate.education?.highestQualification || '';
  // Prefer profilepicture if available, else fallback to old image logic
  const displayImage = candidate.profilepicture
    ? (candidate.profilepicture.startsWith('http://') || candidate.profilepicture.startsWith('https://')
        ? candidate.profilepicture
        : `/uploads/candidates/${candidate.profilepicture}`)
    : getCandidateImageUrl(candidate) || '';
  const socialMedia = candidate.socialMedia;
  const partyBadgeColor = getPartyBadgeColor(partyName);
  const genderBadgeColor = gender === 'Male' || gender === 'पुरुष' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-pink-100 text-pink-800 border-pink-200';

  const handleImageClick = (e: React.MouseEvent) => {
    if (displayImage) {
      e.preventDefault();
      e.stopPropagation();
      setIsPhotoDialogOpen(true);
    }
  };

  const handleSocialClick = (e: React.MouseEvent, url?: string) => {
    if (url) {
      e.preventDefault();
      e.stopPropagation();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Link to={`/candidate/${candidate._id}`} className="block h-full">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 bg-white group h-full flex flex-col relative">
          <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-primary/90 hover:bg-primary text-white shadow-lg transition-all duration-300 group-hover:scale-110">
            <Eye className="w-5 h-5" />
          </div>
          <div className="flex flex-col h-full p-5">
            <div className="flex justify-center mb-4">
              {displayImage ? (
                <div className="relative group/image">
                  <img
                    src={displayImage}
                    alt={fullName}
                    className="w-40 h-40 rounded-lg object-cover border-2 border-gray-200 group-hover:border-primary/50 transition-all cursor-pointer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onClick={handleImageClick}
                  />
                  <div 
                    className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Maximize2 className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-gray-200 group-hover:border-primary/50 transition-all">
                  <span className="text-6xl font-bold text-primary">{fullName.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2 text-center line-clamp-2 group-hover:text-primary transition-colors">
              {fullName}
            </h3>
            {area && (
              <div className="mb-2 text-center text-base xs:text-lg sm:text-xl text-blue-700 font-bold truncate">
                {area}
              </div>
            )}
            <div className="mb-2 flex flex-wrap justify-center gap-2">
              <Badge className={genderBadgeColor}>{gender}</Badge>
              {age > 0 && <Badge>{age} वर्ष</Badge>}
            </div>
            {/* Removed district and constituency display as per user request */}
            {/* Only 6 major key data shown above: Name, Party, Age, Gender, District, Constituency */}
            {/* All other details are intentionally omitted from the card for brevity as per user request */}
          </div>
        </Card>
      </Link>
      {/* Photo Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-lg">
          <img src={displayImage || ''} alt={fullName} className="w-full h-auto rounded-lg" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CandidateCard;
