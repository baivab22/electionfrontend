// components/membership-form.tsx
"use client";

import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Users, 
  FileText, 
  Shield, 
  Upload, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Send,
  X,
  FileCheck
} from 'lucide-react';
import { membersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const provinces = [
  'Province 1', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'
];

const organizationTypes = [
  'Government', 'Private', 'NGO/INGO', 'Academic', 'Freelancer'
];

const expertiseAreas = [
  'Economic Policy', 'Healthcare', 'Education', 'Environment', 'Social Justice', 'Infrastructure', 'Other'
];

const membershipLevels = [
  'Provincial', 'Local (Palika)', 'Institutional', 'Individual'
];

const membershipTypes = [
  'General', 'Executive', 'Advisory', 'Lifetime'
];

const workingDomains = [
  'Digital Literacy', 'E-Governance', 'Infrastructure', 'Policy & Research', 'Innovation & Startups', 'Cyber Awareness'
];

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Professional', icon: Briefcase },
  { label: 'Membership', icon: Users },
  { label: 'Documents', icon: FileText },
  { label: 'Declaration', icon: Shield },
];

interface MembershipFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MembershipForm({ onSuccess, onError }: MembershipFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    generalInfo: {
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      citizenshipId: '',
      contactNumber: '',
      email: '',
      permanentAddress: {
        province: '',
        district: '',
        palika: '',
        wardNo: 1,
      },
      currentAddress: '',
    },
    professionalDetails: {
      organizationName: '',
      designation: '',
      organizationType: 'Government',
      workExperience: 0,
      areaOfExpertise: [] as string[],
      otherExpertise: '',
    },
    membershipDetails: {
      membershipLevel: 'Individual',
      provincePalikaName: '',
      membershipType: 'General',
      preferredWorkingDomain: [] as string[],
      motivation: '',
    },
    endorsement: {
      provinceCoordinator: {
        name: '',
        signature: '',
        contactNumber: '',
      },
      executiveMember: {
        name: '',
        signature: '',
        contactNumber: '',
      },
    },
    declaration: {
      agreed: false,
      signature: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const [files, setFiles] = useState<{
    citizenshipCopy?: File;
    photo?: File;
    recommendationLetter?: File;
    resume?: File;
  }>({});

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section: string, subSection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subSection]: {
          ...(prev[section as keyof typeof prev] as any)[subSection],
          [field]: value
        }
      }
    }));
  };

  const handleFileUpload = (field: keyof typeof files, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFiles(prev => ({ ...prev, [field]: file }));
    }
  };

  const removeFile = (field: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [field]: undefined }));
  };

  const handleArrayChange = (section: string, field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[section as keyof typeof prev] as any)[field] || [];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.generalInfo.fullName && 
                 formData.generalInfo.gender && 
                 formData.generalInfo.dateOfBirth &&
                 formData.generalInfo.citizenshipId &&
                 formData.generalInfo.email &&
                 formData.generalInfo.contactNumber);
      case 1:
        return !!(formData.professionalDetails.organizationName &&
                 formData.professionalDetails.designation &&
                 formData.professionalDetails.areaOfExpertise.length > 0);
      case 2:
        return !!(formData.membershipDetails.membershipLevel &&
                 formData.membershipDetails.membershipType &&
                 formData.membershipDetails.motivation);
      case 3:
        return !!(files.citizenshipCopy && files.photo);
      case 4:
        return !!(formData.declaration.agreed && formData.declaration.signature);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSubmit = new FormData();

      // Append JSON data
      formDataToSubmit.append('generalInfo', JSON.stringify(formData.generalInfo));
      formDataToSubmit.append('professionalDetails', JSON.stringify(formData.professionalDetails));
      formDataToSubmit.append('membershipDetails', JSON.stringify(formData.membershipDetails));
      formDataToSubmit.append('endorsement', JSON.stringify(formData.endorsement));
      formDataToSubmit.append('declaration', JSON.stringify(formData.declaration));

      // Append files
      if (files.citizenshipCopy) formDataToSubmit.append('citizenshipCopy', files.citizenshipCopy);
      if (files.photo) formDataToSubmit.append('photo', files.photo);
      if (files.recommendationLetter) formDataToSubmit.append('recommendationLetter', files.recommendationLetter);
      if (files.resume) formDataToSubmit.append('resume', files.resume);

      await membersAPI.createMember(formDataToSubmit);
      
      toast({
        title: "Application Submitted",
        description: "Your membership application has been submitted successfully!",
      });
      
      onSuccess?.();
      
      // Reset form
      setActiveStep(0);
      setFormData({
        generalInfo: {
          fullName: '',
          gender: 'Male',
          dateOfBirth: '',
          citizenshipId: '',
          contactNumber: '',
          email: '',
          permanentAddress: { province: '', district: '', palika: '', wardNo: 1 },
          currentAddress: '',
        },
        professionalDetails: {
          organizationName: '',
          designation: '',
          organizationType: 'Government',
          workExperience: 0,
          areaOfExpertise: [],
          otherExpertise: '',
        },
        membershipDetails: {
          membershipLevel: 'Individual',
          provincePalikaName: '',
          membershipType: 'General',
          preferredWorkingDomain: [],
          motivation: '',
        },
        endorsement: {
          provinceCoordinator: { name: '', signature: '', contactNumber: '' },
          executiveMember: { name: '', signature: '', contactNumber: '' },
        },
        declaration: {
          agreed: false,
          signature: '',
          date: new Date().toISOString().split('T')[0],
        },
      });
      setFiles({});

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
              <p className="text-gray-600">Please provide your basic personal details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.generalInfo.fullName}
                  onChange={(e) => handleInputChange('generalInfo', 'fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.generalInfo.gender}
                  onValueChange={(value) => handleInputChange('generalInfo', 'gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.generalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('generalInfo', 'dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="citizenshipId">Citizenship ID *</Label>
                <Input
                  id="citizenshipId"
                  value={formData.generalInfo.citizenshipId}
                  onChange={(e) => handleInputChange('generalInfo', 'citizenshipId', e.target.value)}
                  placeholder="Enter citizenship ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.generalInfo.contactNumber}
                  onChange={(e) => handleInputChange('generalInfo', 'contactNumber', e.target.value)}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.generalInfo.email}
                  onChange={(e) => handleInputChange('generalInfo', 'email', e.target.value.toLowerCase())}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Select
                    value={formData.generalInfo.permanentAddress.province}
                    onValueChange={(value) => handleNestedChange('generalInfo', 'permanentAddress', 'province', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.generalInfo.permanentAddress.district}
                    onChange={(e) => handleNestedChange('generalInfo', 'permanentAddress', 'district', e.target.value)}
                    placeholder="Enter district"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="palika">Palika *</Label>
                  <Input
                    id="palika"
                    value={formData.generalInfo.permanentAddress.palika}
                    onChange={(e) => handleNestedChange('generalInfo', 'permanentAddress', 'palika', e.target.value)}
                    placeholder="Enter palika"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wardNo">Ward No *</Label>
                  <Input
                    id="wardNo"
                    type="number"
                    value={formData.generalInfo.permanentAddress.wardNo}
                    onChange={(e) => handleNestedChange('generalInfo', 'permanentAddress', 'wardNo', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAddress">Current Address *</Label>
              <Textarea
                id="currentAddress"
                value={formData.generalInfo.currentAddress}
                onChange={(e) => handleInputChange('generalInfo', 'currentAddress', e.target.value)}
                placeholder="Enter your current address"
                rows={3}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Professional Details</h3>
              <p className="text-gray-600">Tell us about your professional background</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.professionalDetails.organizationName}
                  onChange={(e) => handleInputChange('professionalDetails', 'organizationName', e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.professionalDetails.designation}
                  onChange={(e) => handleInputChange('professionalDetails', 'designation', e.target.value)}
                  placeholder="Enter your designation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type *</Label>
                <Select
                  value={formData.professionalDetails.organizationType}
                  onValueChange={(value) => handleInputChange('professionalDetails', 'organizationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workExperience">Work Experience (Years) *</Label>
                <Input
                  id="workExperience"
                  type="number"
                  value={formData.professionalDetails.workExperience}
                  onChange={(e) => handleInputChange('professionalDetails', 'workExperience', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Area of Expertise *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expertiseAreas.map((expertise) => (
                  <div key={expertise} className="flex items-center space-x-2">
                    <Checkbox
                      id={`expertise-${expertise}`}
                      checked={formData.professionalDetails.areaOfExpertise.includes(expertise)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('professionalDetails', 'areaOfExpertise', expertise, checked as boolean)
                      }
                    />
                    <Label htmlFor={`expertise-${expertise}`} className="text-sm font-normal">
                      {expertise}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {formData.professionalDetails.areaOfExpertise.includes('Other') && (
              <div className="space-y-2">
                <Label htmlFor="otherExpertise">Other Expertise</Label>
                <Input
                  id="otherExpertise"
                  value={formData.professionalDetails.otherExpertise}
                  onChange={(e) => handleInputChange('professionalDetails', 'otherExpertise', e.target.value)}
                  placeholder="Please specify your other expertise"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Membership Details</h3>
              <p className="text-gray-600">Tell us about your preferred membership</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="membershipLevel">Membership Level *</Label>
                <Select
                  value={formData.membershipDetails.membershipLevel}
                  onValueChange={(value) => handleInputChange('membershipDetails', 'membershipLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership level" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincePalikaName">Province/Palika Name *</Label>
                <Input
                  id="provincePalikaName"
                  value={formData.membershipDetails.provincePalikaName}
                  onChange={(e) => handleInputChange('membershipDetails', 'provincePalikaName', e.target.value)}
                  placeholder="Enter province or palika name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membershipType">Membership Type *</Label>
                <Select
                  value={formData.membershipDetails.membershipType}
                  onValueChange={(value) => handleInputChange('membershipDetails', 'membershipType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Preferred Working Domain</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workingDomains.map((domain) => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox
                      id={`domain-${domain}`}
                      checked={formData.membershipDetails.preferredWorkingDomain.includes(domain)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('membershipDetails', 'preferredWorkingDomain', domain, checked as boolean)
                      }
                    />
                    <Label htmlFor={`domain-${domain}`} className="text-sm font-normal">
                      {domain}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Motivation for Joining *</Label>
              <Textarea
                id="motivation"
                value={formData.membershipDetails.motivation}
                onChange={(e) => handleInputChange('membershipDetails', 'motivation', e.target.value)}
                placeholder="Tell us why you want to support the CPN..."
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Required Documents</h3>
              <p className="text-gray-600">Please upload the required documents (Images or PDFs only, max 10MB each)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'citizenshipCopy' as const, label: 'Citizenship Copy', required: true },
                { key: 'photo' as const, label: 'Passport Photo', required: true },
                { key: 'recommendationLetter' as const, label: 'Recommendation Letter', required: false },
                { key: 'resume' as const, label: 'Resume/CV', required: false },
              ].map(({ key, label, required }) => (
                <div key={key} className="space-y-3">
                  <Label>
                    {label} {required && '*'}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id={key}
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(key, e)}
                      className="hidden"
                    />
                    <label htmlFor={key} className="cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        {files[key] ? files[key]?.name : `Upload ${label}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click to browse files
                      </p>
                    </label>
                    {files[key] && (
                      <div className="mt-3 flex items-center justify-center space-x-2">
                        <FileCheck className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary" className="text-xs">
                          Uploaded
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(key)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Declaration & Endorsement</h3>
              <p className="text-gray-600">Please review and confirm your application</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-4">Declaration</h4>
                <p className="text-sm text-gray-600 mb-4">
                  I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. 
                  I understand that any false information may lead to rejection of my application or termination of membership.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="declaration"
                    checked={formData.declaration.agreed}
                    onCheckedChange={(checked) => handleInputChange('declaration', 'agreed', checked)}
                  />
                  <Label htmlFor="declaration" className="text-sm font-normal">
                    I agree to the terms and conditions stated above *
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="signature">Signature *</Label>
              <Input
                id="signature"
                value={formData.declaration.signature}
                onChange={(e) => handleInputChange('declaration', 'signature', e.target.value)}
                placeholder="Type your full name as signature"
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Endorsement (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coordinatorName">Province Coordinator Name</Label>
                  <Input
                    id="coordinatorName"
                    value={formData.endorsement.provinceCoordinator.name}
                    onChange={(e) => handleNestedChange('endorsement', 'provinceCoordinator', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinatorContact">Province Coordinator Contact</Label>
                  <Input
                    id="coordinatorContact"
                    value={formData.endorsement.provinceCoordinator.contactNumber}
                    onChange={(e) => handleNestedChange('endorsement', 'provinceCoordinator', 'contactNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberName">Executive Member Name</Label>
                  <Input
                    id="memberName"
                    value={formData.endorsement.executiveMember.name}
                    onChange={(e) => handleNestedChange('endorsement', 'executiveMember', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberContact">Executive Member Contact</Label>
                  <Input
                    id="memberContact"
                    value={formData.endorsement.executiveMember.contactNumber}
                    onChange={(e) => handleNestedChange('endorsement', 'executiveMember', 'contactNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CPN Party Membership
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Join Nepal&apos;s Premier ICT Community
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {activeStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.label} className="flex flex-col items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      index <= activeStep
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {index < activeStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${
                      index <= activeStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={activeStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(activeStep) || loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}