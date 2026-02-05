import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Heart, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import API from '@/lib/api';
import type { CreateCandidateFeedbackData, CandidateFeedback, CandidateFeedbackResponse } from '@/lib/api';

const feedbackTypes = ['support', 'concern', 'question', 'suggestion'];
const ratings = [1, 2, 3, 4, 5];

interface CandidateFeedbackProps {
  candidateId: string;
  candidateName: string;
}

export default function CandidateFeedbackSection({ candidateId, candidateName }: CandidateFeedbackProps) {
  const [feedbackList, setFeedbackList] = useState<CandidateFeedback[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalFeedback: 0, ratingDistribution: {} as any });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<CreateCandidateFeedbackData['type']>('support');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Load feedback on mount
  useEffect(() => {
    loadFeedback();
  }, [candidateId]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const response = await API.candidateFeedback.getFeedback(candidateId, {
        page: 1,
        limit: 10,
        sort: 'newest'
      });
      setFeedbackList(response.feedback);
      setStats(response.stats);
      setError(null);
    } catch (err) {
      console.error('Failed to load feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const feedbackData: CreateCandidateFeedbackData = {
        type,
        rating,
        comment,
        anonymous
      };

      if (!anonymous) {
        if (!email) {
          setError('Email is required for identified feedback');
          setSubmitting(false);
          return;
        }
        feedbackData.email = email;
        feedbackData.name = name;
        feedbackData.phone = phone;
      }

      await API.candidateFeedback.submitFeedback(candidateId, feedbackData);
      
      setSuccessMessage('Thank you! Your feedback has been submitted.');
      resetForm();
      setTimeout(() => {
        loadFeedback();
        setShowForm(false);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setType('support');
    setRating(5);
    setComment('');
    setAnonymous(true);
    setEmail('');
    setName('');
    setPhone('');
    setError(null);
    setSuccessMessage(null);
  };

  const getRatingColor = (avg: number) => {
    if (avg >= 4) return 'text-green-600';
    if (avg >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'support':
        return '👍';
      case 'concern':
        return '⚠️';
      case 'question':
        return '❓';
      case 'suggestion':
        return '💡';
      default:
        return '💬';
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Stats */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Community Feedback</span>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Share Your Feedback
            </Button>
          </CardTitle>
          <CardDescription>
            What do community members think about {candidateName}?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Rating Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-200">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Average Rating</p>
              </div>
            </div>

            {/* Total Feedback Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-cyan-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-600">
                  {stats.totalFeedback}
                </div>
                <p className="text-sm text-gray-600 mt-2">Community Feedback</p>
              </div>
            </div>

            {/* Rating Distribution Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
              <div className="space-y-2">
                <p className="font-semibold text-sm text-gray-700 mb-3">Rating Distribution</p>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-4">{star}⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                        style={{
                          width: stats.totalFeedback > 0 
                            ? `${(stats.ratingDistribution[star] / stats.totalFeedback) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">
                      {stats.ratingDistribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              💬 Share Your Feedback About {candidateName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type and Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="border-2 border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        <span className="flex items-center gap-2">
                          {getTypeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex gap-2">
                  {ratings.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRating(r)}
                      className={`text-2xl transition-transform ${
                        rating >= r ? 'scale-110' : 'opacity-50'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label>Your Comment</Label>
              <Textarea
                placeholder="Share your thoughts about this candidate (5-1000 characters)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border-2 border-blue-200 focus:border-blue-500"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">{comment.length}/1000 characters</p>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Switch
                checked={anonymous}
                onCheckedChange={setAnonymous}
              />
              <span className="text-sm font-medium text-gray-700">
                {anonymous ? '🕶️ Submit Anonymously' : '👤 Show My Name'}
              </span>
            </div>

            {/* Contact Info for Non-Anonymous */}
            {!anonymous && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-2 border-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-2 border-blue-200"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">✅ {successMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!comment || comment.length < 5 || submitting || (!anonymous && !email)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Community Feedback</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : feedbackList.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">No feedback yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          feedbackList.map((feedback) => (
            <Card key={feedback._id} className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getTypeIcon(feedback.type)}</div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {feedback.anonymous ? 'Anonymous' : feedback.name || 'Community Member'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-4">{feedback.comment}</p>

                {/* Footer with actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                  <Badge variant="secondary">{feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</Badge>
                  <div className="flex-1" />
                  <button
                    onClick={() => API.candidateFeedback.markHelpful(candidateId, feedback._id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {feedback.helpful > 0 && feedback.helpful}
                  </button>
                  <button
                    onClick={() => API.candidateFeedback.markUnhelpful(candidateId, feedback._id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {feedback.unhelpful > 0 && feedback.unhelpful}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
