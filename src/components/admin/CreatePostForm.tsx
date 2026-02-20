
import React, { useState, useMemo, useEffect } from 'react';
import { Upload, Image, Eye, Save, X, Type, FileText } from 'lucide-react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadToCloudinary } from '../../lib/api';
import { useToast } from '@/hooks/use-toast';


import API from '../../lib/api';

interface CreatePostFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSubmit, onCancel, initialData, isEdit = false }) => {
  // Use a unique key for the form to force remount on post switch
  // Use a stable key for create mode to avoid remounting on every render
  const formKey = isEdit
    ? `edit-${initialData?.id || initialData?._id || ''}`
    : 'create';
  const [formData, setFormData] = useState({
    title_en: '',
    title_np: '',
    content_en: '',
    content_np: '',
    excerpt_en: '',
    excerpt_np: '',
    category: '',
    image: '',
    tags: '',
    featured: false,
    published: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const categories = [
    'technology',
    'digitalTransformation',
    'socialJustice',
    'events',
    'innovation',
    'policy',
    'education',
    'startups'
  ];

  // Initialize form with initialData when in edit mode
  useEffect(() => {
    // Always reset form state when formKey changes (switching posts or mode)
    if (isEdit && initialData) {
      // Support both API shapes: title_en/content_en and title/content
      setFormData({
        title_en: initialData.title_en || initialData.title || '',
        title_np: initialData.title_np || '',
        content_en: initialData.content_en || initialData.content || '',
        content_np: initialData.content_np || '',
        excerpt_en: initialData.excerpt_en || initialData.excerpt || '',
        excerpt_np: initialData.excerpt_np || '',
        category: initialData.category || '',
        image: initialData.image || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        featured: initialData.featured || false,
        published: initialData.published !== undefined ? initialData.published : true
      });
      // Set image preview if image exists
      if (initialData.image) {
        if (initialData.image.startsWith('http') || initialData.image.startsWith('data:')) {
          setImagePreview(initialData.image);
        } else {
          const API_ASSET_URL = (() => {
            const vite = import.meta.env.VITE_API_URL as string | undefined;
            if (vite) return `${vite.replace(/\/+$/g, '')}/`;
            return import.meta.env.MODE === 'production'
              ? (import.meta.env.VITE_PROD_URL || 'https://api.abhushangallery.com/')
              : (import.meta.env.VITE_DEV_URL || 'http://localhost:3000/');
          })();
          setImagePreview(`${API_ASSET_URL}uploads/posts/${initialData.image}`);
        }
      }
    } else if (!isEdit) {
      setFormData({
        title_en: '',
        title_np: '',
        content_en: '',
        content_np: '',
        excerpt_en: '',
        excerpt_np: '',
        category: '',
        image: '',
        tags: '',
        featured: false,
        published: true
      });
      setImagePreview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey]);

  // Force ReactQuill to update when switching posts by using a key
  const quillKey = `${isEdit ? 'edit' : 'create'}-${initialData?.id || initialData?._id || ''}`;

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Removed base64 logic: all uploads go to Cloudinary, only URL is used.

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);
    try {
      // Upload to Cloudinary and get URL
      const imageUrl = await uploadToCloudinary(file, 'image');
      setImagePreview(imageUrl);
      handleInputChange('image', imageUrl);
    } catch (error) {
      console.error('Failed to upload image to Cloudinary:', error);
      alert('Failed to upload image');
      setImagePreview('');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUrlChange = (value: string) => {
    handleInputChange('image', value);
    if (value && !selectedFile) {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en || !formData.content_en || !formData.category) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsUploading(true);
      // Prepare the data for submission
      const submitData = {
        title_en: formData.title_en,
        title_np: formData.title_np,
        content_en: formData.content_en,
        content_np: formData.content_np,
        excerpt_en: formData.excerpt_en,
        excerpt_np: formData.excerpt_np,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        featured: formData.featured,
        published: formData.published,
        image: formData.image
      };

      // If a file is selected but not yet uploaded (should not happen), upload it now
      if (selectedFile && (!formData.image || !formData.image.startsWith('http'))) {
        const imageUrl = await uploadToCloudinary(selectedFile, 'image');
        submitData.image = imageUrl;
      }

      let result;
      if (isEdit && initialData && initialData.id) {
        // Use API abstraction for update
        result = await API.posts.updatePost(initialData.id, submitData);
      } else {
        // Use API abstraction for create
        result = await API.posts.createPost(submitData);
      }

      if (onSubmit) {
        onSubmit(result.data);
      }
      if (!isEdit) {
        resetForm();
      }
      toast({
        title: isEdit ? 'Post updated!' : 'Post created!',
        description: isEdit ? 'The post was updated successfully.' : 'Your post was added successfully.',
      });
    } catch (error: any) {
      console.error('Submit failed:', error);
      let message = error?.message || 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} post: ${message}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_np: '',
      content_en: '',
      content_np: '',
      excerpt_en: '',
      excerpt_np: '',
      category: '',
      image: '',
      tags: '',
      featured: false,
      published: true
    });
    setImagePreview('');
    setSelectedFile(null);
  };

  const removeImage = () => {
    setImagePreview('');
    setSelectedFile(null);
    handleInputChange('image', '');
  };

