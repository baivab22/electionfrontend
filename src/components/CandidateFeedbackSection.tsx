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

  const pendingKey = `pendingFeedback:${candidateId}`;

  const readPendingLocal = (): CandidateFeedback[] => {
    try {
      const raw = localStorage.getItem(pendingKey);
      if (!raw) return [];
      return JSON.parse(raw) as CandidateFeedback[];
    } catch (e) {
      return [];
    }
  };

  const writePendingLocal = (list: CandidateFeedback[]) => {
    try {
      localStorage.setItem(pendingKey, JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  };

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const response = await API.candidateFeedback.getFeedback(candidateId, {
        page: 1,
        limit: 10,
        sort: 'newest'
      });
      // Merge server-approved feedback with any locally-pending submissions
      const serverItems = response.feedback || [];
      const pendingLocal = readPendingLocal();

      // Remove any pending items that are now present on server (approved)
      const serverIds = new Set(serverItems.map((f: CandidateFeedback) => f._id));
      const remainingPending = pendingLocal.filter(p => !serverIds.has(p._id));
      if (remainingPending.length !== pendingLocal.length) writePendingLocal(remainingPending);

      // Final list: server approved first, then pending local
      setFeedbackList([...serverItems, ...remainingPending]);
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

      const resp = await API.candidateFeedback.submitFeedback(candidateId, feedbackData);
      const created = resp.feedback;

      if (created) {
        const localItem = { ...created } as CandidateFeedback;
        if (!created.isPublic) {
          const existing = readPendingLocal();
          const updated = [localItem, ...existing];
          writePendingLocal(updated);
        }

        setFeedbackList(prev => [localItem, ...prev]);

        setStats(prev => {
          const prevTotal = prev.totalFeedback || 0;
          const newTotal = prevTotal + 1;
          const newDist = { ...prev.ratingDistribution };
          const rkey = created.rating as number;
          newDist[rkey] = (newDist[rkey] || 0) + 1;
          const newAvg = ((prev.averageRating * prevTotal) + created.rating) / newTotal;
          return {
            averageRating: parseFloat(newAvg.toFixed(1)),
            totalFeedback: newTotal,
            ratingDistribution: newDist
          };
        });

        setSuccessMessage('Thank you! Your feedback has been submitted and is pending approval.');
      }

      // reset form and close
      setComment('');
      setAnonymous(true);
      setEmail('');
      setName('');
      setPhone('');
      setTimeout(() => setShowForm(false), 900);
      setTimeout(() => loadFeedback(), 2000);
    } catch (err: any) {
      const message = err?.message || 'Failed to submit feedback';
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
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Feedback Stats */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader className="p-4 sm:p-6 border-b border-gray-100">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-lg sm:text-xl font-bold text-gray-900">Community Feedback</span>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm h-10 text-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Share Your Feedback
            </Button>
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            What do community members think about {candidateName}?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Rating Card */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-5 shadow-sm border border-red-100">
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-base ${i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Average Rating</p>
              </div>
            </div>

            {/* Total Feedback Card */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 shadow-sm border border-blue-100">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {stats.totalFeedback}
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Total Feedback</p>
              </div>
            </div>

            {/* Rating Distribution Card */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 shadow-sm border border-purple-100">
              <div className="space-y-2">
                <p className="font-semibold text-xs text-gray-700 mb-3">Rating Distribution</p>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-4">{star}⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                        style={{
                          width: stats.totalFeedback > 0 
                            ? `${(stats.ratingDistribution[star] / stats.totalFeedback) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              💬 Share Your Feedback About {candidateName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type and Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Feedback Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="border border-gray-300 h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((t) => (
                      <SelectItem key={t} value={t} className="text-sm">
                        <span className="flex items-center gap-2">
                          {getTypeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Rating</Label>
                <div className="flex gap-2">
                  {ratings.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRating(r)}
                      className={`text-2xl transition-all hover:scale-110 ${
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
              <Label className="text-sm font-medium">Your Comment</Label>
              <Textarea
                placeholder="Share your thoughts about this candidate (5-1000 characters)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border border-gray-300 focus:border-red-500 text-sm min-h-[100px]"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">{comment.length}/1000 characters</p>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
              <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Name</Label>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 h-10 text-sm"
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
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="h-10 text-sm border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!comment || comment.length < 5 || submitting || (!anonymous && !email)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 h-10 text-sm shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback List */}
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Community Reviews</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : feedbackList.length === 0 ? (
          <Card className="bg-gray-50 border-dashed border-2">
            <CardContent className="py-8 text-center">
              <p className="text-gray-600 text-sm">No feedback yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          feedbackList.map((feedback) => (
            <Card key={feedback._id} className="border-l-4 border-l-red-400 hover:shadow-lg transition-all bg-white">
              <CardContent className="pt-5 px-5 pb-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(feedback.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">
                          {feedback.anonymous ? 'Anonymous' : feedback.name || 'Community Member'}
                        </p>
                        {feedback.status !== 'approved' && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium">
                            Pending approval
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-base ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">{feedback.comment}</p>

                {/* Footer with actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                  <Badge variant="secondary" className="text-xs bg-gray-100">{feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</Badge>
                  <div className="flex-1" />
                  <button
                    onClick={() => API.candidateFeedback.markHelpful(candidateId, feedback._id)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {feedback.helpful > 0 && feedback.helpful}
                  </button>
                  <button
                    onClick={() => API.candidateFeedback.markUnhelpful(candidateId, feedback._id)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors"
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
