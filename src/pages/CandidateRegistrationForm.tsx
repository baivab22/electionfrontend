import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  GraduationCap,
  Briefcase,
  Flag,
  Heart,
  Wallet,
  Scale,
  Target,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  FileText,
  Users,
  Award,
  Calendar
} from 'lucide-react';

interface FormData {
  // Personal Info
  personalInfo: {
    fullName: string;
    fullName_np: string;
    nickname: string;
    nickname_np: string;
    dateOfBirth: string;
    gender: string;
    gender_np: string;
    maritalStatus: string;
    maritalStatus_np: string;
    permanentAddress: string;
    permanentAddress_np: string;
    currentAddress: string;
    currentAddress_np: string;
    citizenshipNumber: string;
    citizenshipIssuedDistrict: string;
    citizenshipIssuedDistrict_np: string;
    contactNumber: string;
    email: string;
    website: string;
  };
  // Political Info
  politicalInfo: {
    partyName: string;
    partyName_np: string;
    currentPosition: string;
    currentPosition_np: string;
    candidacyLevel: string;
    candidacyLevel_np: string;
    constituencyNumber: string;
    constituency: string;
    constituency_np: string;
    electionSymbol: string;
    electionSymbol_np: string;
    isFirstTimeCandidate: boolean;
    previousElectionHistory: string;
    previousElectionHistory_np: string;
  };
  // Education
  education: {
    highestQualification: string;
    highestQualification_np: string;
    subject: string;
    subject_np: string;
    institution: string;
    institution_np: string;
    country: string;
    country_np: string;
    additionalTraining: string;
    additionalTraining_np: string;
  };
  // Professional Experience
  professionalExperience: {
    currentProfession: string;
    currentProfession_np: string;
    previousExperience: string;
    previousExperience_np: string;
    organizationResponsibility: string;
    organizationResponsibility_np: string;
    leadershipExperience: string;
    leadershipExperience_np: string;
  };
  // Political Experience
  politicalExperience: {
    partyJoinYear: string;
    movementRole: string;
    movementRole_np: string;
    previousRepresentativePosition: string;
    previousRepresentativePosition_np: string;
    majorAchievements: string;
    majorAchievements_np: string;
  };
  // Social Engagement
  socialEngagement: {
    ngoInvolvement: string;
    ngoInvolvement_np: string;
    sectorWork: string;
    sectorWork_np: string;
    awardsHonors: string;
    awardsHonors_np: string;
  };
  // Financial Info
  financialInfo: {
    movableAssets: string;
    movableAssets_np: string;
    immovableAssets: string;
    immovableAssets_np: string;
    annualIncomeSource: string;
    annualIncomeSource_np: string;
    bankLoans: string;
    bankLoans_np: string;
    taxStatus: string;
    taxStatus_np: string;
  };
  // Legal Status
  legalStatus: {
    hasCriminalCase: boolean;
    caseDetails: string;
    caseDetails_np: string;
    eligibilityDeclaration: string;
    eligibilityDeclaration_np: string;
  };
  // Vision & Goals
  visionGoals: {
    vision: string;
    vision_np: string;
    goals: string;
    goals_np: string;
    declaration: string;
    declaration_np: string;
  };
  // Social Media
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

const initialFormData: FormData = {
  personalInfo: {
    fullName: '', fullName_np: '', nickname: '', nickname_np: '',
    dateOfBirth: '', gender: '', gender_np: '', maritalStatus: '', maritalStatus_np: '',
    permanentAddress: '', permanentAddress_np: '', currentAddress: '', currentAddress_np: '',
    citizenshipNumber: '', citizenshipIssuedDistrict: '', citizenshipIssuedDistrict_np: '',
    contactNumber: '', email: '', website: ''
  },
  politicalInfo: {
    partyName: '', partyName_np: '', currentPosition: '', currentPosition_np: '',
    candidacyLevel: '', candidacyLevel_np: '', constituencyNumber: '',
    constituency: '', constituency_np: '', electionSymbol: '', electionSymbol_np: '',
    isFirstTimeCandidate: false, previousElectionHistory: '', previousElectionHistory_np: ''
  },
  education: {
    highestQualification: '', highestQualification_np: '', subject: '', subject_np: '',
    institution: '', institution_np: '', country: '', country_np: '',
    additionalTraining: '', additionalTraining_np: ''
  },
  professionalExperience: {
    currentProfession: '', currentProfession_np: '', previousExperience: '', previousExperience_np: '',
    organizationResponsibility: '', organizationResponsibility_np: '',
    leadershipExperience: '', leadershipExperience_np: ''
  },
  politicalExperience: {
    partyJoinYear: '', movementRole: '', movementRole_np: '',
    previousRepresentativePosition: '', previousRepresentativePosition_np: '',
    majorAchievements: '', majorAchievements_np: ''
  },
  socialEngagement: {
    ngoInvolvement: '', ngoInvolvement_np: '', sectorWork: '', sectorWork_np: '',
    awardsHonors: '', awardsHonors_np: ''
  },
  financialInfo: {
    movableAssets: '', movableAssets_np: '', immovableAssets: '', immovableAssets_np: '',
    annualIncomeSource: '', annualIncomeSource_np: '', bankLoans: '', bankLoans_np: '',
    taxStatus: '', taxStatus_np: ''
  },
  legalStatus: {
    hasCriminalCase: false, caseDetails: '', caseDetails_np: '',
    eligibilityDeclaration: '', eligibilityDeclaration_np: ''
  },
  visionGoals: {
    vision: '', vision_np: '', goals: '', goals_np: '', declaration: '', declaration_np: ''
  },
  socialMedia: { facebook: '', twitter: '', instagram: '', youtube: '' }
};

const steps = [
  { id: 1, title: 'व्यक्तिगत विवरण', titleEn: 'Personal Info', icon: User },
  { id: 2, title: 'राजनीतिक परिचय', titleEn: 'Political Info', icon: Flag },
  { id: 3, title: 'शैक्षिक योग्यता', titleEn: 'Education', icon: GraduationCap },
  { id: 4, title: 'पेशागत अनुभव', titleEn: 'Professional', icon: Briefcase },
  { id: 5, title: 'राजनीतिक अनुभव', titleEn: 'Political Exp', icon: Building2 },
  { id: 6, title: 'सामाजिक संलग्नता', titleEn: 'Social Work', icon: Heart },
  { id: 7, title: 'आर्थिक विवरण', titleEn: 'Financial', icon: Wallet },
  { id: 8, title: 'कानुनी अवस्था', titleEn: 'Legal Status', icon: Scale },
  { id: 9, title: 'दृष्टि र लक्ष्य', titleEn: 'Vision & Goals', icon: Target },
];

const CandidateRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handleInputChange = (section: keyof FormData, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value
      }
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([section, data]) => {
        Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
          submitData.append(`${section}[${key}]`, String(value));
        });
      });

      // Append profile photo if exists
      if (profilePhoto) {
        submitData.append('profilePhoto', profilePhoto);
      }

      // Use public registration endpoint (no auth required)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/candidates/register`, {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "सफलतापूर्वक दर्ता भयो!",
          description: "उम्मेदवार विवरण सफलतापूर्वक सुरक्षित गरियो। प्रशासकबाट अनुमोदन पछि प्रकाशित हुनेछ।"
        });
        navigate('/candidates');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "त्रुटि",
        description: error.message || "फारम पेश गर्न असफल भयो।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">१. आधारभूत व्यक्तिगत विवरण</h2>
              <p className="text-gray-600">Basic Personal Information</p>
            </div>

            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden bg-gray-100">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <FileText className="w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">पूरा नाम (Full Name) *</Label>
                <Input
                  placeholder="Enter full name in English"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">पूरा नाम (नेपालीमा)</Label>
                <Input
                  placeholder="पूरा नाम नेपालीमा लेख्नुहोस्"
                  value={formData.personalInfo.fullName_np}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">उपनाम / लोकप्रिय नाम</Label>
                <Input
                  placeholder="Nickname / Popular name"
                  value={formData.personalInfo.nickname}
                  onChange={(e) => handleInputChange('personalInfo', 'nickname', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">उपनाम (नेपालीमा)</Label>
                <Input
                  placeholder="उपनाम नेपालीमा"
                  value={formData.personalInfo.nickname_np}
                  onChange={(e) => handleInputChange('personalInfo', 'nickname_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">जन्म मिति (Date of Birth) *</Label>
                <Input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">लिङ्ग (Gender) *</Label>
                <Select
                  value={formData.personalInfo.gender}
                  onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="लिङ्ग छान्नुहोस्" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">पुरुष (Male)</SelectItem>
                    <SelectItem value="Female">महिला (Female)</SelectItem>
                    <SelectItem value="Other">अन्य (Other)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">वैवाहिक स्थिति</Label>
                <Select
                  value={formData.personalInfo.maritalStatus}
                  onValueChange={(value) => handleInputChange('personalInfo', 'maritalStatus', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="वैवाहिक स्थिति छान्नुहोस्" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">अविवाहित (Single)</SelectItem>
                    <SelectItem value="Married">विवाहित (Married)</SelectItem>
                    <SelectItem value="Divorced">सम्बन्धविच्छेद (Divorced)</SelectItem>
                    <SelectItem value="Widowed">विधवा/विधुर (Widowed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Citizenship */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">नागरिकता नम्बर</Label>
                <Input
                  placeholder="Citizenship Number"
                  value={formData.personalInfo.citizenshipNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'citizenshipNumber', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">नागरिकता जारी जिल्ला</Label>
                <Input
                  placeholder="Citizenship Issued District"
                  value={formData.personalInfo.citizenshipIssuedDistrict}
                  onChange={(e) => handleInputChange('personalInfo', 'citizenshipIssuedDistrict', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Permanent Address */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">स्थायी ठेगाना</Label>
                <Input
                  placeholder="Permanent Address"
                  value={formData.personalInfo.permanentAddress}
                  onChange={(e) => handleInputChange('personalInfo', 'permanentAddress', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Current Address */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">हालको ठेगाना</Label>
                <Input
                  placeholder="Current Address"
                  value={formData.personalInfo.currentAddress}
                  onChange={(e) => handleInputChange('personalInfo', 'currentAddress', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">सम्पर्क नम्बर *</Label>
                <Input
                  placeholder="+977-XXXXXXXXXX"
                  value={formData.personalInfo.contactNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'contactNumber', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">इमेल ठेगाना *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Website */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">आधिकारिक वेबसाइट / सामाजिक सञ्जाल लिंक</Label>
                <Input
                  placeholder="https://www.example.com"
                  value={formData.personalInfo.website}
                  onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">२. राजनीतिक परिचय</h2>
              <p className="text-gray-600">Political Introduction</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Party Name */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">पार्टीको नाम</Label>
                <Input
                  placeholder="Party Name"
                  value={formData.politicalInfo.partyName}
                  onChange={(e) => handleInputChange('politicalInfo', 'partyName', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">पार्टीको नाम (नेपालीमा)</Label>
                <Input
                  placeholder="पार्टीको नाम नेपालीमा"
                  value={formData.politicalInfo.partyName_np}
                  onChange={(e) => handleInputChange('politicalInfo', 'partyName_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Current Position */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">वर्तमान पद / जिम्मेवारी</Label>
                <Input
                  placeholder="Current Position/Responsibility"
                  value={formData.politicalInfo.currentPosition}
                  onChange={(e) => handleInputChange('politicalInfo', 'currentPosition', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">वर्तमान पद (नेपालीमा)</Label>
                <Input
                  placeholder="वर्तमान पद नेपालीमा"
                  value={formData.politicalInfo.currentPosition_np}
                  onChange={(e) => handleInputChange('politicalInfo', 'currentPosition_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Candidacy Level */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">उम्मेदवारी तह</Label>
                <Select
                  value={formData.politicalInfo.candidacyLevel}
                  onValueChange={(value) => handleInputChange('politicalInfo', 'candidacyLevel', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="तह छान्नुहोस्" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Federal">संघ (Federal)</SelectItem>
                    <SelectItem value="Provincial">प्रदेश (Provincial)</SelectItem>
                    <SelectItem value="Local">स्थानीय (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Constituency */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">निर्वाचन क्षेत्र नम्बर</Label>
                <Input
                  placeholder="Constituency Number"
                  value={formData.politicalInfo.constituencyNumber}
                  onChange={(e) => handleInputChange('politicalInfo', 'constituencyNumber', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">निर्वाचन क्षेत्र</Label>
                <Input
                  placeholder="Constituency Name"
                  value={formData.politicalInfo.constituency}
                  onChange={(e) => handleInputChange('politicalInfo', 'constituency', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">निर्वाचन क्षेत्र (नेपालीमा)</Label>
                <Input
                  placeholder="निर्वाचन क्षेत्र नेपालीमा"
                  value={formData.politicalInfo.constituency_np}
                  onChange={(e) => handleInputChange('politicalInfo', 'constituency_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Election Symbol */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">निर्वाचन चिन्ह</Label>
                <Input
                  placeholder="Election Symbol"
                  value={formData.politicalInfo.electionSymbol}
                  onChange={(e) => handleInputChange('politicalInfo', 'electionSymbol', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* First Time Candidate */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="firstTime"
                    checked={formData.politicalInfo.isFirstTimeCandidate}
                    onCheckedChange={(checked) => handleInputChange('politicalInfo', 'isFirstTimeCandidate', !!checked)}
                  />
                  <Label htmlFor="firstTime" className="text-gray-700 font-medium cursor-pointer">
                    पहिलो पटक उम्मेदवार (First Time Candidate)
                  </Label>
                </div>
              </div>

              {/* Previous Election History */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">विगतको निर्वाचन इतिहास (जित/हार/मतसंख्या)</Label>
                <Textarea
                  placeholder="Previous election history (win/loss/vote count)"
                  value={formData.politicalInfo.previousElectionHistory}
                  onChange={(e) => handleInputChange('politicalInfo', 'previousElectionHistory', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">३. शैक्षिक योग्यता</h2>
              <p className="text-gray-600">Educational Qualification</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Highest Qualification */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">उच्चतम शैक्षिक योग्यता</Label>
                <Input
                  placeholder="Highest Educational Qualification"
                  value={formData.education.highestQualification}
                  onChange={(e) => handleInputChange('education', 'highestQualification', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">उच्चतम योग्यता (नेपालीमा)</Label>
                <Input
                  placeholder="उच्चतम शैक्षिक योग्यता नेपालीमा"
                  value={formData.education.highestQualification_np}
                  onChange={(e) => handleInputChange('education', 'highestQualification_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">विषय / संकाय</Label>
                <Input
                  placeholder="Subject / Faculty"
                  value={formData.education.subject}
                  onChange={(e) => handleInputChange('education', 'subject', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">विषय (नेपालीमा)</Label>
                <Input
                  placeholder="विषय नेपालीमा"
                  value={formData.education.subject_np}
                  onChange={(e) => handleInputChange('education', 'subject_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">अध्ययन गरेको संस्था</Label>
                <Input
                  placeholder="Educational Institution"
                  value={formData.education.institution}
                  onChange={(e) => handleInputChange('education', 'institution', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">संस्था (नेपालीमा)</Label>
                <Input
                  placeholder="संस्था नेपालीमा"
                  value={formData.education.institution_np}
                  onChange={(e) => handleInputChange('education', 'institution_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">देश</Label>
                <Input
                  placeholder="Country"
                  value={formData.education.country}
                  onChange={(e) => handleInputChange('education', 'country', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">देश (नेपालीमा)</Label>
                <Input
                  placeholder="देश नेपालीमा"
                  value={formData.education.country_np}
                  onChange={(e) => handleInputChange('education', 'country_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Additional Training */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">अतिरिक्त तालिम / प्रमाणपत्र / अनुसन्धान</Label>
                <Textarea
                  placeholder="Additional training, certificates, research work"
                  value={formData.education.additionalTraining}
                  onChange={(e) => handleInputChange('education', 'additionalTraining', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">४. पेशागत अनुभव</h2>
              <p className="text-gray-600">Professional Experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Profession */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">हालको पेशा</Label>
                <Input
                  placeholder="Current Profession"
                  value={formData.professionalExperience.currentProfession}
                  onChange={(e) => handleInputChange('professionalExperience', 'currentProfession', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">हालको पेशा (नेपालीमा)</Label>
                <Input
                  placeholder="हालको पेशा नेपालीमा"
                  value={formData.professionalExperience.currentProfession_np}
                  onChange={(e) => handleInputChange('professionalExperience', 'currentProfession_np', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Previous Experience */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">विगतको पेशागत अनुभव</Label>
                <Textarea
                  placeholder="Previous professional experience"
                  value={formData.professionalExperience.previousExperience}
                  onChange={(e) => handleInputChange('professionalExperience', 'previousExperience', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Organization Responsibility */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">सरकारी / निजी / सामाजिक संस्थामा जिम्मेवारी</Label>
                <Textarea
                  placeholder="Responsibilities in Government/Private/Social organizations"
                  value={formData.professionalExperience.organizationResponsibility}
                  onChange={(e) => handleInputChange('professionalExperience', 'organizationResponsibility', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Leadership Experience */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">नेतृत्व वा व्यवस्थापन अनुभव</Label>
                <Textarea
                  placeholder="Leadership or management experience"
                  value={formData.professionalExperience.leadershipExperience}
                  onChange={(e) => handleInputChange('professionalExperience', 'leadershipExperience', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">५. राजनीतिक अनुभव र योगदान</h2>
              <p className="text-gray-600">Political Experience & Contribution</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Party Join Year */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">पार्टीमा आबद्ध भएको वर्ष</Label>
                <Input
                  placeholder="Year joined party"
                  value={formData.politicalExperience.partyJoinYear}
                  onChange={(e) => handleInputChange('politicalExperience', 'partyJoinYear', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Movement Role */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">आन्दोलन / अभियानमा भूमिका</Label>
                <Textarea
                  placeholder="Role in movements and campaigns"
                  value={formData.politicalExperience.movementRole}
                  onChange={(e) => handleInputChange('politicalExperience', 'movementRole', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Previous Representative Position */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">जनप्रतिनिधि भइसकेको भए पद र कार्यकाल</Label>
                <Textarea
                  placeholder="Previous representative position and tenure"
                  value={formData.politicalExperience.previousRepresentativePosition}
                  onChange={(e) => handleInputChange('politicalExperience', 'previousRepresentativePosition', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Major Achievements */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">मुख्य उपलब्धिहरू</Label>
                <Textarea
                  placeholder="Major achievements"
                  value={formData.politicalExperience.majorAchievements}
                  onChange={(e) => handleInputChange('politicalExperience', 'majorAchievements', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">६. सामाजिक तथा सामुदायिक संलग्नता</h2>
              <p className="text-gray-600">Social & Community Engagement</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* NGO Involvement */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">सामाजिक सेवा / NGO संलग्नता</Label>
                <Textarea
                  placeholder="Social service / NGO involvement"
                  value={formData.socialEngagement.ngoInvolvement}
                  onChange={(e) => handleInputChange('socialEngagement', 'ngoInvolvement', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Sector Work */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">शिक्षा, स्वास्थ्य, युवा, महिला, कृषि आदि क्षेत्रमा काम</Label>
                <Textarea
                  placeholder="Work in education, health, youth, women, agriculture sectors"
                  value={formData.socialEngagement.sectorWork}
                  onChange={(e) => handleInputChange('socialEngagement', 'sectorWork', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Awards & Honors */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">प्राप्त सम्मान वा पुरस्कार</Label>
                <Textarea
                  placeholder="Awards and honors received"
                  value={formData.socialEngagement.awardsHonors}
                  onChange={(e) => handleInputChange('socialEngagement', 'awardsHonors', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">७. आर्थिक विवरण</h2>
              <p className="text-gray-600">Financial Information</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Movable Assets */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">चल सम्पत्ति विवरण</Label>
                <Textarea
                  placeholder="Movable assets details (vehicles, bank balance, etc.)"
                  value={formData.financialInfo.movableAssets}
                  onChange={(e) => handleInputChange('financialInfo', 'movableAssets', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Immovable Assets */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">अचल सम्पत्ति विवरण</Label>
                <Textarea
                  placeholder="Immovable assets details (land, house, etc.)"
                  value={formData.financialInfo.immovableAssets}
                  onChange={(e) => handleInputChange('financialInfo', 'immovableAssets', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              {/* Annual Income Source */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">वार्षिक आय स्रोत</Label>
                <Textarea
                  placeholder="Annual income sources"
                  value={formData.financialInfo.annualIncomeSource}
                  onChange={(e) => handleInputChange('financialInfo', 'annualIncomeSource', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[80px]"
                />
              </div>

              {/* Bank Loans */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">बैंक ऋण वा अन्य दायित्व</Label>
                <Textarea
                  placeholder="Bank loans or other liabilities"
                  value={formData.financialInfo.bankLoans}
                  onChange={(e) => handleInputChange('financialInfo', 'bankLoans', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[80px]"
                />
              </div>

              {/* Tax Status */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">कर तिरेको स्थिति</Label>
                <Input
                  placeholder="Tax payment status"
                  value={formData.financialInfo.taxStatus}
                  onChange={(e) => handleInputChange('financialInfo', 'taxStatus', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">८. कानुनी अवस्था</h2>
              <p className="text-gray-600">Legal Status</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Criminal Case */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="criminalCase"
                    checked={formData.legalStatus.hasCriminalCase}
                    onCheckedChange={(checked) => handleInputChange('legalStatus', 'hasCriminalCase', !!checked)}
                  />
                  <Label htmlFor="criminalCase" className="text-gray-700 font-medium cursor-pointer">
                    कुनै आपराधिक मुद्दा छ? (Any criminal case?)
                  </Label>
                </div>
              </div>

              {/* Case Details */}
              {formData.legalStatus.hasCriminalCase && (
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">अदालतको फैसला वा विचाराधीन मुद्दा विवरण</Label>
                  <Textarea
                    placeholder="Court verdict or pending case details"
                    value={formData.legalStatus.caseDetails}
                    onChange={(e) => handleInputChange('legalStatus', 'caseDetails', e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[100px]"
                  />
                </div>
              )}

              {/* Eligibility Declaration */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">निर्वाचन लड्न योग्यताको घोषणा</Label>
                <Textarea
                  placeholder="Declaration of eligibility to contest election"
                  value={formData.legalStatus.eligibilityDeclaration}
                  onChange={(e) => handleInputChange('legalStatus', 'eligibilityDeclaration', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                />
              </div>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">९. दृष्टि, लक्ष्य र घोषण</h2>
              <p className="text-gray-600">Vision, Goals & Declaration</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Vision */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">दृष्टि (Vision)</Label>
                <Textarea
                  placeholder="Your vision for the constituency and country"
                  value={formData.visionGoals.vision}
                  onChange={(e) => handleInputChange('visionGoals', 'vision', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                />
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">लक्ष्य (Goals)</Label>
                <Textarea
                  placeholder="Key goals and objectives"
                  value={formData.visionGoals.goals}
                  onChange={(e) => handleInputChange('visionGoals', 'goals', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                />
              </div>

              {/* Declaration */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">घोषणा (Declaration)</Label>
                <Textarea
                  placeholder="Your declaration to the voters"
                  value={formData.visionGoals.declaration}
                  onChange={(e) => handleInputChange('visionGoals', 'declaration', e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                />
              </div>

              {/* Social Media */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">सामाजिक सञ्जाल (Social Media)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                    </Label>
                    <Input
                      placeholder="Facebook profile URL"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-sky-500" /> Twitter / X
                    </Label>
                    <Input
                      placeholder="Twitter profile URL"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                    </Label>
                    <Input
                      placeholder="Instagram profile URL"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" /> YouTube
                    </Label>
                    <Input
                      placeholder="YouTube channel URL"
                      value={formData.socialMedia.youtube}
                      onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            निर्वाचन उम्मेदवार विवरण संकलन फारम
          </h1>
          <p className="text-gray-600 text-lg">Election Candidate Information Collection Form</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center p-2 md:p-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1 ${
                    isActive || isCompleted ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden md:block">{step.title}</span>
                  <span className="text-xs font-medium md:hidden">{step.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
          <CardContent className="p-6 md:p-10">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                पछाडि (Previous)
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  अगाडि (Next)
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      पेश गर्दै...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      फारम पेश गर्नुहोस् (Submit)
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-red-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            फिर्ता जानुहोस् (Go Back)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateRegistrationForm;
