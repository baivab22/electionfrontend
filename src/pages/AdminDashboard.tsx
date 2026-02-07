import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit, Trash2, Eye, Users, FileText, TrendingUp, Calendar, 
  Image, Upload, Settings, Loader2, AlertCircle, RefreshCw, 
  UserCheck, UserX, Download, Filter, Search, MessageCircle, Star, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import CreatePostForm from '@/components/admin/CreatePostForm';
import LoginForm from '@/components/admin/LoginForm';
import PollCreateForm from '@/components/admin/PollCreateForm';
import API, { CreatePostData, Post, UpdatePostData, User, Member, MembersQuery, StatsResponse, Candidate, CreateCandidateData, UpdateCandidateData, CandidateFeedback } from '@/lib/api';

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  featuredPosts: number;
  publishedPosts?: number;
  draftPosts?: number;
  monthlyViews?: number;
  monthlyPosts?: number;
  membershipStats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byMembershipLevel: Array<{ _id: string; count: number }>;
    byProvince: Array<{ _id: string; count: number }>;
  };
}

const PROVINCE_OPTIONS = [
  { value: 'province1', label: 'Province 1' },
  { value: 'province2', label: 'Province 2' },
  { value: 'province3', label: 'Province 3' },
  { value: 'province4', label: 'Province 4' },
  { value: 'province5', label: 'Province 5' },
  { value: 'province6', label: 'Province 6' },
  { value: 'province7', label: 'Province 7' },
];

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    featuredPosts: 0
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState<boolean>(false);
  const [isCandidateEditDialogOpen, setIsCandidateEditDialogOpen] = useState<boolean>(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  
  // Comprehensive candidate form matching the Nepali form structure
  const initialCandidateForm = {
    // 1. Personal Info
    personalInfo: {
      fullName: '',
      fullName_np: '',
      nickname: '',
      nickname_np: '',
      dateOfBirth: '',
      gender: 'Male',
      gender_np: 'पुरुष',
      maritalStatus: '',
      maritalStatus_np: '',
      permanentAddress: '',
      permanentAddress_np: '',
      currentAddress: '',
      currentAddress_np: '',
      citizenshipNumber: '',
      citizenshipIssuedDistrict: '',
      citizenshipIssuedDistrict_np: '',
      contactNumber: '',
      email: '',
      website: '',
    },
    // 2. Political Info
    politicalInfo: {
      partyName: 'नेपाल कम्युनिष्ट पार्टी',
      partyName_np: 'नेपाल कम्युनिष्ट पार्टी',
      currentPosition: '',
      currentPosition_np: '',
      candidacyLevel: '',
      candidacyLevel_np: '',
      constituencyNumber: '',
      constituency: '',
      constituency_np: '',
      electionSymbol: '',
      electionSymbol_np: '',
      isFirstTimeCandidate: false,
      previousElectionHistory: '',
      previousElectionHistory_np: '',
    },
    // 3. Education
    education: {
      highestQualification: '',
      highestQualification_np: '',
      subject: '',
      subject_np: '',
      institution: '',
      institution_np: '',
      country: 'Nepal',
      country_np: 'नेपाल',
      additionalTraining: '',
      additionalTraining_np: '',
    },
    // 4. Professional Experience
    professionalExperience: {
      currentProfession: '',
      currentProfession_np: '',
      previousExperience: '',
      previousExperience_np: '',
      organizationResponsibility: '',
      organizationResponsibility_np: '',
      leadershipExperience: '',
      leadershipExperience_np: '',
    },
    // 5. Political Experience
    politicalExperience: {
      partyJoinYear: '',
      movementRole: '',
      movementRole_np: '',
      previousRepresentativePosition: '',
      previousRepresentativePosition_np: '',
      majorAchievements: '',
      majorAchievements_np: '',
    },
    // 6. Social Engagement
    socialEngagement: {
      ngoInvolvement: '',
      ngoInvolvement_np: '',
      sectorWork: '',
      sectorWork_np: '',
      awardsHonors: '',
      awardsHonors_np: '',
    },
    // 7. Financial Info
    financialInfo: {
      movableAssets: '',
      movableAssets_np: '',
      immovableAssets: '',
      immovableAssets_np: '',
      annualIncomeSource: '',
      annualIncomeSource_np: '',
      bankLoans: '',
      bankLoans_np: '',
      taxStatus: '',
      taxStatus_np: '',
    },
    // 8. Legal Status
    legalStatus: {
      hasCriminalCase: false,
      caseDetails: '',
      caseDetails_np: '',
      eligibilityDeclaration: '',
      eligibilityDeclaration_np: '',
    },
    // 9. Vision & Goals
    visionGoals: {
      vision: '',
      vision_np: '',
      goals: '',
      goals_np: '',
      declaration: '',
      declaration_np: '',
    },
    // Social Media
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      linkedin: '',
    },
    // Campaign
    campaign: {
      campaignSlogan: '',
      campaignSlogan_np: '',
    },
    // File uploads
    profilePhotoFile: null as File | null,
    electionSymbolImageFile: null as File | null,
    isActive: true,
    isVerified: false,
  };
  
  const [candidateForm, setCandidateForm] = useState(initialCandidateForm);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPostsLoading, setIsPostsLoading] = useState<boolean>(false);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [isMembersLoading, setIsMembersLoading] = useState<boolean>(false);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState<boolean>(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Feedback state
  const [candidateFeedback, setCandidateFeedback] = useState<CandidateFeedback[]>([]);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [feedbackFilter, setFeedbackFilter] = useState<string>('');
  const [feedbackCandidateFilter, setFeedbackCandidateFilter] = useState<string>('');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  const [membersCurrentPage, setMembersCurrentPage] = useState<number>(1);
  const [membersTotalPages, setMembersTotalPages] = useState<number>(1);
  const [membersTotal, setMembersTotal] = useState<number>(0);
  const [membersFilters, setMembersFilters] = useState<MembersQuery>({
    page: 1,
    limit: 10,
    status: '',
    membershipLevel: '',
    search: '',
    province: ''
  });

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [membersFilters, isAuthenticated]);

  const initializeApp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (API.utils.isAuthenticated()) {
        await fetchUserInfo();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('App initialization error:', error);
      handleAuthError();
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userData = await API.auth.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
      
      await Promise.all([
        fetchPosts(),
        fetchStats(),
        fetchMembershipStats(),
        fetchCandidates(),
        fetchCandidateFeedback()
      ]);
    } catch (error) {
      console.error('Fetch user info error:', error);
      handleAuthError();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async (page: number = 1) => {
    setIsPostsLoading(true);
    setPostsError(null);
    
    try {
      const response = await API.posts.getPosts({
        page,
        limit: 12,
        language: 'en'
      });
      
      setPosts(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setTotalPosts(response.total);
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      setPostsError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch posts: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsPostsLoading(false);
    }
  };

  const fetchStats = async () => {
    setIsStatsLoading(true);
    
    try {
      const response = await API.stats.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalPosts: totalPosts || 0,
        totalUsers: 0,
        totalViews: 0,
        featuredPosts: 0
      });
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchMembers = async () => {
    setIsMembersLoading(true);
    setMembersError(null);
    
    try {
      const response = await API.members.getMembers(membersFilters);
      setMembers(response.data);
      setMembersCurrentPage(response.pagination.currentPage);
      setMembersTotalPages(response.pagination.totalPages);
      setMembersTotal(response.pagination.totalMembers);
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      setMembersError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch members: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsMembersLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setIsCandidatesLoading(true);
    setCandidatesError(null);

    try {
      const response = await API.candidates.getCandidates();
      setCandidates(response.data);
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      setCandidatesError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch candidates: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsCandidatesLoading(false);
    }
  };

  const fetchCandidateFeedback = async () => {
    setIsFeedbackLoading(true);
    setFeedbackError(null);

    try {
      const query: { status?: string; candidateId?: string } = {};
      if (feedbackFilter) query.status = feedbackFilter;
      if (feedbackCandidateFilter) query.candidateId = feedbackCandidateFilter;
      
      const response = await API.candidateFeedback.getAllFeedback(query);
      setCandidateFeedback(response.data || []);
      if (response.stats) {
        setFeedbackStats(response.stats);
      }
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      setFeedbackError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch feedback: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, status: 'pending' | 'approved' | 'rejected', isPublic?: boolean) => {
    try {
      const feedback = candidateFeedback.find(f => f._id === feedbackId);
      if (!feedback) return;
      
      await API.candidateFeedback.updateFeedbackStatus(
        (feedback as any).candidate?._id || (feedback as any).candidate,
        feedbackId,
        { status, isPublic: status === 'approved' ? true : false }
      );
      
      toast({
        title: "Success",
        description: `Feedback ${status} successfully`,
      });
      
      fetchCandidateFeedback();
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to update feedback: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const feedback = candidateFeedback.find(f => f._id === feedbackId);
      if (!feedback) return;
      
      await API.candidateFeedback.deleteFeedback(
        (feedback as any).candidate?._id || (feedback as any).candidate,
        feedbackId
      );
      
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
      
      fetchCandidateFeedback();
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to delete feedback: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const fetchMembershipStats = async () => {
    try {
      const response: StatsResponse = await API.members.getMembershipStats();
      setStats(prev => ({
        ...prev,
        membershipStats: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch membership stats:', error);
    }
  };

  const handleAuthError = () => {
    setUser(null);
    setIsAuthenticated(false);
    API.utils.removeToken();
    setError('Authentication failed. Please login again.');
  };

  const handleLogin = async (userData: User, token: string) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      API.utils.setToken(token);
      
      await Promise.all([
        fetchPosts(),
        fetchStats(),
        fetchMembershipStats(),
        fetchCandidates(),
        fetchCandidateFeedback()
      ]);
      
      toast({
        title: "Success",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await API.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPosts([]);
      setMembers([]);
      setStats({
        totalPosts: 0,
        totalUsers: 0,
        totalViews: 0,
        featuredPosts: 0
      });
    }
  };

  const handleCreatePost = async (postData: CreatePostData) => {
    try {
      console.log("Creating post with data:", postData);
      const response = await API.posts.createPost(postData);
      
      setPosts(prevPosts => [response.data, ...prevPosts]);
      
      setStats(prevStats => ({
        ...prevStats,
        totalPosts: prevStats.totalPosts + 1,
        featuredPosts: postData.featured ? prevStats.featuredPosts + 1 : prevStats.featuredPosts
      }));
      
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      // Refresh posts to get updated data
      await fetchPosts(currentPage);
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to create post: ${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCreatePoll = async (pollData: { title: string; description?: string; choices: Array<{ label: string }>; startAt?: string; endAt?: string; allowAnonymous?: boolean }) => {
    try {
      const res = await API.polls.createPoll(pollData);
      toast({ title: 'Poll created', description: 'Poll created successfully' });
      setIsPollDialogOpen(false);
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({ title: 'Error', description: `Failed to create poll: ${errorMessage}`, variant: 'destructive' });
    }
  };

  const handleEditPost = async (postData: UpdatePostData) => {
    if (!editingPost) return;
    
    try {
      console.log("Updating post with data:", postData);
      const response = await API.posts.updatePost(editingPost.id, postData);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === editingPost.id ? response.data : post
        )
      );
      
      if (postData.featured !== undefined && postData.featured !== editingPost.featured) {
        setStats(prevStats => ({
          ...prevStats,
          featuredPosts: postData.featured ? prevStats.featuredPosts + 1 : prevStats.featuredPosts - 1
        }));
      }
      
      setIsEditDialogOpen(false);
      setEditingPost(null);
      
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });
      
      // Refresh posts to get updated data
      await fetchPosts(currentPage);
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to update post: ${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeletePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await API.posts.deletePost(postId);
      
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      
      setStats(prevStats => ({
        ...prevStats,
        totalPosts: prevStats.totalPosts - 1,
        featuredPosts: post.featured ? prevStats.featuredPosts - 1 : prevStats.featuredPosts
      }));
      
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to delete post: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateMemberStatus = async (memberId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await API.members.updateMemberStatus(memberId, status);
      
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member._id === memberId ? { ...member, status } : member
        )
      );
      
      await fetchMembershipStats();
      
      toast({
        title: "Success",
        description: `Member status updated to ${status}`,
      });
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to update member status: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }
    
    try {
      await API.members.deleteMember(memberId);
      
      setMembers(prevMembers => prevMembers.filter(member => member._id !== memberId));
      
      await fetchMembershipStats();
      
      toast({
        title: "Success",
        description: "Member deleted successfully!",
      });
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to delete member: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleMembersFilterChange = (key: keyof MembersQuery, value: any) => {
    setMembersFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleRefreshData = async () => {
    await Promise.all([
      fetchPosts(currentPage),
      fetchStats(),
      fetchMembers(),
      fetchMembershipStats(),
      fetchCandidates()
    ]);
  };

  // Candidate handlers
  const handleCreateCandidate = async () => {
    try {
      const formData = new FormData();
      
      // 1. Personal Info
      Object.entries(candidateForm.personalInfo).forEach(([key, value]) => {
        formData.append(`personalInfo[${key}]`, String(value));
      });
      
      // 2. Political Info
      Object.entries(candidateForm.politicalInfo).forEach(([key, value]) => {
        formData.append(`politicalInfo[${key}]`, String(value));
      });
      
      // 3. Education
      Object.entries(candidateForm.education).forEach(([key, value]) => {
        formData.append(`education[${key}]`, String(value));
      });
      
      // 4. Professional Experience
      Object.entries(candidateForm.professionalExperience).forEach(([key, value]) => {
        formData.append(`professionalExperience[${key}]`, String(value));
      });
      
      // 5. Political Experience
      Object.entries(candidateForm.politicalExperience).forEach(([key, value]) => {
        formData.append(`politicalExperience[${key}]`, String(value));
      });
      
      // 6. Social Engagement
      Object.entries(candidateForm.socialEngagement).forEach(([key, value]) => {
        formData.append(`socialEngagement[${key}]`, String(value));
      });
      
      // 7. Financial Info
      Object.entries(candidateForm.financialInfo).forEach(([key, value]) => {
        formData.append(`financialInfo[${key}]`, String(value));
      });
      
      // 8. Legal Status
      Object.entries(candidateForm.legalStatus).forEach(([key, value]) => {
        formData.append(`legalStatus[${key}]`, String(value));
      });
      
      // 9. Vision & Goals
      Object.entries(candidateForm.visionGoals).forEach(([key, value]) => {
        formData.append(`visionGoals[${key}]`, String(value));
      });
      
      // Social Media
      Object.entries(candidateForm.socialMedia).forEach(([key, value]) => {
        formData.append(`socialMedia[${key}]`, String(value));
      });
      
      // Campaign
      Object.entries(candidateForm.campaign).forEach(([key, value]) => {
        formData.append(`campaign[${key}]`, String(value));
      });
      
      // File uploads
      if (candidateForm.profilePhotoFile) {
        formData.append('profilePhoto', candidateForm.profilePhotoFile);
      }
      if (candidateForm.electionSymbolImageFile) {
        formData.append('electionSymbolImage', candidateForm.electionSymbolImageFile);
      }
      
      formData.append('isActive', String(candidateForm.isActive));
      formData.append('isVerified', String(candidateForm.isVerified));

      const response = await API.candidates.createCandidate(formData);
      setCandidates([...candidates, response.data]);
      setIsCandidateDialogOpen(false);
      resetCandidateForm();
      
      toast({
        title: "Success",
        description: "Candidate created successfully!",
      });
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to create candidate: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCandidate = async () => {
    if (!editingCandidate) return;

    try {
      const formData = new FormData();
      
      // 1. Personal Info
      Object.entries(candidateForm.personalInfo).forEach(([key, value]) => {
        formData.append(`personalInfo[${key}]`, String(value));
      });
      
      // 2. Political Info
      Object.entries(candidateForm.politicalInfo).forEach(([key, value]) => {
        formData.append(`politicalInfo[${key}]`, String(value));
      });
      
      // 3. Education
      Object.entries(candidateForm.education).forEach(([key, value]) => {
        formData.append(`education[${key}]`, String(value));
      });
      
      // 4. Professional Experience
      Object.entries(candidateForm.professionalExperience).forEach(([key, value]) => {
        formData.append(`professionalExperience[${key}]`, String(value));
      });
      
      // 5. Political Experience
      Object.entries(candidateForm.politicalExperience).forEach(([key, value]) => {
        formData.append(`politicalExperience[${key}]`, String(value));
      });
      
      // 6. Social Engagement
      Object.entries(candidateForm.socialEngagement).forEach(([key, value]) => {
        formData.append(`socialEngagement[${key}]`, String(value));
      });
      
      // 7. Financial Info
      Object.entries(candidateForm.financialInfo).forEach(([key, value]) => {
        formData.append(`financialInfo[${key}]`, String(value));
      });
      
      // 8. Legal Status
      Object.entries(candidateForm.legalStatus).forEach(([key, value]) => {
        formData.append(`legalStatus[${key}]`, String(value));
      });
      
      // 9. Vision & Goals
      Object.entries(candidateForm.visionGoals).forEach(([key, value]) => {
        formData.append(`visionGoals[${key}]`, String(value));
      });
      
      // Social Media
      Object.entries(candidateForm.socialMedia).forEach(([key, value]) => {
        formData.append(`socialMedia[${key}]`, String(value));
      });
      
      // Campaign
      Object.entries(candidateForm.campaign).forEach(([key, value]) => {
        formData.append(`campaign[${key}]`, String(value));
      });
      
      // File uploads
      if (candidateForm.profilePhotoFile) {
        formData.append('profilePhoto', candidateForm.profilePhotoFile);
      }
      if (candidateForm.electionSymbolImageFile) {
        formData.append('electionSymbolImage', candidateForm.electionSymbolImageFile);
      }
      
      formData.append('isActive', String(candidateForm.isActive));
      formData.append('isVerified', String(candidateForm.isVerified));

      const response = await API.candidates.updateCandidate(editingCandidate._id, formData);
      setCandidates(candidates.map(c => c._id === editingCandidate._id ? response.data : c));
      setIsCandidateEditDialogOpen(false);
      setEditingCandidate(null);
      resetCandidateForm();
      
      toast({
        title: "Success",
        description: "Candidate updated successfully!",
      });
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to update candidate: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;

    try {
      await API.candidates.deleteCandidate(id);
      setCandidates(candidates.filter(c => c._id !== id));
      
      toast({
        title: "Success",
        description: "Candidate deleted successfully!",
      });
    } catch (error) {
      const errorMessage = API.utils.formatErrorMessage(error);
      toast({
        title: "Error",
        description: `Failed to delete candidate: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    const c = candidate as any; // Type assertion for flexible access
    setCandidateForm({
      personalInfo: {
        fullName: c.personalInfo?.fullName || '',
        fullName_np: c.personalInfo?.fullName_np || '',
        nickname: c.personalInfo?.nickname || '',
        nickname_np: c.personalInfo?.nickname_np || '',
        dateOfBirth: c.personalInfo?.dateOfBirth ? c.personalInfo.dateOfBirth.split('T')[0] : '',
        gender: c.personalInfo?.gender || 'Male',
        gender_np: c.personalInfo?.gender_np || 'पुरुष',
        maritalStatus: c.personalInfo?.maritalStatus || '',
        maritalStatus_np: c.personalInfo?.maritalStatus_np || '',
        permanentAddress: c.personalInfo?.permanentAddress || '',
        permanentAddress_np: c.personalInfo?.permanentAddress_np || '',
        currentAddress: c.personalInfo?.currentAddress || '',
        currentAddress_np: c.personalInfo?.currentAddress_np || '',
        citizenshipNumber: c.personalInfo?.citizenshipNumber || '',
        citizenshipIssuedDistrict: c.personalInfo?.citizenshipIssuedDistrict || '',
        citizenshipIssuedDistrict_np: c.personalInfo?.citizenshipIssuedDistrict_np || '',
        contactNumber: c.personalInfo?.contactNumber || '',
        email: c.personalInfo?.email || '',
        website: c.personalInfo?.website || '',
      },
      politicalInfo: {
        partyName: c.politicalInfo?.partyName || 'नेपाल कम्युनिष्ट पार्टी',
        partyName_np: c.politicalInfo?.partyName_np || 'नेपाल कम्युनिष्ट पार्टी',
        currentPosition: c.politicalInfo?.currentPosition || '',
        currentPosition_np: c.politicalInfo?.currentPosition_np || '',
        candidacyLevel: c.politicalInfo?.candidacyLevel || '',
        candidacyLevel_np: c.politicalInfo?.candidacyLevel_np || '',
        constituencyNumber: c.politicalInfo?.constituencyNumber || '',
        constituency: c.politicalInfo?.constituency || '',
        constituency_np: c.politicalInfo?.constituency_np || '',
        electionSymbol: c.politicalInfo?.electionSymbol || '',
        electionSymbol_np: c.politicalInfo?.electionSymbol_np || '',
        isFirstTimeCandidate: c.politicalInfo?.isFirstTimeCandidate || false,
        previousElectionHistory: c.politicalInfo?.previousElectionHistory || '',
        previousElectionHistory_np: c.politicalInfo?.previousElectionHistory_np || '',
      },
      education: {
        highestQualification: c.education?.highestQualification || '',
        highestQualification_np: c.education?.highestQualification_np || '',
        subject: c.education?.subject || '',
        subject_np: c.education?.subject_np || '',
        institution: c.education?.institution || '',
        institution_np: c.education?.institution_np || '',
        country: c.education?.country || 'Nepal',
        country_np: c.education?.country_np || 'नेपाल',
        additionalTraining: c.education?.additionalTraining || '',
        additionalTraining_np: c.education?.additionalTraining_np || '',
      },
      professionalExperience: {
        currentProfession: c.professionalExperience?.currentProfession || '',
        currentProfession_np: c.professionalExperience?.currentProfession_np || '',
        previousExperience: c.professionalExperience?.previousExperience || '',
        previousExperience_np: c.professionalExperience?.previousExperience_np || '',
        organizationResponsibility: c.professionalExperience?.organizationResponsibility || '',
        organizationResponsibility_np: c.professionalExperience?.organizationResponsibility_np || '',
        leadershipExperience: c.professionalExperience?.leadershipExperience || '',
        leadershipExperience_np: c.professionalExperience?.leadershipExperience_np || '',
      },
      politicalExperience: {
        partyJoinYear: c.politicalExperience?.partyJoinYear || '',
        movementRole: c.politicalExperience?.movementRole || '',
        movementRole_np: c.politicalExperience?.movementRole_np || '',
        previousRepresentativePosition: c.politicalExperience?.previousRepresentativePosition || '',
        previousRepresentativePosition_np: c.politicalExperience?.previousRepresentativePosition_np || '',
        majorAchievements: c.politicalExperience?.majorAchievements || '',
        majorAchievements_np: c.politicalExperience?.majorAchievements_np || '',
      },
      socialEngagement: {
        ngoInvolvement: c.socialEngagement?.ngoInvolvement || '',
        ngoInvolvement_np: c.socialEngagement?.ngoInvolvement_np || '',
        sectorWork: c.socialEngagement?.sectorWork || '',
        sectorWork_np: c.socialEngagement?.sectorWork_np || '',
        awardsHonors: c.socialEngagement?.awardsHonors || '',
        awardsHonors_np: c.socialEngagement?.awardsHonors_np || '',
      },
      financialInfo: {
        movableAssets: c.financialInfo?.movableAssets || '',
        movableAssets_np: c.financialInfo?.movableAssets_np || '',
        immovableAssets: c.financialInfo?.immovableAssets || '',
        immovableAssets_np: c.financialInfo?.immovableAssets_np || '',
        annualIncomeSource: c.financialInfo?.annualIncomeSource || '',
        annualIncomeSource_np: c.financialInfo?.annualIncomeSource_np || '',
        bankLoans: c.financialInfo?.bankLoans || '',
        bankLoans_np: c.financialInfo?.bankLoans_np || '',
        taxStatus: c.financialInfo?.taxStatus || '',
        taxStatus_np: c.financialInfo?.taxStatus_np || '',
      },
      legalStatus: {
        hasCriminalCase: c.legalStatus?.hasCriminalCase || false,
        caseDetails: c.legalStatus?.caseDetails || '',
        caseDetails_np: c.legalStatus?.caseDetails_np || '',
        eligibilityDeclaration: c.legalStatus?.eligibilityDeclaration || '',
        eligibilityDeclaration_np: c.legalStatus?.eligibilityDeclaration_np || '',
      },
      visionGoals: {
        vision: c.visionGoals?.vision || '',
        vision_np: c.visionGoals?.vision_np || '',
        goals: c.visionGoals?.goals || '',
        goals_np: c.visionGoals?.goals_np || '',
        declaration: c.visionGoals?.declaration || '',
        declaration_np: c.visionGoals?.declaration_np || '',
      },
      socialMedia: {
        facebook: c.socialMedia?.facebook || '',
        twitter: c.socialMedia?.twitter || '',
        instagram: c.socialMedia?.instagram || '',
        youtube: c.socialMedia?.youtube || '',
        tiktok: c.socialMedia?.tiktok || '',
        linkedin: c.socialMedia?.linkedin || '',
      },
      campaign: {
        campaignSlogan: c.campaign?.campaignSlogan || '',
        campaignSlogan_np: c.campaign?.campaignSlogan_np || '',
      },
      profilePhotoFile: null,
      electionSymbolImageFile: null,
      isActive: c.isActive ?? true,
      isVerified: c.isVerified ?? false,
    });
    setIsCandidateEditDialogOpen(true);
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      // 1. Personal Info
      personalInfo: {
        fullName: '',
        fullName_np: '',
        nickname: '',
        nickname_np: '',
        dateOfBirth: '',
        gender: 'Male',
        gender_np: 'पुरुष',
        maritalStatus: '',
        maritalStatus_np: '',
        permanentAddress: '',
        permanentAddress_np: '',
        currentAddress: '',
        currentAddress_np: '',
        citizenshipNumber: '',
        citizenshipIssuedDistrict: '',
        citizenshipIssuedDistrict_np: '',
        contactNumber: '',
        email: '',
        website: '',
      },
      // 2. Political Info
      politicalInfo: {
        partyName: 'नेपाल कम्युनिष्ट पार्टी',
        partyName_np: 'नेपाल कम्युनिष्ट पार्टी',
        currentPosition: '',
        currentPosition_np: '',
        candidacyLevel: '',
        candidacyLevel_np: '',
        constituencyNumber: '',
        constituency: '',
        constituency_np: '',
        electionSymbol: '',
        electionSymbol_np: '',
        isFirstTimeCandidate: false,
        previousElectionHistory: '',
        previousElectionHistory_np: '',
      },
      // 3. Education
      education: {
        highestQualification: '',
        highestQualification_np: '',
        subject: '',
        subject_np: '',
        institution: '',
        institution_np: '',
        country: 'Nepal',
        country_np: 'नेपाल',
        additionalTraining: '',
        additionalTraining_np: '',
      },
      // 4. Professional Experience
      professionalExperience: {
        currentProfession: '',
        currentProfession_np: '',
        previousExperience: '',
        previousExperience_np: '',
        organizationResponsibility: '',
        organizationResponsibility_np: '',
        leadershipExperience: '',
        leadershipExperience_np: '',
      },
      // 5. Political Experience
      politicalExperience: {
        partyJoinYear: '',
        movementRole: '',
        movementRole_np: '',
        previousRepresentativePosition: '',
        previousRepresentativePosition_np: '',
        majorAchievements: '',
        majorAchievements_np: '',
      },
      // 6. Social Engagement
      socialEngagement: {
        ngoInvolvement: '',
        ngoInvolvement_np: '',
        sectorWork: '',
        sectorWork_np: '',
        awardsHonors: '',
        awardsHonors_np: '',
      },
      // 7. Financial Info
      financialInfo: {
        movableAssets: '',
        movableAssets_np: '',
        immovableAssets: '',
        immovableAssets_np: '',
        annualIncomeSource: '',
        annualIncomeSource_np: '',
        bankLoans: '',
        bankLoans_np: '',
        taxStatus: '',
        taxStatus_np: '',
      },
      // 8. Legal Status
      legalStatus: {
        hasCriminalCase: false,
        caseDetails: '',
        caseDetails_np: '',
        eligibilityDeclaration: '',
        eligibilityDeclaration_np: '',
      },
      // 9. Vision & Goals
      visionGoals: {
        vision: '',
        vision_np: '',
        goals: '',
        goals_np: '',
        declaration: '',
        declaration_np: '',
      },
      // Social Media
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
      },
      // Campaign
      campaign: {
        campaignSlogan: '',
        campaignSlogan_np: '',
      },
      // File uploads
      profilePhotoFile: null,
      electionSymbolImageFile: null,
      isActive: true,
      isVerified: false,
    });
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingPost(null);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      technology: 'bg-gradient-to-r from-primary to-accent text-white',
      digitalTransformation: 'bg-gradient-to-r from-accent to-secondary text-white',
      socialJustice: 'bg-gradient-to-r from-primary/90 to-accent/90 text-white',
      events: 'bg-gradient-to-r from-secondary to-accent text-white',
      innovation: 'bg-gradient-to-r from-accent to-primary text-white',
      policy: 'bg-gradient-to-r from-secondary/90 to-primary/90 text-white',
      education: 'bg-gradient-to-r from-primary to-secondary text-white',
      startups: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const API_ASSET_URL = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_URL || 'https://api.abhushangallery.com/'
    : import.meta.env.VITE_DEV_URL || 'http://localhost:3000/';

  const getImageUrl = (post: Post) => {
    if (!post?.image) return '/placeholder-image.jpg';
    
    if (post.image.startsWith('http://') || post.image.startsWith('https://')) {
      return post.image;
    }
    
    return `${API_ASSET_URL}uploads/posts/${post.image}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {error && (
          <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-primary via-accent to-secondary shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/80">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshData}
                disabled={isPostsLoading || isStatsLoading || isMembersLoading}
                className="text-white hover:bg-white/10"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${(isPostsLoading || isStatsLoading || isMembersLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-right">
                <p className="text-sm text-white/80">Communist Party of Nepal (CPN)</p>
                <p className="text-xs text-white/70">Management Portal</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Posts</p>
                  {isStatsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <p className="text-4xl font-bold">{stats.totalPosts}</p>
                  )}
                  <p className="text-blue-200 text-xs mt-1">Published & Draft</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <FileText size={28} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Members</p>
                  {isStatsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <p className="text-4xl font-bold">{stats.membershipStats?.total || 0}</p>
                  )}
                  <p className="text-green-200 text-xs mt-1">All members</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Users size={28} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending Applications</p>
                  {isStatsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <p className="text-4xl font-bold">{stats.membershipStats?.pending || 0}</p>
                  )}
                  <p className="text-purple-200 text-xs mt-1">Awaiting review</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <UserCheck size={28} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Approved Members</p>
                  {isStatsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <p className="text-4xl font-bold">{stats.membershipStats?.approved || 0}</p>
                  )}
                  <p className="text-orange-200 text-xs mt-1">Active members</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <UserCheck size={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-[900px] bg-white shadow-lg border-0">
            <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Posts ({totalPosts})
            </TabsTrigger>
            <TabsTrigger value="candidates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
              Candidates ({candidates.length})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
              Feedback ({feedbackStats.total})
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              Members ({membersTotal})
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Media Library
            </TabsTrigger>
            <TabsTrigger value="polls" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              Polls
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Posts Management</h2>
                <p className="text-gray-600">Create and manage your blog posts</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <div>
                    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                      <Plus className="mr-2" size={18} />
                      Create New Post
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      Create New Post
                    </DialogTitle>
                  </DialogHeader>
                  <CreatePostForm 
                    onSubmit={handleCreatePost}
                    onCancel={handleCloseCreateDialog}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {postsError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {postsError}
                  <Button
                    variant="link"
                    className="ml-2 p-0 h-auto text-red-800 underline"
                    onClick={() => fetchPosts(currentPage)}
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isPostsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Loading posts...</span>
              </div>
            )}

            {!isPostsLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden">
                    <div className="relative">
                      <img
                        src={getImageUrl(post)}
                        alt={post.title_en}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/400/200';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>
                          {t(`categories.${post.category}`, post.category)}
                        </Badge>
                      </div>
                      {post.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-lg">
                            ⭐ Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {post.title_en}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>By {post.author?.name || 'Unknown'}</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            {post.views}
                          </span>
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments.length}</span>
                        </div>
                        <Badge variant={post.published ? "default" : "secondary"}>
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(post)}
                          className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(currentPage - 1)}
                  disabled={currentPage <= 1 || isPostsLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(currentPage + 1)}
                  disabled={currentPage >= totalPages || isPostsLoading}
                >
                  Next
                </Button>
              </div>
            )}

            {!isPostsLoading && posts.length === 0 && !postsError && (
              <div className="text-center py-12">
                <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first blog post
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus className="mr-2" size={16} />
                  Create Your First Post
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Polls Management Tab */}
          <TabsContent value="polls" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Polls Management</h2>
                <p className="text-gray-600">Create and manage polls</p>
              </div>
              <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
                <DialogTrigger asChild>
                  <div>
                    <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg px-4 py-2">
                      <Plus className="mr-2" size={16} />
                      Create Poll
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Poll</DialogTitle>
                  </DialogHeader>
                  <PollCreateForm onCreate={handleCreatePoll} onCancel={() => setIsPollDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600">Use the button above to create a new poll. Active polls will be visible on the public Polls page.</p>
            </div>
          </TabsContent>

          {/* Feedback Management Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Candidate Feedback Management</h2>
                <p className="text-gray-600">Review and manage feedback submitted for candidates</p>
              </div>
              <Button 
                onClick={fetchCandidateFeedback}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                <RefreshCw className="mr-2" size={16} />
                Refresh
              </Button>
            </div>

            {/* Feedback Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Total Feedback</p>
                      <p className="text-3xl font-bold">{feedbackStats.total}</p>
                    </div>
                    <MessageCircle size={32} className="opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Pending</p>
                      <p className="text-3xl font-bold">{feedbackStats.pending}</p>
                    </div>
                    <AlertCircle size={32} className="opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Approved</p>
                      <p className="text-3xl font-bold">{feedbackStats.approved}</p>
                    </div>
                    <CheckCircle size={32} className="opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Rejected</p>
                      <p className="text-3xl font-bold">{feedbackStats.rejected}</p>
                    </div>
                    <XCircle size={32} className="opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Filter by Status</Label>
                    <Select value={feedbackFilter || 'all'} onValueChange={(val) => { setFeedbackFilter(val === 'all' ? '' : val); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Filter by Candidate</Label>
                    <Select value={feedbackCandidateFilter || 'all'} onValueChange={(val) => { setFeedbackCandidateFilter(val === 'all' ? '' : val); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Candidates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Candidates</SelectItem>
                        {candidates.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {(c as any).personalInfo?.fullName || c.fullName || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchCandidateFeedback} className="bg-yellow-500 hover:bg-yellow-600 w-full">
                      <Filter className="mr-2" size={16} />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {feedbackError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {feedbackError}
                  <Button variant="link" className="ml-2 p-0 h-auto text-red-800 underline" onClick={fetchCandidateFeedback}>
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isFeedbackLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-600 mr-3" />
                <span className="text-gray-600">Loading feedback...</span>
              </div>
            )}

            {!isFeedbackLoading && (
              <Card className="border-0 shadow-xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidateFeedback.map((feedback) => (
                        <TableRow key={feedback._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {(feedback as any).candidate?.personalInfo?.profilePhoto && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={(feedback as any).candidate.personalInfo.profilePhoto} />
                                  <AvatarFallback>
                                    {((feedback as any).candidate?.personalInfo?.fullName || 'C').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span>{(feedback as any).candidate?.personalInfo?.fullName || 'Unknown Candidate'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              feedback.type === 'support' ? 'default' :
                              feedback.type === 'concern' ? 'destructive' :
                              feedback.type === 'question' ? 'secondary' : 'outline'
                            }>
                              {feedback.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={feedback.comment}>
                            {feedback.comment.substring(0, 50)}...
                          </TableCell>
                          <TableCell>
                            {feedback.anonymous ? (
                              <span className="text-gray-400 italic">Anonymous</span>
                            ) : (
                              <div>
                                <p className="font-medium">{feedback.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{feedback.email}</p>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              feedback.status === 'approved' ? 'default' :
                              feedback.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {feedback.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {feedback.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateFeedbackStatus(feedback._id, 'approved')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Approve"
                                  >
                                    <CheckCircle size={14} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateFeedbackStatus(feedback._id, 'rejected')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Reject"
                                  >
                                    <XCircle size={14} />
                                  </Button>
                                </>
                              )}
                              {feedback.status !== 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateFeedbackStatus(feedback._id, 'pending')}
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  title="Set Pending"
                                >
                                  <AlertCircle size={14} />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteFeedback(feedback._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {!isFeedbackLoading && candidateFeedback.length === 0 && !feedbackError && (
              <div className="text-center py-12">
                <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No feedback found</h3>
                <p className="text-gray-600">
                  {feedbackFilter || feedbackCandidateFilter 
                    ? 'No feedback matches your current filters' 
                    : 'No feedback has been submitted yet'
                  }
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Membership Management</h2>
                <p className="text-gray-600">Review and manage membership applications</p>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search by name, email..."
                        value={membersFilters.search || ''}
                        onChange={(e) => handleMembersFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={membersFilters.status || ''}
                    onValueChange={(value) => handleMembersFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={membersFilters.membershipLevel || ''}
                    onValueChange={(value) => handleMembersFilterChange('membershipLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Membership Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Provincial">Provincial</SelectItem>
                      <SelectItem value="Local (Palika)">Local (Palika)</SelectItem>
                      <SelectItem value="Institutional">Institutional</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={membersFilters.province || ''}
                    onValueChange={(value) => handleMembersFilterChange('province', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {PROVINCE_OPTIONS.map((province) => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {membersError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {membersError}
                  <Button
                    variant="link"
                    className="ml-2 p-0 h-auto text-red-800 underline"
                    onClick={fetchMembers}
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isMembersLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mr-3" />
                <span className="text-gray-600">Loading members...</span>
              </div>
            )}

            {!isMembersLoading && (
              <Card className="border-0 shadow-xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Membership Level</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {member.generalInfo.fullName}
                          </TableCell>
                          <TableCell>{member.generalInfo.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {member.membershipDetails.membershipLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.professionalDetails.organizationName}
                          </TableCell>
                          <TableCell>
                            {member.generalInfo.permanentAddress.province}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(member.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(member.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMember(member)}
                              >
                                <Eye size={14} />
                              </Button>
                              {member.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateMemberStatus(member._id, 'approved')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <UserCheck size={14} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateMemberStatus(member._id, 'rejected')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <UserX size={14} />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMember(member._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {membersTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {members.length} of {membersTotal} members
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleMembersFilterChange('page', membersCurrentPage - 1)}
                    disabled={membersCurrentPage <= 1 || isMembersLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {membersCurrentPage} of {membersTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handleMembersFilterChange('page', membersCurrentPage + 1)}
                    disabled={membersCurrentPage >= membersTotalPages || isMembersLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {!isMembersLoading && members.length === 0 && !membersError && (
              <div className="text-center py-12">
                <Users size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-600">
                  {Object.values(membersFilters).some(val => val && val !== 'all') 
                    ? 'No members match your current filters' 
                    : 'No membership applications yet'
                  }
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Candidates Management</h2>
                <p className="text-gray-600">Manage parliamentary and local candidates</p>
              </div>
              <Dialog open={isCandidateDialogOpen} onOpenChange={(open) => {
                if (open) {
                  resetCandidateForm();
                }
                setIsCandidateDialogOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                    <Plus className="mr-2" size={18} />
                    नयाँ उम्मेदवार थप्नुहोस्
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      नयाँ उम्मेदवार दर्ता फारम
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Section 1: Personal Information */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">१. आधारभूत व्यक्तिगत विवरण</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>पूरा नाम (English) *</Label>
                          <Input
                            value={candidateForm.personalInfo.fullName}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, fullName: e.target.value}})}
                            placeholder="Full Name in English"
                          />
                        </div>
                        <div>
                          <Label>पूरा नाम (नेपाली) *</Label>
                          <Input
                            value={candidateForm.personalInfo.fullName_np}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, fullName_np: e.target.value}})}
                            placeholder="पूरा नाम नेपालीमा"
                          />
                        </div>
                        <div>
                          <Label>उपनाम / चिनिने नाम (English)</Label>
                          <Input
                            value={candidateForm.personalInfo.nickname}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, nickname: e.target.value}})}
                            placeholder="Nickname"
                          />
                        </div>
                        <div>
                          <Label>उपनाम / चिनिने नाम (नेपाली)</Label>
                          <Input
                            value={candidateForm.personalInfo.nickname_np}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, nickname_np: e.target.value}})}
                            placeholder="उपनाम"
                          />
                        </div>
                        <div>
                          <Label>जन्म मिति *</Label>
                          <Input
                            type="date"
                            value={candidateForm.personalInfo.dateOfBirth}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, dateOfBirth: e.target.value}})}
                          />
                        </div>
                        <div>
                          <Label>लिङ्ग *</Label>
                          <Select
                            value={candidateForm.personalInfo.gender}
                            onValueChange={(value) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, gender: value, gender_np: value === 'Male' ? 'पुरुष' : value === 'Female' ? 'महिला' : 'अन्य'}})}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">पुरुष (Male)</SelectItem>
                              <SelectItem value="Female">महिला (Female)</SelectItem>
                              <SelectItem value="Other">अन्य (Other)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>वैवाहिक स्थिति</Label>
                          <Input
                            value={candidateForm.personalInfo.maritalStatus}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, maritalStatus: e.target.value}})}
                            placeholder="Marital Status"
                          />
                        </div>
                        <div>
                          <Label>वैवाहिक स्थिति (नेपाली)</Label>
                          <Input
                            value={candidateForm.personalInfo.maritalStatus_np}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, maritalStatus_np: e.target.value}})}
                            placeholder="विवाहित / अविवाहित"
                          />
                        </div>
                        <div>
                          <Label>स्थायी ठेगाना (English)</Label>
                          <Input
                            value={candidateForm.personalInfo.permanentAddress}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, permanentAddress: e.target.value}})}
                            placeholder="Permanent Address"
                          />
                        </div>
                        <div>
                          <Label>स्थायी ठेगाना (नेपाली)</Label>
                          <Input
                            value={candidateForm.personalInfo.permanentAddress_np}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, permanentAddress_np: e.target.value}})}
                            placeholder="स्थायी ठेगाना"
                          />
                        </div>
                        <div>
                          <Label>हालको ठेगाना (English)</Label>
                          <Input
                            value={candidateForm.personalInfo.currentAddress}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, currentAddress: e.target.value}})}
                            placeholder="Current Address"
                          />
                        </div>
                        <div>
                          <Label>हालको ठेगाना (नेपाली)</Label>
                          <Input
                            value={candidateForm.personalInfo.currentAddress_np}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, currentAddress_np: e.target.value}})}
                            placeholder="हालको ठेगाना"
                          />
                        </div>
                        <div>
                          <Label>नागरिकता नं.</Label>
                          <Input
                            value={candidateForm.personalInfo.citizenshipNumber}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, citizenshipNumber: e.target.value}})}
                            placeholder="Citizenship Number"
                          />
                        </div>
                        <div>
                          <Label>जारी जिल्ला</Label>
                          <Input
                            value={candidateForm.personalInfo.citizenshipIssuedDistrict}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, citizenshipIssuedDistrict: e.target.value}})}
                            placeholder="Issued District"
                          />
                        </div>
                        <div>
                          <Label>सम्पर्क नम्बर *</Label>
                          <Input
                            value={candidateForm.personalInfo.contactNumber}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, contactNumber: e.target.value}})}
                            placeholder="+977-98XXXXXXXX"
                          />
                        </div>
                        <div>
                          <Label>इमेल</Label>
                          <Input
                            type="email"
                            value={candidateForm.personalInfo.email}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, email: e.target.value}})}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <Label>वेबसाइट</Label>
                          <Input
                            value={candidateForm.personalInfo.website}
                            onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, website: e.target.value}})}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>प्रोफाइल फोटो</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCandidateForm({...candidateForm, profilePhotoFile: e.target.files?.[0] || null})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Political Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">२. राजनीतिक परिचय</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>पार्टीको नाम</Label>
                          <Input
                            value={candidateForm.politicalInfo.partyName}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, partyName: e.target.value}})}
                            placeholder="Party Name"
                          />
                        </div>
                        <div>
                          <Label>पार्टीको नाम (नेपाली)</Label>
                          <Input
                            value={candidateForm.politicalInfo.partyName_np}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, partyName_np: e.target.value}})}
                            placeholder="नेपाल कम्युनिष्ट पार्टी"
                          />
                        </div>
                        <div>
                          <Label>हालको पद</Label>
                          <Input
                            value={candidateForm.politicalInfo.currentPosition}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, currentPosition: e.target.value}})}
                            placeholder="Current Position"
                          />
                        </div>
                        <div>
                          <Label>हालको पद (नेपाली)</Label>
                          <Input
                            value={candidateForm.politicalInfo.currentPosition_np}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, currentPosition_np: e.target.value}})}
                            placeholder="हालको पद"
                          />
                        </div>
                        <div>
                          <Label>उम्मेदवारीको तह *</Label>
                          <Select
                            value={candidateForm.politicalInfo.candidacyLevel}
                            onValueChange={(value) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, candidacyLevel: value}})}
                          >
                            <SelectTrigger><SelectValue placeholder="तह छान्नुहोस्" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Federal">संघीय (Federal)</SelectItem>
                              <SelectItem value="Provincial">प्रदेश (Provincial)</SelectItem>
                              <SelectItem value="Local">स्थानीय (Local)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>निर्वाचन क्षेत्र नम्बर</Label>
                          <Input
                            value={candidateForm.politicalInfo.constituencyNumber}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, constituencyNumber: e.target.value}})}
                            placeholder="1, 2, 3..."
                          />
                        </div>
                        <div>
                          <Label>निर्वाचन क्षेत्र (English) *</Label>
                          <Input
                            value={candidateForm.politicalInfo.constituency}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, constituency: e.target.value}})}
                            placeholder="Kathmandu-1"
                          />
                        </div>
                        <div>
                          <Label>निर्वाचन क्षेत्र (नेपाली) *</Label>
                          <Input
                            value={candidateForm.politicalInfo.constituency_np}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, constituency_np: e.target.value}})}
                            placeholder="काठमाडौं-१"
                          />
                        </div>
                        <div>
                          <Label>चुनाव चिन्ह</Label>
                          <Input
                            value={candidateForm.politicalInfo.electionSymbol}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, electionSymbol: e.target.value}})}
                            placeholder="Election Symbol"
                          />
                        </div>
                        <div>
                          <Label>चुनाव चिन्ह (नेपाली)</Label>
                          <Input
                            value={candidateForm.politicalInfo.electionSymbol_np}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, electionSymbol_np: e.target.value}})}
                            placeholder="चुनाव चिन्ह"
                          />
                        </div>
                        <div>
                          <Label>चुनाव चिन्ह फोटो</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCandidateForm({...candidateForm, electionSymbolImageFile: e.target.files?.[0] || null})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={candidateForm.politicalInfo.isFirstTimeCandidate}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, isFirstTimeCandidate: e.target.checked}})}
                          />
                          <Label>पहिलो पटक उम्मेदवार हो?</Label>
                        </div>
                        <div className="md:col-span-2">
                          <Label>पहिलेको निर्वाचन इतिहास</Label>
                          <Textarea
                            value={candidateForm.politicalInfo.previousElectionHistory}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, previousElectionHistory: e.target.value}})}
                            placeholder="Previous election history..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Education */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">३. शैक्षिक योग्यता</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>उच्चतम शैक्षिक योग्यता</Label>
                          <Input
                            value={candidateForm.education.highestQualification}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, highestQualification: e.target.value}})}
                            placeholder="Masters, Bachelors, etc."
                          />
                        </div>
                        <div>
                          <Label>उच्चतम शैक्षिक योग्यता (नेपाली)</Label>
                          <Input
                            value={candidateForm.education.highestQualification_np}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, highestQualification_np: e.target.value}})}
                            placeholder="स्नातकोत्तर, स्नातक, आदि"
                          />
                        </div>
                        <div>
                          <Label>विषय</Label>
                          <Input
                            value={candidateForm.education.subject}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, subject: e.target.value}})}
                            placeholder="Subject/Major"
                          />
                        </div>
                        <div>
                          <Label>विषय (नेपाली)</Label>
                          <Input
                            value={candidateForm.education.subject_np}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, subject_np: e.target.value}})}
                            placeholder="विषय"
                          />
                        </div>
                        <div>
                          <Label>शिक्षण संस्था</Label>
                          <Input
                            value={candidateForm.education.institution}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, institution: e.target.value}})}
                            placeholder="Institution Name"
                          />
                        </div>
                        <div>
                          <Label>शिक्षण संस्था (नेपाली)</Label>
                          <Input
                            value={candidateForm.education.institution_np}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, institution_np: e.target.value}})}
                            placeholder="संस्थाको नाम"
                          />
                        </div>
                        <div>
                          <Label>देश</Label>
                          <Input
                            value={candidateForm.education.country}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, country: e.target.value}})}
                            placeholder="Nepal"
                          />
                        </div>
                        <div>
                          <Label>देश (नेपाली)</Label>
                          <Input
                            value={candidateForm.education.country_np}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, country_np: e.target.value}})}
                            placeholder="नेपाल"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>थप तालिम / सर्टिफिकेट</Label>
                          <Textarea
                            value={candidateForm.education.additionalTraining}
                            onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, additionalTraining: e.target.value}})}
                            placeholder="Additional training or certifications..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Professional Experience */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">४. पेशागत अनुभव</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>हालको पेशा</Label>
                          <Input
                            value={candidateForm.professionalExperience.currentProfession}
                            onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, currentProfession: e.target.value}})}
                            placeholder="Current Profession"
                          />
                        </div>
                        <div>
                          <Label>हालको पेशा (नेपाली)</Label>
                          <Input
                            value={candidateForm.professionalExperience.currentProfession_np}
                            onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, currentProfession_np: e.target.value}})}
                            placeholder="हालको पेशा"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>अघिल्लो पेशागत अनुभव</Label>
                          <Textarea
                            value={candidateForm.professionalExperience.previousExperience}
                            onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, previousExperience: e.target.value}})}
                            placeholder="Previous work experience..."
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>संस्था/संगठनमा जिम्मेवारी</Label>
                          <Textarea
                            value={candidateForm.professionalExperience.organizationResponsibility}
                            onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, organizationResponsibility: e.target.value}})}
                            placeholder="Organization responsibilities..."
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>नेतृत्व अनुभव</Label>
                          <Textarea
                            value={candidateForm.professionalExperience.leadershipExperience}
                            onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, leadershipExperience: e.target.value}})}
                            placeholder="Leadership experience..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Political Experience */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">५. राजनीतिक अनुभव</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>पार्टी प्रवेश वर्ष</Label>
                          <Input
                            value={candidateForm.politicalExperience.partyJoinYear}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, partyJoinYear: e.target.value}})}
                            placeholder="2050, 2060..."
                          />
                        </div>
                        <div>
                          <Label>आन्दोलनमा भूमिका</Label>
                          <Input
                            value={candidateForm.politicalExperience.movementRole}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, movementRole: e.target.value}})}
                            placeholder="Role in movements"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>अघिल्लो जनप्रतिनिधि पद</Label>
                          <Textarea
                            value={candidateForm.politicalExperience.previousRepresentativePosition}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, previousRepresentativePosition: e.target.value}})}
                            placeholder="Previous representative positions..."
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>प्रमुख उपलब्धिहरू</Label>
                          <Textarea
                            value={candidateForm.politicalExperience.majorAchievements}
                            onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, majorAchievements: e.target.value}})}
                            placeholder="Major achievements..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Social Engagement */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">६. सामाजिक संलग्नता</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>गैरसरकारी संस्था संलग्नता</Label>
                          <Textarea
                            value={candidateForm.socialEngagement.ngoInvolvement}
                            onChange={(e) => setCandidateForm({...candidateForm, socialEngagement: {...candidateForm.socialEngagement, ngoInvolvement: e.target.value}})}
                            placeholder="NGO involvement..."
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>क्षेत्रगत कार्य (शिक्षा, स्वास्थ्य, पर्यावरण, आदि)</Label>
                          <Textarea
                            value={candidateForm.socialEngagement.sectorWork}
                            onChange={(e) => setCandidateForm({...candidateForm, socialEngagement: {...candidateForm.socialEngagement, sectorWork: e.target.value}})}
                            placeholder="Sector-wise work..."
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>पुरस्कार / सम्मान</Label>
                          <Textarea
                            value={candidateForm.socialEngagement.awardsHonors}
                            onChange={(e) => setCandidateForm({...candidateForm, socialEngagement: {...candidateForm.socialEngagement, awardsHonors: e.target.value}})}
                            placeholder="Awards and honors..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 7: Financial Information */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">७. आर्थिक विवरण</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>चल सम्पत्ति</Label>
                          <Textarea
                            value={candidateForm.financialInfo.movableAssets}
                            onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, movableAssets: e.target.value}})}
                            placeholder="Movable assets..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>अचल सम्पत्ति</Label>
                          <Textarea
                            value={candidateForm.financialInfo.immovableAssets}
                            onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, immovableAssets: e.target.value}})}
                            placeholder="Immovable assets..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>वार्षिक आय स्रोत</Label>
                          <Input
                            value={candidateForm.financialInfo.annualIncomeSource}
                            onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, annualIncomeSource: e.target.value}})}
                            placeholder="Annual income source"
                          />
                        </div>
                        <div>
                          <Label>बैंक ऋण</Label>
                          <Input
                            value={candidateForm.financialInfo.bankLoans}
                            onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, bankLoans: e.target.value}})}
                            placeholder="Bank loans if any"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>कर चुक्ता स्थिति</Label>
                          <Input
                            value={candidateForm.financialInfo.taxStatus}
                            onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, taxStatus: e.target.value}})}
                            placeholder="Tax clearance status"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 8: Legal Status */}
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">८. कानुनी अवस्था</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={candidateForm.legalStatus.hasCriminalCase}
                            onChange={(e) => setCandidateForm({...candidateForm, legalStatus: {...candidateForm.legalStatus, hasCriminalCase: e.target.checked}})}
                          />
                          <Label>के कुनै फौजदारी मुद्दा छ?</Label>
                        </div>
                        {candidateForm.legalStatus.hasCriminalCase && (
                          <div>
                            <Label>मुद्दाको विवरण</Label>
                            <Textarea
                              value={candidateForm.legalStatus.caseDetails}
                              onChange={(e) => setCandidateForm({...candidateForm, legalStatus: {...candidateForm.legalStatus, caseDetails: e.target.value}})}
                              placeholder="Case details..."
                              rows={2}
                            />
                          </div>
                        )}
                        <div>
                          <Label>योग्यता घोषणा</Label>
                          <Textarea
                            value={candidateForm.legalStatus.eligibilityDeclaration}
                            onChange={(e) => setCandidateForm({...candidateForm, legalStatus: {...candidateForm.legalStatus, eligibilityDeclaration: e.target.value}})}
                            placeholder="Declaration of eligibility..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 9: Vision & Goals */}
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">९. दृष्टि र लक्ष्य</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>दृष्टि (Vision)</Label>
                          <Textarea
                            value={candidateForm.visionGoals.vision}
                            onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, vision: e.target.value}})}
                            placeholder="Your vision..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>दृष्टि (नेपाली)</Label>
                          <Textarea
                            value={candidateForm.visionGoals.vision_np}
                            onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, vision_np: e.target.value}})}
                            placeholder="तपाईंको दृष्टि..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>लक्ष्यहरू (Goals)</Label>
                          <Textarea
                            value={candidateForm.visionGoals.goals}
                            onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, goals: e.target.value}})}
                            placeholder="Your goals..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>लक्ष्यहरू (नेपाली)</Label>
                          <Textarea
                            value={candidateForm.visionGoals.goals_np}
                            onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, goals_np: e.target.value}})}
                            placeholder="तपाईंका लक्ष्यहरू..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>घोषणा / प्रतिज्ञा</Label>
                          <Textarea
                            value={candidateForm.visionGoals.declaration}
                            onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, declaration: e.target.value}})}
                            placeholder="Declaration/Pledge..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">सामाजिक सञ्जाल</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Facebook</Label>
                          <Input
                            value={candidateForm.socialMedia.facebook}
                            onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, facebook: e.target.value}})}
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                        <div>
                          <Label>Twitter/X</Label>
                          <Input
                            value={candidateForm.socialMedia.twitter}
                            onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, twitter: e.target.value}})}
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                        <div>
                          <Label>Instagram</Label>
                          <Input
                            value={candidateForm.socialMedia.instagram}
                            onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, instagram: e.target.value}})}
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                        <div>
                          <Label>YouTube</Label>
                          <Input
                            value={candidateForm.socialMedia.youtube}
                            onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, youtube: e.target.value}})}
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                        <div>
                          <Label>TikTok</Label>
                          <Input
                            value={candidateForm.socialMedia.tiktok}
                            onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, tiktok: e.target.value}})}
                            placeholder="https://tiktok.com/..."
                          />
                        </div>
                        <div>
                          <Label>LinkedIn</Label>
                          <Input
                            value={candidateForm.socialMedia.linkedin}
                            onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, linkedin: e.target.value}})}
                            placeholder="https://linkedin.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Campaign */}
                    <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">अभियान</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>चुनावी नारा (English)</Label>
                          <Input
                            value={candidateForm.campaign.campaignSlogan}
                            onChange={(e) => setCandidateForm({...candidateForm, campaign: {...candidateForm.campaign, campaignSlogan: e.target.value}})}
                            placeholder="Campaign Slogan"
                          />
                        </div>
                        <div>
                          <Label>चुनावी नारा (नेपाली)</Label>
                          <Input
                            value={candidateForm.campaign.campaignSlogan_np}
                            onChange={(e) => setCandidateForm({...candidateForm, campaign: {...candidateForm.campaign, campaignSlogan_np: e.target.value}})}
                            placeholder="चुनावी नारा"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={candidateForm.isActive}
                          onChange={(e) => setCandidateForm({...candidateForm, isActive: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="isActive">सक्रिय उम्मेदवार</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isVerified"
                          checked={candidateForm.isVerified}
                          onChange={(e) => setCandidateForm({...candidateForm, isVerified: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="isVerified">प्रमाणित उम्मेदवार</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCandidateDialogOpen(false);
                          resetCandidateForm();
                        }}
                      >
                        रद्द गर्नुहोस्
                      </Button>
                      <Button
                        onClick={handleCreateCandidate}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                      >
                        उम्मेदवार सिर्जना गर्नुहोस्
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isCandidateEditDialogOpen} onOpenChange={setIsCandidateEditDialogOpen}>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    उम्मेदवार सम्पादन गर्नुहोस्
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Section 1: Personal Information */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">१. आधारभूत व्यक्तिगत विवरण</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>पूरा नाम (English) *</Label>
                        <Input
                          value={candidateForm.personalInfo.fullName}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, fullName: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>पूरा नाम (नेपाली) *</Label>
                        <Input
                          value={candidateForm.personalInfo.fullName_np}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, fullName_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>उपनाम (English)</Label>
                        <Input
                          value={candidateForm.personalInfo.nickname}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, nickname: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>उपनाम (नेपाली)</Label>
                        <Input
                          value={candidateForm.personalInfo.nickname_np}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, nickname_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>जन्म मिति *</Label>
                        <Input
                          type="date"
                          value={candidateForm.personalInfo.dateOfBirth}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, dateOfBirth: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>लिङ्ग *</Label>
                        <Select
                          value={candidateForm.personalInfo.gender}
                          onValueChange={(value) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, gender: value}})}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">पुरुष</SelectItem>
                            <SelectItem value="Female">महिला</SelectItem>
                            <SelectItem value="Other">अन्य</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>वैवाहिक स्थिति</Label>
                        <Input
                          value={candidateForm.personalInfo.maritalStatus}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, maritalStatus: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>वैवाहिक स्थिति (नेपाली)</Label>
                        <Input
                          value={candidateForm.personalInfo.maritalStatus_np}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, maritalStatus_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>स्थायी ठेगाना</Label>
                        <Input
                          value={candidateForm.personalInfo.permanentAddress}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, permanentAddress: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>स्थायी ठेगाना (नेपाली)</Label>
                        <Input
                          value={candidateForm.personalInfo.permanentAddress_np}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, permanentAddress_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>हालको ठेगाना</Label>
                        <Input
                          value={candidateForm.personalInfo.currentAddress}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, currentAddress: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>हालको ठेगाना (नेपाली)</Label>
                        <Input
                          value={candidateForm.personalInfo.currentAddress_np}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, currentAddress_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>नागरिकता नं.</Label>
                        <Input
                          value={candidateForm.personalInfo.citizenshipNumber}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, citizenshipNumber: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>जारी जिल्ला</Label>
                        <Input
                          value={candidateForm.personalInfo.citizenshipIssuedDistrict}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, citizenshipIssuedDistrict: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>सम्पर्क नम्बर *</Label>
                        <Input
                          value={candidateForm.personalInfo.contactNumber}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, contactNumber: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>इमेल</Label>
                        <Input
                          type="email"
                          value={candidateForm.personalInfo.email}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, email: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>वेबसाइट</Label>
                        <Input
                          value={candidateForm.personalInfo.website}
                          onChange={(e) => setCandidateForm({...candidateForm, personalInfo: {...candidateForm.personalInfo, website: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>नयाँ प्रोफाइल फोटो</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCandidateForm({...candidateForm, profilePhotoFile: e.target.files?.[0] || null})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Political Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">२. राजनीतिक परिचय</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>पार्टीको नाम</Label>
                        <Input
                          value={candidateForm.politicalInfo.partyName}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, partyName: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>पार्टीको नाम (नेपाली)</Label>
                        <Input
                          value={candidateForm.politicalInfo.partyName_np}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, partyName_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>हालको पद</Label>
                        <Input
                          value={candidateForm.politicalInfo.currentPosition}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, currentPosition: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>हालको पद (नेपाली)</Label>
                        <Input
                          value={candidateForm.politicalInfo.currentPosition_np}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, currentPosition_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>उम्मेदवारीको तह *</Label>
                        <Select
                          value={candidateForm.politicalInfo.candidacyLevel}
                          onValueChange={(value) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, candidacyLevel: value}})}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Federal">संघीय</SelectItem>
                            <SelectItem value="Provincial">प्रदेश</SelectItem>
                            <SelectItem value="Local">स्थानीय</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>निर्वाचन क्षेत्र नम्बर</Label>
                        <Input
                          value={candidateForm.politicalInfo.constituencyNumber}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, constituencyNumber: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>निर्वाचन क्षेत्र (English) *</Label>
                        <Input
                          value={candidateForm.politicalInfo.constituency}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, constituency: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>निर्वाचन क्षेत्र (नेपाली) *</Label>
                        <Input
                          value={candidateForm.politicalInfo.constituency_np}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, constituency_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>चुनाव चिन्ह</Label>
                        <Input
                          value={candidateForm.politicalInfo.electionSymbol}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, electionSymbol: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>चुनाव चिन्ह (नेपाली)</Label>
                        <Input
                          value={candidateForm.politicalInfo.electionSymbol_np}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, electionSymbol_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>नयाँ चुनाव चिन्ह फोटो</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCandidateForm({...candidateForm, electionSymbolImageFile: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={candidateForm.politicalInfo.isFirstTimeCandidate}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, isFirstTimeCandidate: e.target.checked}})}
                        />
                        <Label>पहिलो पटक उम्मेदवार?</Label>
                      </div>
                      <div className="md:col-span-2">
                        <Label>पहिलेको निर्वाचन इतिहास</Label>
                        <Textarea
                          value={candidateForm.politicalInfo.previousElectionHistory}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalInfo: {...candidateForm.politicalInfo, previousElectionHistory: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Education */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">३. शैक्षिक योग्यता</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>उच्चतम शैक्षिक योग्यता</Label>
                        <Input
                          value={candidateForm.education.highestQualification}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, highestQualification: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>उच्चतम शैक्षिक योग्यता (नेपाली)</Label>
                        <Input
                          value={candidateForm.education.highestQualification_np}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, highestQualification_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>विषय</Label>
                        <Input
                          value={candidateForm.education.subject}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, subject: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>विषय (नेपाली)</Label>
                        <Input
                          value={candidateForm.education.subject_np}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, subject_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>शिक्षण संस्था</Label>
                        <Input
                          value={candidateForm.education.institution}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, institution: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>शिक्षण संस्था (नेपाली)</Label>
                        <Input
                          value={candidateForm.education.institution_np}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, institution_np: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>देश</Label>
                        <Input
                          value={candidateForm.education.country}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, country: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>देश (नेपाली)</Label>
                        <Input
                          value={candidateForm.education.country_np}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, country_np: e.target.value}})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>थप तालिम</Label>
                        <Textarea
                          value={candidateForm.education.additionalTraining}
                          onChange={(e) => setCandidateForm({...candidateForm, education: {...candidateForm.education, additionalTraining: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Professional Experience */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">४. पेशागत अनुभव</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>हालको पेशा</Label>
                        <Input
                          value={candidateForm.professionalExperience.currentProfession}
                          onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, currentProfession: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>हालको पेशा (नेपाली)</Label>
                        <Input
                          value={candidateForm.professionalExperience.currentProfession_np}
                          onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, currentProfession_np: e.target.value}})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>अघिल्लो अनुभव</Label>
                        <Textarea
                          value={candidateForm.professionalExperience.previousExperience}
                          onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, previousExperience: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>संस्था जिम्मेवारी</Label>
                        <Textarea
                          value={candidateForm.professionalExperience.organizationResponsibility}
                          onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, organizationResponsibility: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>नेतृत्व अनुभव</Label>
                        <Textarea
                          value={candidateForm.professionalExperience.leadershipExperience}
                          onChange={(e) => setCandidateForm({...candidateForm, professionalExperience: {...candidateForm.professionalExperience, leadershipExperience: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Political Experience */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">५. राजनीतिक अनुभव</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>पार्टी प्रवेश वर्ष</Label>
                        <Input
                          value={candidateForm.politicalExperience.partyJoinYear}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, partyJoinYear: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>आन्दोलनमा भूमिका</Label>
                        <Input
                          value={candidateForm.politicalExperience.movementRole}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, movementRole: e.target.value}})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>अघिल्लो जनप्रतिनिधि पद</Label>
                        <Textarea
                          value={candidateForm.politicalExperience.previousRepresentativePosition}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, previousRepresentativePosition: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>प्रमुख उपलब्धिहरू</Label>
                        <Textarea
                          value={candidateForm.politicalExperience.majorAchievements}
                          onChange={(e) => setCandidateForm({...candidateForm, politicalExperience: {...candidateForm.politicalExperience, majorAchievements: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Social Engagement */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">६. सामाजिक संलग्नता</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>गैरसरकारी संस्था संलग्नता</Label>
                        <Textarea
                          value={candidateForm.socialEngagement.ngoInvolvement}
                          onChange={(e) => setCandidateForm({...candidateForm, socialEngagement: {...candidateForm.socialEngagement, ngoInvolvement: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>क्षेत्रगत कार्य</Label>
                        <Textarea
                          value={candidateForm.socialEngagement.sectorWork}
                          onChange={(e) => setCandidateForm({...candidateForm, socialEngagement: {...candidateForm.socialEngagement, sectorWork: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>पुरस्कार / सम्मान</Label>
                        <Textarea
                          value={candidateForm.socialEngagement.awardsHonors}
                          onChange={(e) => setCandidateForm({...candidateForm, socialEngagement: {...candidateForm.socialEngagement, awardsHonors: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Financial Information */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">७. आर्थिक विवरण</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>चल सम्पत्ति</Label>
                        <Textarea
                          value={candidateForm.financialInfo.movableAssets}
                          onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, movableAssets: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>अचल सम्पत्ति</Label>
                        <Textarea
                          value={candidateForm.financialInfo.immovableAssets}
                          onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, immovableAssets: e.target.value}})}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>वार्षिक आय स्रोत</Label>
                        <Input
                          value={candidateForm.financialInfo.annualIncomeSource}
                          onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, annualIncomeSource: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>बैंक ऋण</Label>
                        <Input
                          value={candidateForm.financialInfo.bankLoans}
                          onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, bankLoans: e.target.value}})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>कर चुक्ता स्थिति</Label>
                        <Input
                          value={candidateForm.financialInfo.taxStatus}
                          onChange={(e) => setCandidateForm({...candidateForm, financialInfo: {...candidateForm.financialInfo, taxStatus: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Legal Status */}
                  <div className="bg-gradient-to-r from-rose-50 to-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">८. कानुनी अवस्था</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={candidateForm.legalStatus.hasCriminalCase}
                          onChange={(e) => setCandidateForm({...candidateForm, legalStatus: {...candidateForm.legalStatus, hasCriminalCase: e.target.checked}})}
                        />
                        <Label>के कुनै फौजदारी मुद्दा छ?</Label>
                      </div>
                      {candidateForm.legalStatus.hasCriminalCase && (
                        <div>
                          <Label>मुद्दाको विवरण</Label>
                          <Textarea
                            value={candidateForm.legalStatus.caseDetails}
                            onChange={(e) => setCandidateForm({...candidateForm, legalStatus: {...candidateForm.legalStatus, caseDetails: e.target.value}})}
                            rows={2}
                          />
                        </div>
                      )}
                      <div>
                        <Label>योग्यता घोषणा</Label>
                        <Textarea
                          value={candidateForm.legalStatus.eligibilityDeclaration}
                          onChange={(e) => setCandidateForm({...candidateForm, legalStatus: {...candidateForm.legalStatus, eligibilityDeclaration: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 9: Vision & Goals */}
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">९. दृष्टि र लक्ष्य</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>दृष्टि (English)</Label>
                        <Textarea
                          value={candidateForm.visionGoals.vision}
                          onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, vision: e.target.value}})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>दृष्टि (नेपाली)</Label>
                        <Textarea
                          value={candidateForm.visionGoals.vision_np}
                          onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, vision_np: e.target.value}})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>लक्ष्यहरू (English)</Label>
                        <Textarea
                          value={candidateForm.visionGoals.goals}
                          onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, goals: e.target.value}})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>लक्ष्यहरू (नेपाली)</Label>
                        <Textarea
                          value={candidateForm.visionGoals.goals_np}
                          onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, goals_np: e.target.value}})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>घोषणा</Label>
                        <Textarea
                          value={candidateForm.visionGoals.declaration}
                          onChange={(e) => setCandidateForm({...candidateForm, visionGoals: {...candidateForm.visionGoals, declaration: e.target.value}})}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">सामाजिक सञ्जाल</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Facebook</Label>
                        <Input
                          value={candidateForm.socialMedia.facebook}
                          onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, facebook: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>Twitter/X</Label>
                        <Input
                          value={candidateForm.socialMedia.twitter}
                          onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, twitter: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input
                          value={candidateForm.socialMedia.instagram}
                          onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, instagram: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>YouTube</Label>
                        <Input
                          value={candidateForm.socialMedia.youtube}
                          onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, youtube: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>TikTok</Label>
                        <Input
                          value={candidateForm.socialMedia.tiktok}
                          onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, tiktok: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>LinkedIn</Label>
                        <Input
                          value={candidateForm.socialMedia.linkedin}
                          onChange={(e) => setCandidateForm({...candidateForm, socialMedia: {...candidateForm.socialMedia, linkedin: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campaign */}
                  <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">अभियान</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>चुनावी नारा (English)</Label>
                        <Input
                          value={candidateForm.campaign.campaignSlogan}
                          onChange={(e) => setCandidateForm({...candidateForm, campaign: {...candidateForm.campaign, campaignSlogan: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>चुनावी नारा (नेपाली)</Label>
                        <Input
                          value={candidateForm.campaign.campaignSlogan_np}
                          onChange={(e) => setCandidateForm({...candidateForm, campaign: {...candidateForm.campaign, campaignSlogan_np: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-isActive"
                        checked={candidateForm.isActive}
                        onChange={(e) => setCandidateForm({...candidateForm, isActive: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="edit-isActive">सक्रिय उम्मेदवार</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-isVerified"
                        checked={candidateForm.isVerified}
                        onChange={(e) => setCandidateForm({...candidateForm, isVerified: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="edit-isVerified">प्रमाणित उम्मेदवार</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCandidateEditDialogOpen(false);
                        setEditingCandidate(null);
                        resetCandidateForm();
                      }}
                    >
                      रद्द गर्नुहोस्
                    </Button>
                    <Button
                      onClick={handleUpdateCandidate}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      अपडेट गर्नुहोस्
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Candidates List */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                {isCandidatesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : candidatesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {candidatesError}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchCandidates}
                        className="ml-4"
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first candidate.</p>
                    <Button
                      onClick={() => setIsCandidateDialogOpen(true)}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      <Plus className="mr-2" size={16} />
                      Add Candidate
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => {
                      const c = candidate as any; // Type assertion for flexible access
                      const fullName = c.personalInfo?.fullName || c.fullName || 'N/A';
                      const fullName_np = c.personalInfo?.fullName_np || '';
                      const profilePhoto = c.profilePhoto || c.biography?.profilePhoto || '';
                      const constituency = c.politicalInfo?.constituency || c.personalInfo?.constituency || 'N/A';
                      const candidacyLevel = c.politicalInfo?.candidacyLevel || c.personalInfo?.position || 'N/A';
                      const partyName = c.politicalInfo?.partyName_np || 'नेकपा';
                      const vision = c.visionGoals?.vision || c.biography?.bio_en || '';
                      
                      return (
                      <Card key={candidate._id} className="border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16 border-2 border-red-200">
                                <AvatarImage src={profilePhoto} alt={fullName} />
                                <AvatarFallback className="bg-red-100 text-red-700">
                                  {fullName.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {candidate.isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                              {candidate.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {fullName_np || fullName}
                              </h3>
                              <p className="text-sm text-gray-500">{fullName}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                  {candidacyLevel}
                                </Badge>
                                {candidate.isVerified && (
                                  <Badge className="bg-blue-100 text-blue-800">प्रमाणित</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {constituency}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-red-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">पार्टी</p>
                              <p className="text-sm font-semibold text-red-700 truncate">
                                {partyName}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">स्थिति</p>
                              <p className="text-sm font-semibold text-green-700">
                                {candidate.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                              </p>
                            </div>
                          </div>

                          {vision && (
                            <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                              {vision}
                            </p>
                          )}

                          <div className="flex space-x-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCandidate(candidate)}
                              className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              सम्पादन
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCandidate(candidate._id)}
                              className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              मेटाउनुहोस्
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Image className="mr-2 text-green-600" size={24} />
                  Media Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Upload size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Media Files</h3>
                  <p className="text-gray-600 mb-6">
                    Drag and drop images here or click to browse
                  </p>
                  <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                    <Upload className="mr-2" size={16} />
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="mr-2 text-purple-600" size={24} />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600 mb-6">
                    Detailed insights and performance metrics
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <h4 className="font-semibold text-blue-900">Page Views</h4>
                      <p className="text-2xl font-bold text-blue-700">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <h4 className="font-semibold text-green-900">Published Posts</h4>
                      <p className="text-2xl font-bold text-green-700">{stats.publishedPosts || stats.totalPosts}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <h4 className="font-semibold text-purple-900">Draft Posts</h4>
                      <p className="text-2xl font-bold text-purple-700">{stats.draftPosts || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditDialogOpen && editingPost && (
          <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Edit Post
                </DialogTitle>
              </DialogHeader>
              <CreatePostForm 
                onSubmit={handleEditPost}
                onCancel={handleCloseEditDialog}
                initialData={editingPost}
                isEdit={true}
              />
            </DialogContent>
          </Dialog>
        )}

        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Member Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedMember.documents?.photo?.path && (
                  <div className="flex justify-center">
                    <img
                      src={selectedMember.documents.photo.path}
                      alt={selectedMember.generalInfo.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/128/128';
                      }}
                    />
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm">{selectedMember.generalInfo.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-sm">{selectedMember.generalInfo.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{selectedMember.generalInfo.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{selectedMember.generalInfo.contactNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-sm">{new Date(selectedMember.generalInfo.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Citizenship ID</label>
                      <p className="text-sm">{selectedMember.generalInfo.citizenshipId}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Permanent Address</label>
                      <p className="text-sm">
                        Ward {selectedMember.generalInfo.permanentAddress.wardNo}, {selectedMember.generalInfo.permanentAddress.palika}, {selectedMember.generalInfo.permanentAddress.district}, {selectedMember.generalInfo.permanentAddress.province}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Current Address</label>
                      <p className="text-sm">{selectedMember.generalInfo.currentAddress}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Professional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Organization</label>
                      <p className="text-sm">{selectedMember.professionalDetails.organizationName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Designation</label>
                      <p className="text-sm">{selectedMember.professionalDetails.designation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Organization Type</label>
                      <p className="text-sm">{selectedMember.professionalDetails.organizationType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <p className="text-sm">{selectedMember.professionalDetails.workExperience} years</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Area of Expertise</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMember.professionalDetails.areaOfExpertise.map((expertise, index) => (
                          <Badge key={index} variant="secondary">{expertise}</Badge>
                        ))}
                      </div>
                    </div>
                    {selectedMember.professionalDetails.otherExpertise && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Other Expertise</label>
                        <p className="text-sm">{selectedMember.professionalDetails.otherExpertise}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Membership Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Membership Level</label>
                      <p className="text-sm">{selectedMember.membershipDetails.membershipLevel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Membership Type</label>
                      <p className="text-sm">{selectedMember.membershipDetails.membershipType}</p>
                    </div>
                    {selectedMember.membershipDetails.provincePalikaName && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Province/Palika</label>
                        <p className="text-sm">{selectedMember.membershipDetails.provincePalikaName}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Preferred Working Domain</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMember.membershipDetails.preferredWorkingDomain.map((domain, index) => (
                          <Badge key={index} variant="outline">{domain}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Motivation</label>
                      <p className="text-sm mt-1">{selectedMember.membershipDetails.motivation}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Endorsement</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Province Coordinator</label>
                      <p className="text-sm">{selectedMember.endorsement.provinceCoordinator.name}</p>
                      <p className="text-xs text-gray-400">{selectedMember.endorsement.provinceCoordinator.contactNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Executive Member</label>
                      <p className="text-sm">{selectedMember.endorsement.executiveMember.name}</p>
                      <p className="text-xs text-gray-400">{selectedMember.endorsement.executiveMember.contactNumber}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Submitted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedMember.documents?.citizenshipCopy?.path && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-2">Citizenship Copy</label>
                          <a
                            href={selectedMember.documents.citizenshipCopy.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={selectedMember.documents.citizenshipCopy.path}
                              alt="Citizenship"
                              className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/400/200';
                              }}
                            />
                          </a>
                        </div>
                      )}
                      {selectedMember.documents?.recommendationLetter?.path && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-2">Recommendation Letter</label>
                          <a
                            href={selectedMember.documents.recommendationLetter.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={selectedMember.documents.recommendationLetter.path}
                              alt="Recommendation"
                              className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/400/200';
                              }}
                            />
                          </a>
                        </div>
                      )}
                      {selectedMember.documents?.resume?.path && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500 block mb-2">Resume/CV</label>
                          <a
                            href={selectedMember.documents.resume.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={selectedMember.documents.resume.path}
                              alt="Resume"
                              className="w-full h-60 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/600/300';
                              }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Declaration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedMember.declaration.agreed ? "default" : "secondary"}>
                        {selectedMember.declaration.agreed ? "Agreed" : "Not Agreed"}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Signature</label>
                      <p className="text-sm">{selectedMember.declaration.signature}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p className="text-sm">{new Date(selectedMember.declaration.date).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMember(null)}
                  >
                    Close
                  </Button>
                  {selectedMember.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleUpdateMemberStatus(selectedMember._id, 'approved');
                          setSelectedMember(null);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="mr-2" size={14} />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleUpdateMemberStatus(selectedMember._id, 'rejected');
                          setSelectedMember(null);
                        }}
                      >
                        <UserX className="mr-2" size={14} />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;