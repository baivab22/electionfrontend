import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditPostFormProps {
  post: any;
  onSubmit: (postData: any) => void;
  onCancel: () => void;
}

const EditPostForm: React.FC<EditPostFormProps> = ({ post, onSubmit, onCancel }) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (post) {
      setFormData({
        title_en: post.title_en || '',
        title_np: post.title_np || '',
        content_en: post.content_en || '',
        content_np: post.content_np || '',
        excerpt_en: post.excerpt_en || '',
        excerpt_np: post.excerpt_np || '',
        category: post.category || '',
        image: post.image || '',
        tags: post.tags ? post.tags.join(', ') : '',
        featured: post.featured || false,
        published: post.published !== false
      });
    }
  }, [post]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const postData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    onSubmit(postData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="english" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="english">English Content</TabsTrigger>
          <TabsTrigger value="nepali">Nepali Content</TabsTrigger>
        </TabsList>

        <TabsContent value="english" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>English Version</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title_en">Title (English) *</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  placeholder="Enter English title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                <Textarea
                  id="excerpt_en"
                  value={formData.excerpt_en}
                  onChange={(e) => handleInputChange('excerpt_en', e.target.value)}
                  placeholder="Brief description in English"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content_en">Content (English) *</Label>
                <Textarea
                  id="content_en"
                  value={formData.content_en}
                  onChange={(e) => handleInputChange('content_en', e.target.value)}
                  placeholder="Full article content in English"
                  rows={10}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nepali" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nepali Version</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title_np">Title (Nepali) *</Label>
                <Input
                  id="title_np"
                  value={formData.title_np}
                  onChange={(e) => handleInputChange('title_np', e.target.value)}
                  placeholder="नेपाली शीर्षक लेख्नुहोस्"
                  required
                  className="nepali-text"
                />
              </div>

              <div>
                <Label htmlFor="excerpt_np">Excerpt (Nepali)</Label>
                <Textarea
                  id="excerpt_np"
                  value={formData.excerpt_np}
                  onChange={(e) => handleInputChange('excerpt_np', e.target.value)}
                  placeholder="नेपालीमा संक्षिप्त विवरण"
                  rows={3}
                  className="nepali-text"
                />
              </div>

              <div>
                <Label htmlFor="content_np">Content (Nepali) *</Label>
                <Textarea
                  id="content_np"
                  value={formData.content_np}
                  onChange={(e) => handleInputChange('content_np', e.target.value)}
                  placeholder="नेपालीमा पूर्ण लेखको सामग्री"
                  rows={10}
                  required
                  className="nepali-text"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Post Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">Featured Image URL *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="technology, innovation, nepal"
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured Post</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => handleInputChange('published', checked)}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          Update Post
        </Button>
      </div>
    </form>
  );
};

export default EditPostForm;