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
import { Camera, Upload, X, ImageIcon, Video, FileText, User, Mail, Lock, Eye, EyeOff, Building, AlertCircle, Square, RotateCcw } from 'lucide-react';
import { createSuggestionWithMedia, getDepartments, register, login as apiLogin, Department } from '@/lib/api';

const categories = ['academic', 'administrative', 'infrastructure', 'other'];
const roles = ['student', 'teacher', 'staff', 'alumni', 'admin'];

type MediaPreview = { file: File; url: string; kind: 'image' | 'video' };

// CameraCapture component implementation
const CameraCapture = ({ onCapture, className = '' }: { 
  onCapture: (data: { blob: Blob; kind: 'image' | 'video' }) => void; 
  className?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [captureMode, setCaptureMode] = useState<'image' | 'video'>('image');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Start the camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: captureMode === 'video' // Only enable audio for video recording
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  }, [facingMode, captureMode]);

  // Stop the camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, [isRecording]);

  // Toggle camera facing mode
  const toggleFacingMode = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(blob => {
        if (blob) {
          onCapture({ blob, kind: 'image' });
        }
      }, 'image/jpeg', 0.8);
    }
  }, [onCapture]);

  // Start video recording
  const startRecording = useCallback(() => {
    if (!streamRef.current || !videoRef.current) return;

    recordedChunksRef.current = [];
    setRecordingTime(0);
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        onCapture({ blob, kind: 'video' });
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to start video recording. Please try again.');
    }
  }, [onCapture]);

  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  // Switch between photo and video mode
  const toggleCaptureMode = useCallback(() => {
    const newMode = captureMode === 'image' ? 'video' : 'image';
    setCaptureMode(newMode);
    
    // Restart camera with new settings (audio for video)
    stopCamera();
    setTimeout(startCamera, 100);
  }, [captureMode, startCamera, stopCamera]);

  // Initialize camera on component mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-[300px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-white text-center p-4">
              <p className="text-lg font-medium mb-2">Camera Error</p>
              <p className="text-sm mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline" className="text-white border-white">
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-center gap-4">
          {/* Capture mode toggle */}
          <Button
            variant="outline"
            onClick={toggleCaptureMode}
            className="flex items-center gap-2"
          >
            {captureMode === 'image' ? (
              <>
                <Video className="w-4 h-4" />
                Switch to Video
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Switch to Photo
              </>
            )}
          </Button>
          
          {/* Camera flip button */}
          <Button
            variant="outline"
            onClick={toggleFacingMode}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Flip Camera
          </Button>
        </div>
        
        <div className="flex justify-center">
          {/* Capture button */}
          {captureMode === 'image' ? (
            <Button
              onClick={capturePhoto}
              size="lg"
              className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-gray-300"
            >
              <Camera className="w-8 h-8" />
            </Button>
          ) : (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700 border-4 border-red-300' 
                  : 'bg-white text-black hover:bg-gray-200 border-4 border-gray-300'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Video className="w-8 h-8" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SubmitPage() {
  const [category, setCategory] = useState('academic');
  const [description, setDescription] = useState('');
  const [assignedToDepartment, setAssignedToDepartment] = useState('none');
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState(null);

  // Department state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [adminCode, setAdminCode] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Media state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    setDepartmentsError(null);
    try {
      const response = await getDepartments();
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartmentsError('Failed to load departments. Using default options.');
      // Fallback to empty array - user can still submit without department selection
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('assignedToDepartment state changed:', assignedToDepartment);
  }, [assignedToDepartment]);

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
    setFiles(prev => [...prev, ...limited].slice(0, 5));
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // Handle camera capture
  const handleCameraCapture = useCallback((data: { blob: Blob; kind: 'image' | 'video' }) => {
    // Create a file from the blob with appropriate name and type
    const fileType = data.kind === 'image' ? 'image/jpeg' : 'video/webm';
    const fileExtension = data.kind === 'image' ? 'jpg' : 'webm';
    const fileName = `capture-${Date.now()}.${fileExtension}`;
    
    const file = new File([data.blob], fileName, { type: fileType });
    
    // Add the captured media to files (max 5 total)
    setFiles(prev => {
      const newFiles = [...prev, file];
      return newFiles.slice(-5); // Keep only last 5 files
    });
    
    setShowCamera(false);
    setError(null);
  }, []);

  async function onAuth() {
    setLoginLoading(true);
    setError(null);
    try {
      if (authMode === 'login') {
        const res = await apiLogin(email, password);
        setUser(res.user);
      } else {
        const res = await register(name, email, password, role);
        setUser(res.user);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoginLoading(false);
    }
  }

  // Handle department change with debugging
  const handleDepartmentChange = useCallback((value: string) => {
    console.log('Department changing from', assignedToDepartment, 'to', value);
    setAssignedToDepartment(value);
  }, [assignedToDepartment]);

  // Use useCallback to ensure we capture the latest state values
  const onSubmit = useCallback(async () => {
    console.log('onSubmit called with assignedToDepartment:', assignedToDepartment);
    console.log('Current state values:', { category, description, assignedToDepartment, anonymous });
    
    setSubmitting(true);
    setError(null);
    setSuccessId(null);
    
    try {
      const form = new FormData();
      form.append('category', category);
      form.append('description', description);
      form.append('anonymous', String(anonymous));
      form.append('actionTaken', 'No action yet');
      
      // Handle assignedToDepartment - only append if it has a value and is not 'none'
      if (assignedToDepartment && assignedToDepartment !== 'none' && assignedToDepartment.trim() !== '') {
        console.log('Appending assignedDepartment:', assignedToDepartment);
        form.append('assignedDepartment', assignedToDepartment);
      } else {
        console.log('Not appending assignedDepartment - value is:', assignedToDepartment);
      }
      
      // Append files
      files.forEach((f) => form.append('media', f, f.name));
      
      // Debug: Log all form data
      console.log('FormData contents:');
      for (let [key, value] of form.entries()) {
        console.log(`${key}:`, value);
      }
      
      const res = await createSuggestionWithMedia(form);
      const id = (res.suggestion._id || res.suggestion.id);
      setSuccessId(id);
      
      // Reset form
      setDescription('');
      setAssignedToDepartment('none');
      setFiles([]);
      
      if (!anonymous) {
        // navigate('/'); // optional: take them home
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Submit failed';
      setError(msg);
      console.error('Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [category, description, assignedToDepartment, anonymous, files]);

  const needLogin = !anonymous && !user;
  const canSubmit = !!category && !!description && (!needLogin) && !submitting;

  const mediaHint = useMemo(
    () => 'You can attach up to 5 files (images or videos), max 15MB each.',
    []
  );

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'academic': return '📚';
      case 'administrative': return '🏢';
      case 'infrastructure': return '🏗️';
      default: return '💡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className=" mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Submit Suggestion
          </h1>
          <p className="text-gray-600 text-lg">Share your ideas to help improve our institution</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg p-2">
            <CardTitle className="text-xl flex items-center gap-2 px-2 py-3">
              <FileText className="w-5 h-5" />
              Suggestion Details
            </CardTitle>
            <CardDescription className="text-indigo-100 px-2">
              Provide category, description, and optional media attachments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 transition-colors">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="hover:bg-indigo-50">
                        <span className="flex items-center gap-2">
                          {getCategoryIcon(c)} {c.charAt(0).toUpperCase() + c.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="anon" className="text-gray-700 font-medium">Submission Type</Label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Switch 
                    id="anon" 
                    checked={anonymous} 
                    onCheckedChange={setAnonymous}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {anonymous ? '🕶️ Anonymous' : '👤 Identified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Assign to Department
                </Label>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Optional</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Suggest which department should handle this suggestion. Leave blank if unsure.
              </p>
              <div className="space-y-2">
                <Select 
                  value={assignedToDepartment} 
                  onValueChange={handleDepartmentChange}
                  disabled={departmentsLoading}
                >
                  <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 transition-colors">
                    <SelectValue placeholder={
                      departmentsLoading 
                        ? "Loading departments..." 
                        : departments.length === 0 
                        ? "No departments available"
                        : "Select department (optional)"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="संयोजक">संयोजक</SelectItem>
                    <SelectItem value="सह-संयोजक">सह-संयोजक</SelectItem>
                    <SelectItem value="प्रदेश संयोजक">प्रदेश संयोजक</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d._id || d.id} value={d.name} className="hover:bg-indigo-50">
                        <div className="flex flex-col">
                          <span className="font-medium">{d.name}</span>
                          {d.description && (
                            <span className="text-xs text-gray-500 line-clamp-1">{d.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Loading state */}
                {departmentsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
                    Loading departments...
                  </div>
                )}

                {/* Error state with retry option */}
                {departmentsError && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm text-amber-800">
                      <p className="font-medium">Department loading issue</p>
                      <p className="text-amber-700">{departmentsError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadDepartments}
                        className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        Retry loading departments
                      </Button>
                    </div>
                  </div>
                )}

                {/* Success state showing department count */}
                {!departmentsLoading && !departmentsError && departments.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {departments.length} departments available • Current: {assignedToDepartment === 'none' || !assignedToDepartment ? 'None selected' : assignedToDepartment}
                  </p>
                )}

                {/* No departments available */}
                {!departmentsLoading && !departmentsError && departments.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      No departments are currently available. You can still submit your suggestion.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!anonymous && !user && (
              <div className="border-2 border-indigo-100 rounded-xl p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                <Tabs value={authMode} onValueChange={setAuthMode}>
                  <TabsList className="bg-white/70 backdrop-blur-sm">
                    <TabsTrigger value="login" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                      Register
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email
                        </Label>
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="you@university.edu"
                          className="border-2 border-gray-200 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Password
                        </Label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-2 border-gray-200 focus:border-indigo-500 transition-colors pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={onAuth} 
                      disabled={loginLoading || !email || !password}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    >
                      {loginLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </TabsContent>
                  <TabsContent value="register" className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <User className="w-4 h-4" /> Name
                        </Label>
                        <Input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Your full name"
                          className="border-2 border-gray-200 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 transition-colors">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r} value={r} className="hover:bg-indigo-50">
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email
                        </Label>
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="you@university.edu"
                          className="border-2 border-gray-200 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Password
                        </Label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-2 border-gray-200 focus:border-indigo-500 transition-colors pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={onAuth} 
                      disabled={loginLoading || !email || !password || !name}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    >
                      {loginLoading ? 'Registering...' : 'Register'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Description</Label>
              <Textarea
                rows={6}
                placeholder="Describe your suggestion in detail. What problem does it solve? How would it improve things?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-2 border-gray-200 focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium">Media Attachments</Label>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">Optional</Badge>
              </div>
              <p className="text-sm text-gray-600">{mediaHint}</p>
              
              <div className="flex gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCamera(true)}
                  className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  disabled={loginLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
              
              <Input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,video/*" 
                multiple 
                onChange={onFileChange} 
                className="hidden"
              />

              {/* Camera Modal */}
              <Dialog open={showCamera} onOpenChange={setShowCamera}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Camera Capture
                    </DialogTitle>
                    <DialogDescription>
                      Capture photos or record videos directly from your camera
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 min-h-0">
                    <CameraCapture 
                      onCapture={handleCameraCapture} 
                      className="h-full"
                    />
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCamera(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {p.kind === 'image' ? (
                        <div className="relative">
                          <img src={p.url} alt={p.file.name} className="w-full h-32 object-cover" />
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
                        <p className="text-xs text-gray-600 truncate font-medium">{p.file.name}</p>
                        <p className="text-xs text-gray-400">{(p.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">❌ {error}</p>
                {error.includes('camera access') && (
                  <div className="mt-2 text-xs text-red-500">
                    <p>💡 <strong>Tips to fix camera issues:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Make sure you clicked "Allow" when prompted for camera access</li>
                      <li>Check if another app is using your camera</li>
                      <li>Try refreshing the page and allowing camera access again</li>
                      <li>Ensure you're using HTTPS (camera requires secure connection)</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {successId && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✅ Suggestion submitted successfully! ID: <span className="font-mono">{successId}</span>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  You can track your suggestion status using this ID.
                </p>
              </div>
            )}

            {/* User info display when logged in */}
            {!anonymous && user && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                  <User className="w-4 h-4" />
                  Logged in as: {user.name} ({user.role})
                </div>
                <p className="text-xs text-green-600 mt-1">
                  This suggestion will be submitted under your account.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={onSubmit} 
                disabled={!canSubmit}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Suggestion'
                )}
              </Button>
              
              {/* Form validation feedback */}
              {!canSubmit && !submitting && (
                <div className="flex items-center text-sm text-gray-500">
                  {!category && "Please select a category. "}
                  {!description && "Please provide a description. "}
                  {needLogin && "Please login to submit non-anonymous suggestions."}
                </div>
              )}
            </div>

            {/* Submission guidelines */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Submission Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be specific and constructive in your description</li>
                <li>• Focus on actionable improvements</li>
                <li>• Respect others and maintain professionalism</li>
                <li>• Avoid submitting duplicate suggestions</li>
                {departments.length > 0 && (
                  <li>• Selecting a department helps route your suggestion appropriately</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}