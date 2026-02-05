import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';

interface CandidateFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ onSubmit, initialData, isLoading = false }) => {
  const [formData, setFormData] = useState(initialData || {
    personalInfo: {
      fullName: '',
      fullName_np: '',
      position: 'Parliamentary',
      constituency: '',
      dateOfBirth: '',
      gender: 'Male',
      contactNumber: '',
      email: '',
      address: ''
    },
    biography: {
      bio_en: '',
      bio_np: '',
      backgroundEducation: '',
      experience: '',
      profilePhoto: null
    },
    manifesto: {
      title_en: '',
      title_np: '',
      content_en: '',
      content_np: '',
      manifestoBrochure: null
    },
    issues: [],
    achievements: [],
    campaign: {
      campaignStartDate: '',
      campaignEndDate: '',
      campaignSlogan_en: '',
      campaignSlogan_np: '',
      votingTarget: 0,
      campaignManager: {
        name: '',
        email: '',
        phone: ''
      }
    }
  });

  const [newIssue, setNewIssue] = useState({
    issueTitle_en: '',
    issueTitle_np: '',
    issueDescription_en: '',
    issueDescription_np: '',
    issueCategory: 'Other',
    priority: 5
  });

  const [newAchievement, setNewAchievement] = useState({
    achievementTitle_en: '',
    achievementTitle_np: '',
    achievementDescription_en: '',
    achievementDescription_np: '',
    achievementDate: '',
    achievementCategory: 'Other',
    achievementImage: null
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const handleNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [subsection]: {
          ...formData[section][subsection],
          [field]: value
        }
      }
    });
  };

  const addIssue = () => {
    if (newIssue.issueTitle_en.trim()) {
      setFormData({
        ...formData,
        issues: [...formData.issues, newIssue]
      });
      setNewIssue({
        issueTitle_en: '',
        issueTitle_np: '',
        issueDescription_en: '',
        issueDescription_np: '',
        issueCategory: 'Other',
        priority: 5
      });
    }
  };

  const removeIssue = (index: number) => {
    setFormData({
      ...formData,
      issues: formData.issues.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    if (newAchievement.achievementTitle_en.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement]
      });
      setNewAchievement({
        achievementTitle_en: '',
        achievementTitle_np: '',
        achievementDescription_en: '',
        achievementDescription_np: '',
        achievementDate: '',
        achievementCategory: 'Other',
        achievementImage: null
      });
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="biography">Biography</TabsTrigger>
          <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
          <TabsTrigger value="extras">Issues & Achievements</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name (English)"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
                <Input
                  placeholder="Full Name (Nepali)"
                  value={formData.personalInfo.fullName_np || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName_np', e.target.value)}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={formData.personalInfo.position} onValueChange={(val) => handleInputChange('personalInfo', 'position', val)}>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="President">President</SelectItem>
                    <SelectItem value="Vice President">Vice President</SelectItem>
                    <SelectItem value="Parliamentary">Parliamentary</SelectItem>
                    <SelectItem value="Local Body">Local Body</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Constituency"
                  value={formData.personalInfo.constituency}
                  onChange={(e) => handleInputChange('personalInfo', 'constituency', e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
                <Select value={formData.personalInfo.gender} onValueChange={(val) => handleInputChange('personalInfo', 'gender', val)}>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
                <Input
                  placeholder="Contact Number"
                  value={formData.personalInfo.contactNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'contactNumber', e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <Input
                placeholder="Address"
                value={formData.personalInfo.address}
                onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                className="border-primary/20 focus:border-primary"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biography Tab */}
        <TabsContent value="biography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Biography & Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Profile Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('biography', 'profilePhoto', e.target.files?.[0])}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <Textarea
                placeholder="Biography (English)"
                value={formData.biography.bio_en}
                onChange={(e) => handleInputChange('biography', 'bio_en', e.target.value)}
                rows={5}
                className="border-primary/20 focus:border-primary"
              />

              <Textarea
                placeholder="Biography (Nepali)"
                value={formData.biography.bio_np || ''}
                onChange={(e) => handleInputChange('biography', 'bio_np', e.target.value)}
                rows={5}
                className="border-primary/20 focus:border-primary"
              />

              <Textarea
                placeholder="Education & Background (English)"
                value={formData.biography.backgroundEducation}
                onChange={(e) => handleInputChange('biography', 'backgroundEducation', e.target.value)}
                rows={4}
                className="border-primary/20 focus:border-primary"
              />

              <Textarea
                placeholder="Professional Experience (English)"
                value={formData.biography.experience}
                onChange={(e) => handleInputChange('biography', 'experience', e.target.value)}
                rows={4}
                className="border-primary/20 focus:border-primary"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manifesto Tab */}
        <TabsContent value="manifesto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Campaign Manifesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Manifesto Title (English)"
                value={formData.manifesto.title_en}
                onChange={(e) => handleInputChange('manifesto', 'title_en', e.target.value)}
                className="border-primary/20 focus:border-primary"
              />

              <Textarea
                placeholder="Manifesto Content (English)"
                value={formData.manifesto.content_en}
                onChange={(e) => handleInputChange('manifesto', 'content_en', e.target.value)}
                rows={6}
                className="border-primary/20 focus:border-primary"
              />

              <Input
                placeholder="Campaign Slogan (English)"
                value={formData.campaign.campaignSlogan_en}
                onChange={(e) => handleNestedChange('campaign', 'campaignSlogan_en', e.target.value)}
                className="border-primary/20 focus:border-primary"
              />

              <div>
                <label className="text-sm font-semibold mb-2 block">Manifesto Brochure (PDF)</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleInputChange('manifesto', 'manifestoBrochure', e.target.files?.[0])}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues & Achievements Tab */}
        <TabsContent value="extras" className="space-y-4">
          {/* Issues Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Key Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Issue Title (English)"
                  value={newIssue.issueTitle_en}
                  onChange={(e) => setNewIssue({ ...newIssue, issueTitle_en: e.target.value })}
                  className="border-primary/20 focus:border-primary"
                />
                <Textarea
                  placeholder="Issue Description"
                  value={newIssue.issueDescription_en}
                  onChange={(e) => setNewIssue({ ...newIssue, issueDescription_en: e.target.value })}
                  rows={3}
                  className="border-primary/20 focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newIssue.issueCategory} onValueChange={(val) => setNewIssue({ ...newIssue, issueCategory: val })}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Priority (1-10)"
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: parseInt(e.target.value) })}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <Button type="button" onClick={addIssue} className="w-full bg-secondary hover:bg-secondary/90 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Issue
                </Button>
              </div>

              {formData.issues.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {formData.issues.map((issue, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-primary/5 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-primary">{issue.issueTitle_en}</p>
                        <Badge className="mt-1 bg-secondary text-black">{issue.issueCategory}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIssue(idx)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Achievement Title (English)"
                  value={newAchievement.achievementTitle_en}
                  onChange={(e) => setNewAchievement({ ...newAchievement, achievementTitle_en: e.target.value })}
                  className="border-primary/20 focus:border-primary"
                />
                <Textarea
                  placeholder="Achievement Description"
                  value={newAchievement.achievementDescription_en}
                  onChange={(e) => setNewAchievement({ ...newAchievement, achievementDescription_en: e.target.value })}
                  rows={3}
                  className="border-primary/20 focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={newAchievement.achievementDate}
                    onChange={(e) => setNewAchievement({ ...newAchievement, achievementDate: e.target.value })}
                    className="border-primary/20 focus:border-primary"
                  />
                  <Select value={newAchievement.achievementCategory} onValueChange={(val) => setNewAchievement({ ...newAchievement, achievementCategory: val })}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Award">Award</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="Initiative">Initiative</SelectItem>
                      <SelectItem value="Community Work">Community Work</SelectItem>
                      <SelectItem value="Public Service">Public Service</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addAchievement} className="w-full bg-secondary hover:bg-secondary/90 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Achievement
                </Button>
              </div>

              {formData.achievements.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {formData.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-primary/5 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-primary">{achievement.achievementTitle_en}</p>
                        <Badge className="mt-1 bg-accent text-white">{achievement.achievementCategory}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(idx)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold"
      >
        {isLoading ? 'Saving...' : 'Save Candidate'}
      </Button>
    </form>
  );
};

export default CandidateForm;
