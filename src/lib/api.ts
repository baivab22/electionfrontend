// api.ts - Frontend API Service
import axios, { AxiosResponse, AxiosError } from 'axios';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'user';
}

export interface Post {
  id: string;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  excerpt_en?: string;
  excerpt_np?: string;
  category: 'technology' | 'digitalTransformation' | 'socialJustice' | 'events' | 'innovation' | 'policy' | 'education' | 'startups';
  image: string;
  author: User;
  tags: string[];
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
  comments: Comment[];
  publishedAt: string;
  updatedAt: string;
  content: string; // Added content field
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
}

// Member Types
export interface Member {
  _id: string;
  generalInfo: {
    fullName: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: string;
    citizenshipId: string;
    contactNumber: string;
    email: string;
    permanentAddress: {
      province: string;
      district: string;
      palika: string;
      wardNo: number;
    };
    currentAddress: string;
  };
  professionalDetails: {
    organizationName: string;
    designation: string;
    organizationType: 'Government' | 'Private' | 'NGO/INGO' | 'Academic' | 'Freelancer';
    workExperience: number;
    areaOfExpertise: string[];
    otherExpertise?: string;
  };
  membershipDetails: {
    membershipLevel: 'Provincial' | 'Local (Palika)' | 'Institutional' | 'Individual';
    provincePalikaName: string;
    membershipType: 'General' | 'Executive' | 'Advisory' | 'Lifetime';
    preferredWorkingDomain: string[];
    motivation: string;
  };
  endorsement: {
    provinceCoordinator: {
      name?: string;
      signature?: string;
      contactNumber?: string;
    };
    executiveMember: {
      name?: string;
      signature?: string;
      contactNumber?: string;
    };
  };
  documents: {
    citizenshipCopy?: {
      filename: string;
      path: string;
    };
    photo?: {
      filename: string;
      path: string;
    };
    recommendationLetter?: {
      filename: string;
      path: string;
    };
    resume?: {
      filename: string;
      path: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  declaration: {
    agreed: boolean;
    signature: string;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberData {
  generalInfo: Omit<Member['generalInfo'], 'dateOfBirth'> & { dateOfBirth: string };
  professionalDetails: Member['professionalDetails'];
  membershipDetails: Member['membershipDetails'];
  endorsement: Member['endorsement'];
  declaration: Member['declaration'];
}

export interface MembersResponse {
  success: boolean;
  data: Member[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMembers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MemberResponse {
  success: boolean;
  data: Member;
}

export interface StatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byMembershipLevel: Array<{ _id: string; count: number }>;
    byProvince: Array<{ _id: string; count: number }>;
  };
}

export interface MembersQuery {
  page?: number;
  limit?: number;
  status?: string;
  membershipLevel?: string;
  search?: string;
  province?: string;
}

export interface CreatePostData {
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  excerpt_en?: string;
  excerpt_np?: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface PostsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
  data: Post[];
}

export interface PostResponse {
  success: boolean;
  data: Post;
}

export interface PostsQuery {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
  language?: 'en' | 'np';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface Candidate {
  _id: string;
  personalInfo: {
    fullName: string;
    fullName_np?: string;
    position: 'President' | 'Vice President' | 'Parliamentary' | 'Local Body' | 'Other';
    position_np?: string;
    constituency: string;
    constituency_np?: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    contactNumber: string;
    email: string;
    address?: string;
  };
  biography: {
    bio_en?: string;
    bio_np?: string;
    backgroundEducation?: string;
    backgroundEducation_np?: string;
    experience?: string;
    experience_np?: string;
    profilePhoto?: string;
  };
  manifesto: {
    title_en?: string;
    title_np?: string;
    content_en?: string;
    content_np?: string;
    manifestoBrochure?: string;
  };
  issues: Array<{
    issueTitle_en?: string;
    issueTitle_np?: string;
    issueDescription_en?: string;
    issueDescription_np?: string;
    issueCategory?: string;
    priority?: number;
  }>;
  achievements: Array<{
    achievementTitle_en?: string;
    achievementTitle_np?: string;
    achievementDescription_en?: string;
    achievementDescription_np?: string;
    achievementDate?: string;
    achievementCategory?: string;
    achievementImage?: string;
  }>;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  campaign?: {
    campaignSlogan_en?: string;
    campaignSlogan_np?: string;
    votingTarget?: number;
  };
  isActive: boolean;
}

export type CreateCandidateData = Omit<Candidate, '_id' | 'issues' | 'achievements'> & {
  issues?: Candidate['issues'];
  achievements?: Candidate['achievements'];
};

export type UpdateCandidateData = Partial<CreateCandidateData>;

// Feedback Types
export interface FeedbackResponse {
  respondent: User;
  respondentName: string;
  respondentDepartment?: string;
  content: string;
  media: any[];
  createdAt: string;
  _id?: string;
}

export interface Feedback {
  _id: string;
  type: 'compliment' | 'complaint' | 'suggestion' | 'inquiry';
  category: 'service_quality' | 'staff_conduct' | 'response_time' | 'transparency' | 'accessibility' | 'other';
  subject: string;
  description: string;
  status: 'Received' | 'In Process' | 'Resolved' | 'Closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  anonymous: boolean;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  user?: User;
  assignedDepartment?: string;
  assignedTo?: User;
  assignedDate?: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  responses: FeedbackResponse[];
  media: any[];
  readBy: string[];
  likes: number;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackData {
  type: Feedback['type'];
  category: Feedback['category'];
  subject: string;
  description: string;
  anonymous: boolean;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  assignedDepartment?: string;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  status?: string;
  priority?: string;
  assignedDepartment?: string;
  q?: string;
  from?: string;
  to?: string;
  isPublic?: boolean;
}

export interface FeedbackStatsResponse {
  byType: Array<{ _id: string; count: number }>;
  byCategory: Array<{ _id: string; count: number }>;
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  total: Array<{ count: number }>;
  recentFeedback: Feedback[];
}

// Candidate Feedback Types
export interface CandidateFeedback {
  _id: string;
  candidate: string;
  user?: User;
  anonymous: boolean;
  email?: string;
  name?: string;
  phone?: string;
  type: 'support' | 'concern' | 'question' | 'suggestion';
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isPublic: boolean;
  likes: number;
  helpful: number;
  unhelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateFeedbackData {
  type: 'support' | 'concern' | 'question' | 'suggestion';
  rating: number;
  comment: string;
  anonymous: boolean;
  email?: string;
  name?: string;
  phone?: string;
}

export interface CandidateFeedbackResponse {
  page: number;
  limit: number;
  total: number;
  feedback: CandidateFeedback[];
  stats: {
    averageRating: number;
    totalFeedback: number;
    ratingDistribution: {
      [key: number]: number;
    };
  };
}

// API Configuration
// Use absolute URL for API calls
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'http://api.abhushangallery.com/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        // window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response: AxiosResponse<{ success: boolean; token: string; user: User }> = 
        await api.post('/auth/login', { email, password });
      return { user: response.data.user, token: response.data.token };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = 
        await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
      }
      throw handleApiError(error);
    }
  }
};

// Posts API
export const postsAPI = {
  getPosts: async (params: PostsQuery = {}): Promise<PostsResponse> => {
    try {
      const response: AxiosResponse<PostsResponse> = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getPost: async (id: string, language: 'en' | 'np' = 'en'): Promise<PostResponse> => {
    try {
      const response: AxiosResponse<PostResponse> = await api.get(`/posts/${id}`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createPost: async (postData: CreatePostData): Promise<PostResponse> => {
    try {
      const response: AxiosResponse<PostResponse> = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updatePost: async (id: string, postData: UpdatePostData): Promise<PostResponse> => {
    try {
      const response: AxiosResponse<PostResponse> = await api.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deletePost: async (id: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  likePost: async (id: string): Promise<{ success: boolean; message: string; likes: number }> => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; likes: number }> = 
        await api.put(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addComment: async (id: string, text: string): Promise<{ success: boolean; message: string; data: Comment }> => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: Comment }> = 
        await api.post(`/posts/${id}/comments`, { text });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFeaturedPosts: async (language: 'en' | 'np' = 'en'): Promise<PostsResponse> => {
    try {
      const response: AxiosResponse<PostsResponse> = await api.get('/posts', {
        params: { featured: true, language, limit: 6 }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getPostsByCategory: async (category: string, language: 'en' | 'np' = 'en'): Promise<PostsResponse> => {
    try {
      const response: AxiosResponse<PostsResponse> = await api.get('/posts', {
        params: { category, language }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  searchPosts: async (searchTerm: string, language: 'en' | 'np' = 'en'): Promise<PostsResponse> => {
    try {
      const response: AxiosResponse<PostsResponse> = await api.get('/posts', {
        params: { search: searchTerm, language }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Members API
export const membersAPI = {
  // Create new member application
  createMember: async (formData: FormData): Promise<MemberResponse> => {
    try {
      const response: AxiosResponse<MemberResponse> = await api.post('/members', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all members with pagination and filters
  getMembers: async (params: MembersQuery = {}): Promise<MembersResponse> => {
    try {
      const response: AxiosResponse<MembersResponse> = await api.get('/members', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get single member by ID
  getMember: async (id: string): Promise<MemberResponse> => {
    try {
      const response: AxiosResponse<MemberResponse> = await api.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update member status
  updateMemberStatus: async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<MemberResponse> => {
    try {
      const response: AxiosResponse<MemberResponse> = await api.put(`/members/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update member information
  updateMember: async (id: string, data: Partial<Member>): Promise<MemberResponse> => {
    try {
      const response: AxiosResponse<MemberResponse> = await api.put(`/members/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete member
  deleteMember: async (id: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get membership statistics
  getMembershipStats: async (): Promise<StatsResponse> => {
    try {
      const response: AxiosResponse<StatsResponse> = await api.get('/members/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Candidates API
export const candidatesAPI = {
  getCandidates: async (): Promise<{ success: boolean; count: number; data: Candidate[] }> => {
    try {
      const response: AxiosResponse<{ success: boolean; count: number; data: Candidate[] }> = await api.get('/candidates');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCandidate: async (id: string): Promise<{ success: boolean; data: Candidate }> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: Candidate }> = await api.get(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createCandidate: async (data: CreateCandidateData | FormData): Promise<{ success: boolean; data: Candidate }> => {
    try {
      const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const response: AxiosResponse<{ success: boolean; data: Candidate }> = await api.post('/candidates', data, { headers });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateCandidate: async (id: string, data: UpdateCandidateData | FormData): Promise<{ success: boolean; data: Candidate }> => {
    try {
      const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const response: AxiosResponse<{ success: boolean; data: Candidate }> = await api.put(`/candidates/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteCandidate: async (id: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Social engagement endpoints
  likeCandidate: async (id: string): Promise<{ success: boolean; data: { likes: number; isLiked: boolean } }> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: { likes: number; isLiked: boolean } }> = 
        await api.post(`/candidates/${id}/like`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addComment: async (id: string, data: { name: string; email?: string; comment: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = 
        await api.post(`/candidates/${id}/comment`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getComments: async (id: string): Promise<{ success: boolean; count: number; data: any[] }> => {
    try {
      const response: AxiosResponse<{ success: boolean; count: number; data: any[] }> = 
        await api.get(`/candidates/${id}/comments`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  shareCandidate: async (id: string): Promise<{ success: boolean; data: { shares: number } }> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: { shares: number } }> = 
        await api.post(`/candidates/${id}/share`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Stats API (for admin dashboard)
export const statsAPI = {
  getStats: async (): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await api.get('/posts/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAnalytics: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    try {
      const response = await api.get(`/admin/analytics`, { params: { period } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Media API
export const mediaAPI = {
  uploadImage: async (file: File): Promise<{ success: boolean; data: { url: string } }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response: AxiosResponse<{ success: boolean; data: { url: string } }> = 
        await api.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getMediaFiles: async (): Promise<{ success: boolean; data: any[] }> => {
    try {
      const response = await api.get('/media');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteMediaFile: async (id: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(`/media/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Utility function to handle API errors
const handleApiError = (error: any): Error => {
  if (error.response) {
    const message = error.response.data?.message || 'An error occurred';
    const errors = error.response.data?.errors || [];
    
    if (errors.length > 0) {
      return new Error(`${message}: ${errors.map((e: any) => e.msg).join(', ')}`);
    }
    
    return new Error(message);
  } else if (error.request) {
    return new Error('Network error - please check your connection');
  } else {
    return new Error(error.message || 'An unexpected error occurred');
  }
};

// Utility functions for common operations
export const apiUtils = {
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('adminToken');
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },

  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  },

  formatErrorMessage: (error: any): string => {
    if (error.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  },

  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  },

  // Utility to create member form data
  createMemberFormData: (memberData: CreateMemberData, files: {
    citizenshipCopy?: File;
    photo?: File;
    recommendationLetter?: File;
    resume?: File;
  }): FormData => {
    const formData = new FormData();

    // Append JSON data for each section
    formData.append('generalInfo', JSON.stringify(memberData.generalInfo));
    formData.append('professionalDetails', JSON.stringify(memberData.professionalDetails));
    formData.append('membershipDetails', JSON.stringify(memberData.membershipDetails));
    formData.append('endorsement', JSON.stringify(memberData.endorsement));
    formData.append('declaration', JSON.stringify(memberData.declaration));

    // Append files
    if (files.citizenshipCopy) {
      formData.append('citizenshipCopy', files.citizenshipCopy);
    }
    if (files.photo) {
      formData.append('photo', files.photo);
    }
    if (files.recommendationLetter) {
      formData.append('recommendationLetter', files.recommendationLetter);
    }
    if (files.resume) {
      formData.append('resume', files.resume);
    }

    return formData;
  }
};

// Feedback API
const feedbackAPI = {
  createFeedback: async (feedbackData: CreateFeedbackData, mediaFiles?: File[]): Promise<{ message: string; feedback: Feedback }> => {
    try {
      const formData = new FormData();
      
      // Append feedback data
      formData.append('type', feedbackData.type);
      formData.append('category', feedbackData.category);
      formData.append('subject', feedbackData.subject);
      formData.append('description', feedbackData.description);
      formData.append('anonymous', String(feedbackData.anonymous));
      
      if (feedbackData.contactEmail) formData.append('contactEmail', feedbackData.contactEmail);
      if (feedbackData.contactPhone) formData.append('contactPhone', feedbackData.contactPhone);
      if (feedbackData.contactName) formData.append('contactName', feedbackData.contactName);
      if (feedbackData.assignedDepartment && feedbackData.assignedDepartment !== 'none') {
        formData.append('assignedDepartment', feedbackData.assignedDepartment);
      }
      
      // Append media files
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append('media', file, file.name);
        });
      }
      
      const response: AxiosResponse<{ message: string; feedback: Feedback }> = 
        await api.post('/feedback', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFeedbackById: async (id: string): Promise<{ feedback: Feedback }> => {
    try {
      const response: AxiosResponse<{ feedback: Feedback }> = 
        await api.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAdminFeedback: async (query: FeedbackQuery = {}): Promise<{ page: number; limit: number; total: number; feedback: Feedback[] }> => {
    try {
      const response: AxiosResponse<{ page: number; limit: number; total: number; feedback: Feedback[] }> = 
        await api.get('/admin/feedback', { params: query });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateFeedback: async (id: string, updates: Partial<Feedback>): Promise<{ feedback: Feedback }> => {
    try {
      const response: AxiosResponse<{ feedback: Feedback }> = 
        await api.patch(`/admin/feedback/${id}`, updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteFeedback: async (id: string): Promise<{ message: string }> => {
    try {
      const response: AxiosResponse<{ message: string }> = 
        await api.delete(`/admin/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getPublicFeedback: async (query?: FeedbackQuery): Promise<{ page: number; limit: number; total: number; feedback: Feedback[] }> => {
    try {
      const response: AxiosResponse<{ page: number; limit: number; total: number; feedback: Feedback[] }> = 
        await api.get('/feedback/public', { params: query });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserFeedback: async (query?: { page?: number; limit?: number }): Promise<{ page: number; limit: number; total: number; feedback: Feedback[] }> => {
    try {
      const response: AxiosResponse<{ page: number; limit: number; total: number; feedback: Feedback[] }> = 
        await api.get('/feedback/user/my-feedback', { params: query });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  likeFeedback: async (id: string): Promise<{ feedback: Feedback }> => {
    try {
      const response: AxiosResponse<{ feedback: Feedback }> = 
        await api.post(`/feedback/${id}/like`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addFeedbackResponse: async (id: string, respondentName: string, content: string): Promise<{ feedback: Feedback }> => {
    try {
      const response: AxiosResponse<{ feedback: Feedback }> = 
        await api.post(`/admin/feedback/${id}/response`, { respondentName, content });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFeedbackStats: async (): Promise<{ stats: FeedbackStatsResponse; timestamp: string }> => {
    try {
      const response: AxiosResponse<{ stats: FeedbackStatsResponse; timestamp: string }> = 
        await api.get('/admin/feedback/stats/overview');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Candidate Feedback API
const candidateFeedbackAPI = {
  submitFeedback: async (candidateId: string, feedbackData: CreateCandidateFeedbackData): Promise<{ message: string; feedback: CandidateFeedback }> => {
    try {
      const response: AxiosResponse<{ message: string; feedback: CandidateFeedback }> = 
        await api.post(`/candidates/${candidateId}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFeedback: async (candidateId: string, query?: { page?: number; limit?: number; sort?: string }): Promise<CandidateFeedbackResponse> => {
    try {
      const response: AxiosResponse<CandidateFeedbackResponse> = 
        await api.get(`/candidates/${candidateId}/feedback`, { params: query });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFeedbackById: async (candidateId: string, feedbackId: string): Promise<{ feedback: CandidateFeedback }> => {
    try {
      const response: AxiosResponse<{ feedback: CandidateFeedback }> = 
        await api.get(`/candidates/${candidateId}/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markHelpful: async (candidateId: string, feedbackId: string): Promise<{ feedback: CandidateFeedback }> => {
    try {
      const response: AxiosResponse<{ feedback: CandidateFeedback }> = 
        await api.post(`/candidates/${candidateId}/feedback/${feedbackId}/helpful`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markUnhelpful: async (candidateId: string, feedbackId: string): Promise<{ feedback: CandidateFeedback }> => {
    try {
      const response: AxiosResponse<{ feedback: CandidateFeedback }> = 
        await api.post(`/candidates/${candidateId}/feedback/${feedbackId}/unhelpful`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Export all APIs as default
const API = {
  auth: authAPI,
  posts: postsAPI,
  members: membersAPI,
  candidates: candidatesAPI,
  stats: statsAPI,
  media: mediaAPI,
  feedback: feedbackAPI,
  candidateFeedback: candidateFeedbackAPI,
  utils: apiUtils,
};

export default API;