import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit, Trash2, Eye, Users, FileText, TrendingUp, Calendar, 
  Image, Upload, Settings, Loader2, AlertCircle, RefreshCw, 
  UserCheck, UserX, Download, Filter, Search 
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
import API, { CreatePostData, Post, UpdatePostData, User, Member, MembersQuery, StatsResponse, Candidate, CreateCandidateData, UpdateCandidateData } from '@/lib/api';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState<boolean>(false);
  const [isCandidateEditDialogOpen, setIsCandidateEditDialogOpen] = useState<boolean>(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    position: 'Parliamentary',
    constituency: '',
    dateOfBirth: '',
    gender: 'Male',
    contactNumber: '',
    email: '',
    address: '',
    bio_en: '',
    backgroundEducation: '',
    experience: '',
    manifestoTitle: '',
    manifestoContent: '',
    manifestoBrochure: '',
    manifestoBrochureFile: null as File | null,
    profilePhoto: '',
    profilePhotoFile: null as File | null,
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    website: '',
    achievements: [] as Array<{
      achievementTitle_en: string;
      achievementDescription_en: string;
      achievementDate: string;
      achievementCategory: string;
    }>,
    isActive: true
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPostsLoading, setIsPostsLoading] = useState<boolean>(false);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [isMembersLoading, setIsMembersLoading] = useState<boolean>(false);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

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
        fetchCandidates()
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
        fetchCandidates()
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
      
      // Personal Info
      formData.append('personalInfo[fullName]', candidateForm.fullName);
      formData.append('personalInfo[position]', candidateForm.position);
      formData.append('personalInfo[constituency]', candidateForm.constituency);
      formData.append('personalInfo[dateOfBirth]', candidateForm.dateOfBirth);
      formData.append('personalInfo[gender]', candidateForm.gender);
      formData.append('personalInfo[contactNumber]', candidateForm.contactNumber);
      formData.append('personalInfo[email]', candidateForm.email);
      formData.append('personalInfo[address]', candidateForm.address);
      
      // Biography
      formData.append('biography[bio_en]', candidateForm.bio_en);
      formData.append('biography[backgroundEducation]', candidateForm.backgroundEducation);
      formData.append('biography[experience]', candidateForm.experience);
      if (candidateForm.profilePhotoFile) {
        formData.append('profilePhoto', candidateForm.profilePhotoFile);
      } else if (candidateForm.profilePhoto) {
        formData.append('biography[profilePhoto]', candidateForm.profilePhoto);
      }
      
      // Manifesto
      formData.append('manifesto[title_en]', candidateForm.manifestoTitle);
      formData.append('manifesto[content_en]', candidateForm.manifestoContent);
      if (candidateForm.manifestoBrochureFile) {
        formData.append('manifestoBrochure', candidateForm.manifestoBrochureFile);
      } else if (candidateForm.manifestoBrochure) {
        formData.append('manifesto[manifestoBrochure]', candidateForm.manifestoBrochure);
      }
      
      // Social Media
      formData.append('socialMedia[facebook]', candidateForm.facebook);
      formData.append('socialMedia[twitter]', candidateForm.twitter);
      formData.append('socialMedia[instagram]', candidateForm.instagram);
      formData.append('socialMedia[youtube]', candidateForm.youtube);
      formData.append('socialMedia[website]', candidateForm.website);
      
      // Achievements
      candidateForm.achievements.forEach((achievement, index) => {
        formData.append(`achievements[${index}][achievementTitle_en]`, achievement.achievementTitle_en);
        formData.append(`achievements[${index}][achievementDescription_en]`, achievement.achievementDescription_en);
        formData.append(`achievements[${index}][achievementDate]`, achievement.achievementDate);
        formData.append(`achievements[${index}][achievementCategory]`, achievement.achievementCategory);
      });
      
      formData.append('isActive', String(candidateForm.isActive));

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
      
      // Personal Info
      formData.append('personalInfo[fullName]', candidateForm.fullName);
      formData.append('personalInfo[position]', candidateForm.position);
      formData.append('personalInfo[constituency]', candidateForm.constituency);
      formData.append('personalInfo[dateOfBirth]', candidateForm.dateOfBirth);
      formData.append('personalInfo[gender]', candidateForm.gender);
      formData.append('personalInfo[contactNumber]', candidateForm.contactNumber);
      formData.append('personalInfo[email]', candidateForm.email);
      formData.append('personalInfo[address]', candidateForm.address);
      
      // Biography
      formData.append('biography[bio_en]', candidateForm.bio_en);
      formData.append('biography[backgroundEducation]', candidateForm.backgroundEducation);
      formData.append('biography[experience]', candidateForm.experience);
      if (candidateForm.profilePhotoFile) {
        formData.append('profilePhoto', candidateForm.profilePhotoFile);
      } else if (candidateForm.profilePhoto) {
        formData.append('biography[profilePhoto]', candidateForm.profilePhoto);
      }
      
      // Manifesto
      formData.append('manifesto[title_en]', candidateForm.manifestoTitle);
      formData.append('manifesto[content_en]', candidateForm.manifestoContent);
      if (candidateForm.manifestoBrochureFile) {
        formData.append('manifestoBrochure', candidateForm.manifestoBrochureFile);
      } else if (candidateForm.manifestoBrochure) {
        formData.append('manifesto[manifestoBrochure]', candidateForm.manifestoBrochure);
      }
      
      // Social Media
      formData.append('socialMedia[facebook]', candidateForm.facebook);
      formData.append('socialMedia[twitter]', candidateForm.twitter);
      formData.append('socialMedia[instagram]', candidateForm.instagram);
      formData.append('socialMedia[youtube]', candidateForm.youtube);
      formData.append('socialMedia[website]', candidateForm.website);
      
      // Achievements
      candidateForm.achievements.forEach((achievement, index) => {
        formData.append(`achievements[${index}][achievementTitle_en]`, achievement.achievementTitle_en);
        formData.append(`achievements[${index}][achievementDescription_en]`, achievement.achievementDescription_en);
        formData.append(`achievements[${index}][achievementDate]`, achievement.achievementDate);
        formData.append(`achievements[${index}][achievementCategory]`, achievement.achievementCategory);
      });
      
      formData.append('isActive', String(candidateForm.isActive));

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
    setCandidateForm({
      fullName: candidate.personalInfo.fullName,
      position: candidate.personalInfo.position,
      constituency: candidate.personalInfo.constituency,
      dateOfBirth: candidate.personalInfo.dateOfBirth.split('T')[0],
      gender: candidate.personalInfo.gender,
      contactNumber: candidate.personalInfo.contactNumber,
      email: candidate.personalInfo.email,
      address: candidate.personalInfo.address || '',
      bio_en: candidate.biography.bio_en || '',
      backgroundEducation: candidate.biography.backgroundEducation || '',
      experience: candidate.biography.experience || '',
      manifestoTitle: candidate.manifesto.title_en || '',
      manifestoContent: candidate.manifesto.content_en || '',
      manifestoBrochure: candidate.manifesto.manifestoBrochure || '',
      manifestoBrochureFile: null,
      profilePhoto: candidate.biography.profilePhoto || '',
      profilePhotoFile: null,
      facebook: candidate.socialMedia?.facebook || '',
      twitter: candidate.socialMedia?.twitter || '',
      instagram: candidate.socialMedia?.instagram || '',
      youtube: candidate.socialMedia?.youtube || '',
      website: candidate.socialMedia?.website || '',
      achievements: candidate.achievements?.map(a => ({
        achievementTitle_en: a.achievementTitle_en || '',
        achievementDescription_en: a.achievementDescription_en || '',
        achievementDate: a.achievementDate ? new Date(a.achievementDate).toISOString().split('T')[0] : '',
        achievementCategory: a.achievementCategory || 'Other'
      })) || [],
      isActive: candidate.isActive
    });
    setIsCandidateEditDialogOpen(true);
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      fullName: '',
      position: 'Parliamentary',
      constituency: '',
      dateOfBirth: '',
      gender: 'Male',
      contactNumber: '',
      email: '',
      address: '',
      bio_en: '',
      backgroundEducation: '',
      experience: '',
      manifestoTitle: '',
      manifestoContent: '',
      manifestoBrochure: '',
      manifestoBrochureFile: null,
      profilePhoto: '',
      profilePhotoFile: null,
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      website: '',
      achievements: [],
      isActive: true
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
          <TabsList className="grid w-full grid-cols-5 lg:w-[750px] bg-white shadow-lg border-0">
            <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Posts ({totalPosts})
            </TabsTrigger>
            <TabsTrigger value="candidates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
              Candidates ({candidates.length})
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              Members ({membersTotal})
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Media Library
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
              <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                    <Plus className="mr-2" size={18} />
                    Add New Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Add New Candidate
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={candidateForm.fullName}
                            onChange={(e) => setCandidateForm({...candidateForm, fullName: e.target.value})}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Position *</Label>
                          <Select
                            value={candidateForm.position}
                            onValueChange={(value) => setCandidateForm({...candidateForm, position: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Parliamentary">Parliamentary</SelectItem>
                              <SelectItem value="Provincial">Provincial</SelectItem>
                              <SelectItem value="Local">Local</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="constituency">Constituency *</Label>
                          <Input
                            id="constituency"
                            value={candidateForm.constituency}
                            onChange={(e) => setCandidateForm({...candidateForm, constituency: e.target.value})}
                            placeholder="e.g., Kathmandu-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={candidateForm.dateOfBirth}
                            onChange={(e) => setCandidateForm({...candidateForm, dateOfBirth: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={candidateForm.gender}
                            onValueChange={(value) => setCandidateForm({...candidateForm, gender: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contactNumber">Contact Number</Label>
                          <Input
                            id="contactNumber"
                            value={candidateForm.contactNumber}
                            onChange={(e) => setCandidateForm({...candidateForm, contactNumber: e.target.value})}
                            placeholder="+977-9801234567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={candidateForm.email}
                            onChange={(e) => setCandidateForm({...candidateForm, email: e.target.value})}
                            placeholder="candidate@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profilePhoto">Profile Photo URL</Label>
                          <Input
                            id="profilePhoto"
                            value={candidateForm.profilePhoto}
                            onChange={(e) => setCandidateForm({...candidateForm, profilePhoto: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={candidateForm.address}
                            onChange={(e) => setCandidateForm({...candidateForm, address: e.target.value})}
                            placeholder="Complete address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Biography</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bio_en">Biography</Label>
                          <Textarea
                            id="bio_en"
                            value={candidateForm.bio_en}
                            onChange={(e) => setCandidateForm({...candidateForm, bio_en: e.target.value})}
                            placeholder="Write a brief biography..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="backgroundEducation">Education Background</Label>
                          <Textarea
                            id="backgroundEducation"
                            value={candidateForm.backgroundEducation}
                            onChange={(e) => setCandidateForm({...candidateForm, backgroundEducation: e.target.value})}
                            placeholder="Educational qualifications..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="experience">Experience</Label>
                          <Textarea
                            id="experience"
                            value={candidateForm.experience}
                            onChange={(e) => setCandidateForm({...candidateForm, experience: e.target.value})}
                            placeholder="Political and professional experience..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Manifesto */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Manifesto</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="manifestoTitle">Manifesto Title</Label>
                          <Input
                            id="manifestoTitle"
                            value={candidateForm.manifestoTitle}
                            onChange={(e) => setCandidateForm({...candidateForm, manifestoTitle: e.target.value})}
                            placeholder="Main manifesto title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="manifestoContent">Manifesto Content</Label>
                          <Textarea
                            id="manifestoContent"
                            value={candidateForm.manifestoContent}
                            onChange={(e) => setCandidateForm({...candidateForm, manifestoContent: e.target.value})}
                            placeholder="Detailed manifesto content..."
                            rows={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="manifestoBrochureFile">Upload Manifesto PDF/Brochure</Label>
                          <Input
                            id="manifestoBrochureFile"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setCandidateForm({...candidateForm, manifestoBrochureFile: file});
                            }}
                            className="cursor-pointer"
                          />
                          {candidateForm.manifestoBrochure && (
                            <p className="text-sm text-gray-600 mt-1">Current: {candidateForm.manifestoBrochure}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="manifestoBrochure">Or provide URL</Label>
                          <Input
                            id="manifestoBrochure"
                            value={candidateForm.manifestoBrochure}
                            onChange={(e) => setCandidateForm({...candidateForm, manifestoBrochure: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Social Media & Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={candidateForm.facebook}
                            onChange={(e) => setCandidateForm({...candidateForm, facebook: e.target.value})}
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="twitter">Twitter/X</Label>
                          <Input
                            id="twitter"
                            value={candidateForm.twitter}
                            onChange={(e) => setCandidateForm({...candidateForm, twitter: e.target.value})}
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            value={candidateForm.instagram}
                            onChange={(e) => setCandidateForm({...candidateForm, instagram: e.target.value})}
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="youtube">YouTube</Label>
                          <Input
                            id="youtube"
                            value={candidateForm.youtube}
                            onChange={(e) => setCandidateForm({...candidateForm, youtube: e.target.value})}
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={candidateForm.website}
                            onChange={(e) => setCandidateForm({...candidateForm, website: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setCandidateForm({
                              ...candidateForm,
                              achievements: [...candidateForm.achievements, {
                                achievementTitle_en: '',
                                achievementDescription_en: '',
                                achievementDate: '',
                                achievementCategory: 'Other'
                              }]
                            });
                          }}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Achievement
                        </Button>
                      </div>
                      {candidateForm.achievements.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No achievements added yet. Click "Add Achievement" to start.</p>
                      ) : (
                        <div className="space-y-4">
                          {candidateForm.achievements.map((achievement, index) => (
                            <div key={index} className="border border-orange-200 rounded-lg p-4 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-700">Achievement #{index + 1}</h4>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setCandidateForm({
                                      ...candidateForm,
                                      achievements: candidateForm.achievements.filter((_, i) => i !== index)
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label>Title *</Label>
                                  <Input
                                    value={achievement.achievementTitle_en}
                                    onChange={(e) => {
                                      const updated = [...candidateForm.achievements];
                                      updated[index].achievementTitle_en = e.target.value;
                                      setCandidateForm({...candidateForm, achievements: updated});
                                    }}
                                    placeholder="Achievement title"
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={achievement.achievementDescription_en}
                                    onChange={(e) => {
                                      const updated = [...candidateForm.achievements];
                                      updated[index].achievementDescription_en = e.target.value;
                                      setCandidateForm({...candidateForm, achievements: updated});
                                    }}
                                    placeholder="Describe the achievement..."
                                    rows={2}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>Date</Label>
                                    <Input
                                      type="date"
                                      value={achievement.achievementDate}
                                      onChange={(e) => {
                                        const updated = [...candidateForm.achievements];
                                        updated[index].achievementDate = e.target.value;
                                        setCandidateForm({...candidateForm, achievements: updated});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label>Category</Label>
                                    <Select
                                      value={achievement.achievementCategory}
                                      onValueChange={(value) => {
                                        const updated = [...candidateForm.achievements];
                                        updated[index].achievementCategory = value;
                                        setCandidateForm({...candidateForm, achievements: updated});
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
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
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={candidateForm.isActive}
                        onChange={(e) => setCandidateForm({...candidateForm, isActive: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isActive">Active Candidate</Label>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCandidateDialogOpen(false);
                          resetCandidateForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCandidate}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                      >
                        Create Candidate
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isCandidateEditDialogOpen} onOpenChange={setIsCandidateEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Edit Candidate
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Same form as create */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-fullName">Full Name *</Label>
                        <Input
                          id="edit-fullName"
                          value={candidateForm.fullName}
                          onChange={(e) => setCandidateForm({...candidateForm, fullName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-position">Position *</Label>
                        <Select
                          value={candidateForm.position}
                          onValueChange={(value) => setCandidateForm({...candidateForm, position: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Parliamentary">Parliamentary</SelectItem>
                            <SelectItem value="Provincial">Provincial</SelectItem>
                            <SelectItem value="Local">Local</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-constituency">Constituency *</Label>
                        <Input
                          id="edit-constituency"
                          value={candidateForm.constituency}
                          onChange={(e) => setCandidateForm({...candidateForm, constituency: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="edit-dateOfBirth"
                          type="date"
                          value={candidateForm.dateOfBirth}
                          onChange={(e) => setCandidateForm({...candidateForm, dateOfBirth: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-gender">Gender</Label>
                        <Select
                          value={candidateForm.gender}
                          onValueChange={(value) => setCandidateForm({...candidateForm, gender: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-contactNumber">Contact Number</Label>
                        <Input
                          id="edit-contactNumber"
                          value={candidateForm.contactNumber}
                          onChange={(e) => setCandidateForm({...candidateForm, contactNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={candidateForm.email}
                          onChange={(e) => setCandidateForm({...candidateForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-profilePhoto">Profile Photo URL</Label>
                        <Input
                          id="edit-profilePhoto"
                          value={candidateForm.profilePhoto}
                          onChange={(e) => setCandidateForm({...candidateForm, profilePhoto: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-address">Address</Label>
                        <Input
                          id="edit-address"
                          value={candidateForm.address}
                          onChange={(e) => setCandidateForm({...candidateForm, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Biography</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-bio_en">Biography</Label>
                        <Textarea
                          id="edit-bio_en"
                          value={candidateForm.bio_en}
                          onChange={(e) => setCandidateForm({...candidateForm, bio_en: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-backgroundEducation">Education Background</Label>
                        <Textarea
                          id="edit-backgroundEducation"
                          value={candidateForm.backgroundEducation}
                          onChange={(e) => setCandidateForm({...candidateForm, backgroundEducation: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-experience">Experience</Label>
                        <Textarea
                          id="edit-experience"
                          value={candidateForm.experience}
                          onChange={(e) => setCandidateForm({...candidateForm, experience: e.target.value})}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Manifesto</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-manifestoTitle">Manifesto Title</Label>
                        <Input
                          id="edit-manifestoTitle"
                          value={candidateForm.manifestoTitle}
                          onChange={(e) => setCandidateForm({...candidateForm, manifestoTitle: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-manifestoContent">Manifesto Content</Label>
                        <Textarea
                          id="edit-manifestoContent"
                          value={candidateForm.manifestoContent}
                          onChange={(e) => setCandidateForm({...candidateForm, manifestoContent: e.target.value})}
                          rows={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-manifestoBrochureFile">Upload Manifesto PDF/Brochure</Label>
                        <Input
                          id="edit-manifestoBrochureFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setCandidateForm({...candidateForm, manifestoBrochureFile: file});
                          }}
                          className="cursor-pointer"
                        />
                        {candidateForm.manifestoBrochure && (
                          <p className="text-sm text-gray-600 mt-1">Current: {candidateForm.manifestoBrochure}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="edit-manifestoBrochure">Or provide URL</Label>
                        <Input
                          id="edit-manifestoBrochure"
                          value={candidateForm.manifestoBrochure}
                          onChange={(e) => setCandidateForm({...candidateForm, manifestoBrochure: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Social Media & Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-facebook">Facebook</Label>
                        <Input
                          id="edit-facebook"
                          value={candidateForm.facebook}
                          onChange={(e) => setCandidateForm({...candidateForm, facebook: e.target.value})}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-twitter">Twitter/X</Label>
                        <Input
                          id="edit-twitter"
                          value={candidateForm.twitter}
                          onChange={(e) => setCandidateForm({...candidateForm, twitter: e.target.value})}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-instagram">Instagram</Label>
                        <Input
                          id="edit-instagram"
                          value={candidateForm.instagram}
                          onChange={(e) => setCandidateForm({...candidateForm, instagram: e.target.value})}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-youtube">YouTube</Label>
                        <Input
                          id="edit-youtube"
                          value={candidateForm.youtube}
                          onChange={(e) => setCandidateForm({...candidateForm, youtube: e.target.value})}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-website">Website</Label>
                        <Input
                          id="edit-website"
                          value={candidateForm.website}
                          onChange={(e) => setCandidateForm({...candidateForm, website: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setCandidateForm({
                            ...candidateForm,
                            achievements: [...candidateForm.achievements, {
                              achievementTitle_en: '',
                              achievementDescription_en: '',
                              achievementDate: '',
                              achievementCategory: 'Other'
                            }]
                          });
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Achievement
                      </Button>
                    </div>
                    {candidateForm.achievements.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No achievements added yet. Click "Add Achievement" to start.</p>
                    ) : (
                      <div className="space-y-4">
                        {candidateForm.achievements.map((achievement, index) => (
                          <div key={index} className="border border-orange-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-700">Achievement #{index + 1}</h4>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setCandidateForm({
                                    ...candidateForm,
                                    achievements: candidateForm.achievements.filter((_, i) => i !== index)
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label>Title *</Label>
                                <Input
                                  value={achievement.achievementTitle_en}
                                  onChange={(e) => {
                                    const updated = [...candidateForm.achievements];
                                    updated[index].achievementTitle_en = e.target.value;
                                    setCandidateForm({...candidateForm, achievements: updated});
                                  }}
                                  placeholder="Achievement title"
                                />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={achievement.achievementDescription_en}
                                  onChange={(e) => {
                                    const updated = [...candidateForm.achievements];
                                    updated[index].achievementDescription_en = e.target.value;
                                    setCandidateForm({...candidateForm, achievements: updated});
                                  }}
                                  placeholder="Describe the achievement..."
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Date</Label>
                                  <Input
                                    type="date"
                                    value={achievement.achievementDate}
                                    onChange={(e) => {
                                      const updated = [...candidateForm.achievements];
                                      updated[index].achievementDate = e.target.value;
                                      setCandidateForm({...candidateForm, achievements: updated});
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <Select
                                    value={achievement.achievementCategory}
                                    onValueChange={(value) => {
                                      const updated = [...candidateForm.achievements];
                                      updated[index].achievementCategory = value;
                                      setCandidateForm({...candidateForm, achievements: updated});
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
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
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={candidateForm.isActive}
                      onChange={(e) => setCandidateForm({...candidateForm, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="edit-isActive">Active Candidate</Label>
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
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateCandidate}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      Update Candidate
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
                    {candidates.map((candidate) => (
                      <Card key={candidate._id} className="border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16 border-2 border-red-200">
                                <AvatarImage src={candidate.biography.profilePhoto} alt={candidate.personalInfo.fullName} />
                                <AvatarFallback className="bg-red-100 text-red-700">
                                  {candidate.personalInfo.fullName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {candidate.isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {candidate.personalInfo.fullName}
                              </h3>
                              <div className="mt-1">
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                  {candidate.personalInfo.position}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {candidate.personalInfo.constituency}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Issues</p>
                              <p className="text-lg font-bold text-blue-700">
                                {candidate.issues?.length || 0}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Achievements</p>
                              <p className="text-lg font-bold text-green-700">
                                {candidate.achievements?.length || 0}
                              </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Manifesto</p>
                              <p className="text-lg font-bold text-purple-700">
                                {candidate.manifesto?.title_en ? '✓' : '✗'}
                              </p>
                            </div>
                          </div>

                          {candidate.biography.bio_en && (
                            <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                              {candidate.biography.bio_en}
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
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCandidate(candidate._id)}
                              className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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