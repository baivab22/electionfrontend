import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Video, FileText, User, Mail, Lock, Eye, EyeOff, AlertCircle, Phone, Heart, Smartphone } from 'lucide-react';
import API from '@/lib/api';
import type { Department, CreateFeedbackData, Feedback } from '@/lib/api';

const feedbackTypes = ['compliment', 'complaint', 'suggestion', 'inquiry'];
const feedbackCategories = ['service_quality', 'staff_conduct', 'response_time', 'transparency', 'accessibility', 'other'];
const priorityLevels = ['low', 'medium', 'high', 'urgent'];
const roles = ['student', 'teacher', 'staff', 'alumni', 'admin'];

type MediaPreview = { file: File; url: string; kind: 'image' | 'video' };

export default function FeedbackPage() {
  const [type, setType] = useState<CreateFeedbackData['type']>('suggestion');
  const [category, setCategory] = useState<CreateFeedbackData['category']>('service_quality');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contact info for anonymous feedback
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactName, setContactName] = useState('');

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Department state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);
  const [assignedToDepartment, setAssignedToDepartment] = useState('none');

  // Media state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    setDepartmentsError(null);
    try {
      const response = await API.stats.getDepartments();
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartmentsError('Failed to load departments. Using default options.');
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const sortedDepartments = useMemo(() => {
    const priorityOrder = [
      'Planning Directorate',
      'VC office',
      'Rector Office',
      'Registrar office',
      'TU controller office'
    ];

    const sorted = [...departments].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.name);
      const bIndex = priorityOrder.indexOf(b.name);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [departments]);

  useEffect(() => {
    const list = files.map((f) => {
      const url = URL.createObjectURL(f);
      const kind = f.type.startsWith('image/') ? 'image' : 'video';
      return { file: f, url, kind };
    });
    setPreviews(list);
    return () => {
      list.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const filtered = selected.filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    const limited = filtered.slice(0, 5);
    setFiles((prev) => [...prev, ...limited].slice(0, 5));
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onAuth() {
    setLoginLoading(true);
    setError(null);
    try {
      if (authMode === 'login') {
        const res = await API.auth.login(email, password);
        setUser(res.user);
      } else {
        const res = await API.auth.register(name, email, password, role);
        setUser(res.user);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoginLoading(false);
    }
  }

  const onSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setSuccessId(null);

    try {
      const feedbackData: CreateFeedbackData = {
        type,
        category,
        subject,
        description,
        anonymous: !anonymous ? false : true,
        contactEmail: !anonymous ? contactEmail : undefined,
        contactPhone: !anonymous ? contactPhone : undefined,
        contactName: !anonymous ? contactName : undefined,
        assignedDepartment: assignedToDepartment !== 'none' ? assignedToDepartment : undefined
      };

      const response = await API.feedback.createFeedback(feedbackData, files);
      setSuccessId(response.feedback._id);

      // Reset form
      setSubject('');
      setDescription('');
      setAssignedToDepartment('none');
      setFiles([]);
      setContactEmail('');
      setContactPhone('');
      setContactName('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Submit failed';
      setError(msg);
      console.error('Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [type, category, subject, description, anonymous, contactEmail, contactPhone, contactName, assignedToDepartment, files]);

  const needLogin = !anonymous && !user;
  const canSubmit =
    !!type &&
    !!category &&
    !!subject &&
    !!description &&
    (subject.length >= 5 && subject.length <= 200) &&
    (description.length >= 10 && description.length <= 5000) &&
    (!needLogin) &&
    !submitting;

  const mediaHint = useMemo(
    () => 'You can attach up to 5 files (images or videos), max 15MB each.',
    []
  );

  const getFeedbackIcon = (fb_type: string) => {
    switch (fb_type) {
      case 'compliment':
        return '👍';
      case 'complaint':
        return '⚠️';
      case 'suggestion':
        return '💡';
      case 'inquiry':
        return '❓';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'service_quality':
        return 'bg-blue-100 text-blue-700';
      case 'staff_conduct':
        return 'bg-green-100 text-green-700';
      case 'response_time':
        return 'bg-yellow-100 text-yellow-700';
      case 'transparency':
        return 'bg-purple-100 text-purple-700';
      case 'accessibility':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Share Your Feedback
          </h1>
          <p className="text-gray-600 text-lg">
            Help us improve by sharing your thoughts, suggestions, or concerns
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg p-2">
            <CardTitle className="text-xl flex items-center gap-2 px-2 py-3">
              <FileText className="w-5 h-5" />
              Feedback Details
            </CardTitle>
            <CardDescription className="text-blue-100 px-2">
              Tell us about your experience and help us serve you better.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Feedback Type and Category */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Feedback Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((t) => (
                      <SelectItem key={t} value={t} className="hover:bg-blue-50">
                        <span className="flex items-center gap-2">
                          {getFeedbackIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Category</Label>
                <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                  <SelectTrigger className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackCategories.map((c) => (
                      <SelectItem key={c} value={c} className="hover:bg-blue-50">
                        <span className="capitalize">{c.replace(/_/g, ' ')}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="space-y-3">
              <Label htmlFor="anon" className="text-gray-700 font-medium">
                Submission Type
              </Label>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Switch
                  id="anon"
                  checked={anonymous}
                  onCheckedChange={setAnonymous}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  {anonymous ? '🕶️ Anonymous' : '👤 Identified'}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Subject</Label>
              <Input
                placeholder="Brief title for your feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {subject.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Description</Label>
              <Textarea
                rows={6}
                placeholder="Describe your feedback in detail. What happened? What could be improved? How can we help?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500">
                {description.length}/5000 characters
              </p>
            </div>

            {/* Contact Info for Non-Anonymous */}
            {!anonymous && (
              <div className="border-2 border-blue-100 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="font-semibold text-gray-700 mb-4">Your Contact Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-4 h-4" /> Name
                    </Label>
                    <Input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your full name"
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email *
                      </Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </Label>
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+977-XXXXXXXXXX"
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Department Assignment */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium">Assign to Department</Label>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Optional
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Suggest which department should review this feedback.
              </p>
              <Select value={assignedToDepartment} onValueChange={setAssignedToDepartment} disabled={departmentsLoading}>
                <SelectTrigger className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                  <SelectValue
                    placeholder={
                      departmentsLoading
                        ? 'Loading departments...'
                        : sortedDepartments.length === 0
                          ? 'No departments available'
                          : 'Select department (optional)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {sortedDepartments.map((d) => (
                    <SelectItem key={d._id || d.id} value={d.name} className="hover:bg-blue-50">
                      <div className="flex flex-col">
                        <span className="font-medium">{d.name}</span>
                        {d.description && (
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {d.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {departmentsError && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-sm text-amber-800">
                    <p className="font-medium">Department loading issue</p>
                    <p className="text-amber-700">{departmentsError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Media Attachments */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium">Media Attachments</Label>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                  Optional
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{mediaHint}</p>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={onFileChange}
                className="hidden"
              />

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previews.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {p.kind === 'image' ? (
                        <div className="relative">
                          <img
                            src={p.url}
                            alt={p.file.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-1 left-1">
                            <Badge className="bg-green-500 text-white">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Image
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <video src={p.url} className="w-full h-32 object-cover" />
                          <div className="absolute top-1 left-1">
                            <Badge className="bg-blue-500 text-white">
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          </div>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate font-medium">
                          {p.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(p.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">❌ {error}</p>
              </div>
            )}

            {successId && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✅ Feedback submitted successfully! ID:{' '}
                  <span className="font-mono">{successId}</span>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  You can track your feedback status using this ID. We will review and respond to your feedback shortly.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </Button>

              {!canSubmit && !submitting && (
                <div className="flex items-center text-sm text-gray-500">
                  {subject.length < 5 && 'Subject too short. '}
                  {description.length < 10 && 'Description too short. '}
                  {!anonymous && !contactEmail && 'Email required for identified feedback.'}
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-700 mb-2">📋 Feedback Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be specific and constructive in your feedback</li>
                <li>• Include relevant details to help us understand the issue</li>
                <li>• Remain professional and respectful</li>
                <li>• Provide contact information for follow-ups (non-anonymous)</li>
                <li>
                  • Attach photos or videos for better context{' '}
                  <span className="text-xs text-gray-500">(optional)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
