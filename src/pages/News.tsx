import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, RefreshCw, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NewsCard from '@/components/NewsCard';
import API, { Post, PostsQuery, PostsResponse } from '@/lib/api';
// import API, { Post, PostsResponse, PostsQuery } from '@/services/api';

// Loading skeleton components
const PostCardSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <Card className="shadow-md">
    <CardContent className={`p-0 ${viewMode === 'list' ? 'flex flex-col xs:flex-row' : ''}`}>
      <Skeleton className={`${viewMode === 'list' ? 'w-full xs:w-48 sm:w-64 h-36 xs:h-40 sm:h-48' : 'h-36 xs:h-40 sm:h-48 w-full'} rounded-t-lg ${viewMode === 'list' ? 'xs:rounded-l-lg xs:rounded-tr-none' : ''}`} />
      <div className="p-3 xs:p-4 sm:p-6 flex-1">
        <Skeleton className="h-5 xs:h-6 w-full mb-2 xs:mb-3" />
        <Skeleton className="h-3 xs:h-4 w-full mb-1.5 xs:mb-2" />
        <Skeleton className="h-3 xs:h-4 w-3/4 mb-3 xs:mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 xs:h-4 w-16 xs:w-20" />
          <Skeleton className="h-3 xs:h-4 w-20 xs:w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PostsGridSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <div className={viewMode === 'grid' 
    ? 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 lg:gap-8' 
    : 'space-y-4 xs:space-y-6'
  }>
    {Array.from({ length: 6 }, (_, i) => (
      <PostCardSkeleton key={i} viewMode={viewMode} />
    ))}
  </div>
);

const News = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'np';
  const [searchParams, setSearchParams] = useSearchParams();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  // API State
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  const postsPerPage = 9;

  const categories = [
    { value: 'all', label: t('common.allCategories', 'All Categories') },
    { value: 'technology', label: t('categories.technology') },
    { value: 'digitalTransformation', label: t('categories.digitalTransformation') },
    { value: 'socialJustice', label: t('categories.socialJustice') },
    { value: 'events', label: t('categories.events') },
    { value: 'innovation', label: t('categories.innovation') },
    { value: 'policy', label: t('categories.policy') },
    { value: 'education', label: t('categories.education') },
    { value: 'startups', label: t('categories.startups') },
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch posts function
  const fetchPosts = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError('');
      
      const page = resetPage ? 1 : currentPage;
      
      const queryParams: PostsQuery = {
        page,
        limit: postsPerPage,
        language: currentLanguage,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      };

      const response: PostsResponse = await API.posts.getPosts(queryParams);

      console.log('Fetched posts:', response);
      
      if (response.success && response.data) {
        
        setPosts(response.data);
        setTotalCount(response.total);
        setTotalPages(response.pagination.pages);
        
        if (resetPage && page !== currentPage) {
          setCurrentPage(1);
        }
      } else {
        setError('Failed to load posts');
        setPosts([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(API.utils.formatErrorMessage(err));
      setPosts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, debouncedSearchTerm, currentLanguage, postsPerPage]);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    setSearchParams(params);
  }, [selectedCategory, debouncedSearchTerm, currentPage, setSearchParams]);

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = searchParams.get('page');
    
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
    if (search && search !== searchTerm) {
      setSearchTerm(search);
      setDebouncedSearchTerm(search);
    }
    if (page && parseInt(page) !== currentPage) {
      setCurrentPage(parseInt(page));
    }
  }, []);

  // Fetch posts when dependencies change
  useEffect(() => {
    const shouldResetPage = selectedCategory !== searchParams.get('category') || 
                           debouncedSearchTerm !== searchParams.get('search');
    
    fetchPosts(shouldResetPage);
  }, [fetchPosts]);

  // Update URL when params change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Handlers
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchPosts();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Calculate display indices
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, totalCount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 xs:py-16 sm:py-24">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-3 xs:mb-4 sm:mb-6">
              {t('nav.news', 'News & Updates')}
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-primary/90 max-w-3xl mx-auto px-2">
              {t('news.subtitle', 'Stay updated with the latest developments in ICT, digital transformation, and social justice initiatives in Nepal.')}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-6 xs:py-8 sm:py-10 bg-white shadow-sm">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6">
          <div className="flex flex-col gap-3 xs:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 xs:w-5 h-4 xs:h-5" />
                <Input
                  type="text"
                  placeholder={t('common.searchPlaceholder', 'Search articles...')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-8 xs:pl-10 h-9 xs:h-10 text-sm xs:text-base"
                  disabled={loading}
                />
              </div>
              <Select 
                value={selectedCategory} 
                onValueChange={handleCategoryChange}
                disabled={loading}
              >
                <SelectTrigger className="w-full sm:w-48 md:w-64 h-9 xs:h-10 text-sm xs:text-base">
                  <Filter size={14} className="mr-1.5 xs:mr-2 flex-shrink-0" />
                  <SelectValue placeholder={t('common.filter', 'Filter by category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-sm xs:text-base">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-end gap-1.5 xs:gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                disabled={loading}
                className="h-8 xs:h-9 w-8 xs:w-9 p-0"
              >
                <Grid className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                disabled={loading}
                className="h-8 xs:h-9 w-8 xs:w-9 p-0"
              >
                <List className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid/List */}
      <section className="py-10 xs:py-12 sm:py-16">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6">
          {/* Error State */}
          {error && !loading && (
            <Alert className="mb-4 xs:mb-6 sm:mb-8 border-red-200 bg-red-50">
              <AlertCircle className="h-3.5 xs:h-4 w-3.5 xs:w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-xs xs:text-sm">
                {error}
                <Button
                  variant="link"
                  onClick={handleRetry}
                  className="ml-1.5 xs:ml-2 p-0 h-auto text-red-600 underline text-xs xs:text-sm"
                >
                  {t('common.tryAgain', 'Try again')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <PostsGridSkeleton viewMode={viewMode} />
          ) : posts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-8 xs:py-12 sm:py-16">
              <div className="text-4xl xs:text-5xl sm:text-6xl mb-3 xs:mb-4">📰</div>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-1.5 xs:mb-2">
                {t('news.noPosts', 'No posts found')}
              </h3>
              <p className="text-gray-600 mb-3 xs:mb-4 text-sm xs:text-base px-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? t('news.noPostsFilter', 'Try adjusting your search or filter criteria.')
                  : t('news.noPostsGeneral', 'No articles are available at the moment.')
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className="text-xs xs:text-sm h-8 xs:h-9"
                >
                  {t('common.clearFilters', 'Clear Filters')}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div className="mb-4 xs:mb-6 sm:mb-8 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3">
                <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
                  {t('news.showingResults', 'Showing {{start}}-{{end}} of {{total}} posts', {
                    start: startIndex + 1,
                    end: endIndex,
                    total: totalCount
                  })}
                </p>
                
                {!loading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="gap-1.5 xs:gap-2 h-7 xs:h-8 text-xs xs:text-sm"
                  >
                    <RefreshCw className="w-3 xs:w-3.5 h-3 xs:h-3.5" />
                    {t('common.refresh', 'Refresh')}
                  </Button>
                )}
              </div>
              
              {/* Posts */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 lg:gap-8' 
                : 'space-y-4 xs:space-y-6'
              }>
                {posts.map((post) => (
                  <NewsCard 
                    key={post.id} 
                    id={post.id}
                    title={ post.title}
                    // excerpt={currentLanguage === 'np' ? post.excerpt_np : post.excerpt_en}
                    image={post.image}
                    category={post.category}
                    author={post.author.name}
                    publishedAt={post.publishedAt}
                    featured={post.featured}
                    views={post.views}
                    likes={post.likes}
                    content={post.content}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 xs:mt-10 sm:mt-12">
                  <div className="flex flex-wrap items-center justify-center gap-1 xs:gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || loading}
                      className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3 text-xs xs:text-sm"
                    >
                      {t('common.previous', 'Previous')}
                    </Button>
                    
                    {/* Page Numbers */}
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start page if we're near the end
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      // Show first page and ellipsis if needed
                      if (startPage > 1) {
                        pages.push(
                          <Button
                            key={1}
                            variant={currentPage === 1 ? 'default' : 'outline'}
                            onClick={() => handlePageChange(1)}
                            disabled={loading}
                            className="w-7 xs:w-8 sm:w-10 h-7 xs:h-8 sm:h-10 text-xs xs:text-sm p-0"
                          >
                            1
                          </Button>
                        );
                        
                        if (startPage > 2) {
                          pages.push(<span key="ellipsis1" className="px-1 xs:px-2 text-xs xs:text-sm">...</span>);
                        }
                      }
                      
                      // Show visible page range
                      for (let page = startPage; page <= endPage; page++) {
                        pages.push(
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                            className="w-7 xs:w-8 sm:w-10 h-7 xs:h-8 sm:h-10 text-xs xs:text-sm p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                      
                      // Show last page and ellipsis if needed
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(<span key="ellipsis2" className="px-1 xs:px-2 text-xs xs:text-sm">...</span>);
                        }
                        
                        pages.push(
                          <Button
                            key={totalPages}
                            variant={currentPage === totalPages ? 'default' : 'outline'}
                            onClick={() => handlePageChange(totalPages)}
                            disabled={loading}
                            className="w-7 xs:w-8 sm:w-10 h-7 xs:h-8 sm:h-10 text-xs xs:text-sm p-0"
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                      
                      return pages;
                    })()}
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3 text-xs xs:text-sm"
                    >
                      {t('common.next', 'Next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;