  return (
    <form key={formKey} className="max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-blue-50 p-8" onSubmit={handleSubmit}>
      <style>{`
        .quill-editor-wrapper {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .quill-editor-wrapper .ql-toolbar {
          background: linear-gradient(to right, #f8fafc, #f1f5f9);
          border: none;
          border-bottom: 2px solid #e2e8f0;
          padding: 16px;
        }
        
        .quill-editor-wrapper .ql-container {
          border: none;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .quill-editor-wrapper .ql-editor {
          min-height: 400px;
          padding: 24px;
          line-height: 1.8;
        }
        
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: italic;
        }
        
        .quill-editor-wrapper .ql-stroke {
          stroke: #475569;
        }
        
        .quill-editor-wrapper .ql-fill {
          fill: #475569;
        }
        
        .quill-editor-wrapper .ql-picker-label {
          color: #475569;
        }
        
        .quill-editor-wrapper .ql-toolbar button:hover,
        .quill-editor-wrapper .ql-toolbar button:focus,
        .quill-editor-wrapper .ql-toolbar button.ql-active {
          color: #2563eb;
        }
        
        .quill-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .quill-editor-wrapper .ql-toolbar button:focus .ql-stroke,
        .quill-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        
        .quill-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .quill-editor-wrapper .ql-toolbar button:focus .ql-fill,
        .quill-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
        
        .quill-editor-wrapper .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .quill-editor-wrapper .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .quill-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 16px;
          margin-left: 0;
          font-style: italic;
          color: #475569;
        }
        
        .quill-editor-wrapper .ql-editor code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
        }
        
        .quill-editor-wrapper .ql-editor pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
        }

        .excerpt-editor .ql-container .ql-editor {
          min-height: 120px;
        }
      `}</style>
      
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isEdit ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update your post content and settings' : 'Share your thoughts and ideas with the world'}
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-indigo-500">
          <div className="flex items-center text-2xl font-semibold mb-6 text-gray-800">
            <Image className="mr-3 text-indigo-600" size={28} />
            Featured Image
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
                  <p className="text-sm text-gray-600 font-medium">
                    {isUploading ? 'Processing...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF, WebP up to 10MB</p>
                </label>
              </div>
              
              <div className="mt-6">
                {/* <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Or paste image URL
                </label> */}
                {/* <input
                  type="url"
                  value={formData.image.startsWith('data:') ? '' : formData.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                /> */}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Image Preview
              </label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-80 flex items-center justify-center relative">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <Image size={56} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No image selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-blue-500">
          <div className="flex items-center text-2xl font-semibold mb-6 text-gray-800">
            <Type className="mr-3 text-blue-600" size={28} />
            Post Title
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
               Title *
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => handleInputChange('title_en', e.target.value)}
                placeholder="Enter an engaging title for your post..."
                required
                className="w-full text-2xl font-bold px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nepali Title
              </label>
              <input
                type="text"
                value={formData.title_np}
                onChange={(e) => handleInputChange('title_np', e.target.value)}
                placeholder="तपाईंको पोस्टको लागि आकर्षक शीर्षक लेख्नुहोस्..."
                className="w-full text-2xl font-bold px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div> */}
          </div>
        </div>

        {/* Excerpt Section */}
   

        {/* Content Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-purple-500">
          <div className="flex items-center text-2xl font-semibold mb-6 text-gray-800">
            <FileText className="mr-3 text-purple-600" size={28} />
            Main Content *
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
               Content *
              </label>
              <div className="quill-editor-wrapper">
                <ReactQuill
                  key={quillKey}
                  theme="snow"
                  value={formData.content_en}
                  onChange={(value) => handleInputChange('content_en', value)}
                  modules={modules}
                  formats={formats}
                  placeholder="Start writing your amazing content here... Use the toolbar above to format your text, add images, and more!"
                />
              </div>
            </div>
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nepali Content
              </label>
              <div className="quill-editor-wrapper">
                <ReactQuill
                  theme="snow"
                  value={formData.content_np}
                  onChange={(value) => handleInputChange('content_np', value)}
                  modules={modules}
                  formats={formats}
                  placeholder="तपाईंको अद्भुत सामग्री यहाँ लेख्न सुरु गर्नुहोस्... तपाईंको पाठलाई ढाँचा दिन, चित्रहरू थप्न, र थप प्रयोग गर्न टूलबार प्रयोग गर्नुहोस्!"
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* Post Settings */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-amber-500">
          <div className="flex items-center text-2xl font-semibold mb-6 text-gray-800">
            <Save className="mr-3 text-amber-600" size={28} />
            Post Settings
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-700 font-medium"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="technology, innovation, nepal, digital"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <div>
                  <label htmlFor="featured" className="font-semibold text-gray-800 cursor-pointer">Featured Post</label>
                  <p className="text-sm text-gray-600 mt-1">Show this post prominently on the homepage</p>
                </div>
              </div>

              {/* <div className="flex items-start space-x-3 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => handleInputChange('published', e.target.checked)}
                  className="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                />
                <div>
                  <label htmlFor="published" className="font-semibold text-gray-800 cursor-pointer">Publish Immediately</label>
                  <p className="text-sm text-gray-600 mt-1">Make this post visible to the public</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button 
            type="button" 
            className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
            onClick={onCancel}
            disabled={isUploading}
          >
            <X className="mr-2 inline" size={18} />
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isUploading}
            className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 px-10 py-4 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-105 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="mr-2 inline" size={18} />
            {isUploading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreatePostForm;