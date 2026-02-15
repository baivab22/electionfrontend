import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2, Clock, Vote as VoteIcon, Users, BarChart3, PieChart } from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Choice {
  id: string;
  _id?: string;
  label: string;
  votes?: number;
  percentage?: string;
}

const PollDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<any>(null);
  const [results, setResults] = useState<{ totalVotes: number; choices: Choice[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const resultsIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (id) fetchPoll();
    return () => {
      if (resultsIntervalRef.current) {
        window.clearInterval(resultsIntervalRef.current);
        resultsIntervalRef.current = null;
      }
    };
  }, [id]);

  const fetchPoll = async () => {
    setLoading(true);
    try {
      const res = await API.polls.getPoll(id as string);
      if (res?.data) {
        setPoll(res.data);

        const storedVoterId = localStorage.getItem('voterId') || undefined;
        try {
          const status = await API.polls.checkStatus(id as string, { voterId: storedVoterId });
          if (status?.data?.hasVoted) setHasVoted(true);
        } catch (err) {
          // ignore
        }

        await fetchResults();
        try {
          if (res.data.isActive) {
            if (resultsIntervalRef.current) window.clearInterval(resultsIntervalRef.current);
            resultsIntervalRef.current = window.setInterval(() => {
              fetchResults();
            }, 3000) as unknown as number;
          }
        } catch (e) {
          console.warn('Polling setup failed', e);
        }
      }
    } catch (e) {
      console.error('Failed to load poll', e);
      toast({ title: 'Error', description: 'Failed to load poll', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await API.polls.results(id as string);
      if (res?.data) setResults(res.data);
    } catch (e) {
      console.error('Failed to load results', e);
    }
  };

  const handleVote = async (choiceId: string) => {
    setVotingLoading(true);
    setSelectedChoice(choiceId);
    try {
      let voterId = localStorage.getItem('voterId') || undefined;
      if (!voterId) {
        try {
          voterId =
            (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ?
              (crypto as any).randomUUID() :
              `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        } catch (e) {
          voterId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        }
        localStorage.setItem('voterId', voterId);
      }

      const res = await API.polls.vote(id as string, { choiceId, voterId });
      if (res?.message || res?.success) {
        toast({
          title: '✓ Vote Recorded',
          description: 'Thank you for voting! Your vote is anonymous and secure.',
        });
        setHasVoted(true);
        await fetchResults();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to vote';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setVotingLoading(false);
      setSelectedChoice(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-lg text-gray-600">Poll not found</p>
              <Button onClick={() => navigate('/polls')} className="mt-4">
                Back to Polls
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalVotes = results?.totalVotes || 0;

  // Color palette for charts
  const COLORS = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ];

  // Prepare data for charts
  const chartData = results?.choices.map((c, index) => ({
    name: c.label,
    votes: c.votes || 0,
    percentage: parseFloat(String(c.percentage || '0')),
    fill: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/80 to-blue-600 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4 -ml-2"
            onClick={() => navigate('/polls')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">{poll.title}</h1>
              {poll.description && (
                <p className="text-base sm:text-lg text-white/90">{poll.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Status and Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {poll.isActive ? (
                  <>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Clock className="w-6 h-6 text-green-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-bold text-green-600">Active</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-bold text-gray-600">Closed</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="font-bold text-blue-600 text-lg">{totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <VoteIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Vote</p>
                  <p className={`font-bold text-lg ${hasVoted ? 'text-green-600' : 'text-gray-600'}`}>
                    {hasVoted ? '✓ Voted' : 'Not Voted'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <VoteIcon className="w-5 h-5 text-primary" />
              Cast Your Vote
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">Your vote is anonymous and secure</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {poll.choices.map((c: any) => {
                const cid = c._id || c.id;
                const r = results?.choices.find((rc) => String(rc.id) === String(cid));
                const percent = r ? parseFloat(String(r.percentage || '0')) : 0;
                const votes = r?.votes || 0;
                const isSelected = selectedChoice === cid;

                return (
                  <div
                    key={cid}
                    className={`relative p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : hasVoted || !poll.isActive
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-primary hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      if (!hasVoted && poll.isActive) {
                        handleVote(cid);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            votes > 0 || isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          {(votes > 0 || isSelected) && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{c.label}</p>
                          <p className="text-sm text-gray-600">
                            {votes} vote{votes !== 1 ? 's' : ''} • {percent}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {hasVoted && votes > 0 && (
                          <Badge className="bg-green-100 text-green-700">
                            {((votes / totalVotes) * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">ℹ️ Anonymous Voting:</span> Your vote is completely anonymous.
                We do not store any personal information to protect your privacy.
              </p>
            </div>

            {/* Action Buttons */}
            {!hasVoted && poll.isActive && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">
                  {votingLoading ? 'Recording your vote...' : 'Select an option above and click to vote'}
                </p>
              </div>
            )}

            {hasVoted && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700 font-semibold">
                  Thank you for voting! Your vote has been recorded.
                </p>
              </div>
            )}

            {!poll.isActive && !hasVoted && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  This poll is no longer active and votes cannot be recorded.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Breakdown with Charts */}
        {results && chartData.length > 0 && (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Vote Distribution
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Percentage breakdown</p>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="votes"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`${value} votes`, 'Total']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Vote Comparison
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Side-by-side comparison</p>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`${value} votes`, 'Total']}
                      />
                      <Bar
                        dataKey="votes"
                        fill="#8b5cf6"
                        radius={[8, 8, 0, 0]}
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results List */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Detailed Results
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {poll.isActive ? 'Live results - updates automatically' : 'Final results'}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {results.choices.map((c, index) => {
                    const percent = parseFloat(String(c.percentage || '0'));
                    const color = COLORS[index % COLORS.length];
                    return (
                      <div
                        key={c.id}
                        className="group p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <p className="font-semibold text-gray-900 text-lg">{c.label}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl" style={{ color }}>
                              {percent}%
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              {c.votes} vote{c.votes !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className="h-4 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: color,
                              background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                            }}
                          >
                            <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 pt-6 border-t">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Total Votes</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{totalVotes}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Options</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {results.choices.length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Leading</p>
                      <p className="text-lg font-bold text-green-600 mt-1 truncate">
                        {results.choices.reduce((max, c) =>
                          (c.votes || 0) > (max.votes || 0) ? c : max
                        ).label}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Status</p>
                      <p className={`text-lg font-bold mt-1 ${poll.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                        {poll.isActive ? '🟢 Live' : '⚫ Closed'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PollDetail;
