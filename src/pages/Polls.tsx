import React, { useEffect, useState } from 'react';
import API from '@/lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, CheckCircle2, Clock, Vote as VoteIcon } from 'lucide-react';

interface PollSummary {
  _id: string;
  title: string;
  description?: string;
  isActive?: boolean;
  choices?: Array<any>;
}

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<PollSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await API.polls.listPolls({ activeOnly: false });
      if (res && res.data) setPolls(res.data);
    } catch (err) {
      console.error('Failed to load polls', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = (poll: PollSummary) => {
    return poll.choices?.reduce((sum: number, c: any) => sum + (c.votesCount || 0), 0) || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary via-primary/80 to-blue-600 text-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <VoteIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Live Polls</h1>
          </div>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Share your opinion on important electoral and political matters. Your anonymous vote matters.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && polls.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No polls available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">Check back soon for new polls!</p>
            </CardContent>
          </Card>
        )}

        {!loading && polls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              return (
                <Link key={poll._id} to={`/polls/${poll._id}`} className="group">
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Status Badge */}
                    <div className="relative">
                      <div
                        className={`absolute top-4 left-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold w-fit ${
                          poll.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {poll.isActive ? (
                          <>
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                            Active
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Closed
                          </>
                        )}
                      </div>
                    </div>

                    <CardHeader className="pb-3 pt-12 sm:pt-6">
                      <CardTitle className="text-lg sm:text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        {poll.title}
                      </CardTitle>
                      {poll.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{poll.description}</p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Vote Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
                          <div className="text-xs text-gray-600 mt-1">Total Votes</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-600">{poll.choices?.length || 0}</div>
                          <div className="text-xs text-gray-600 mt-1">Options</div>
                        </div>
                      </div>

                      {/* Preview Choices */}
                      {poll.choices && poll.choices.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          {poll.choices.slice(0, 2).map((choice: any, idx: number) => {
                            const percent = totalVotes > 0 ? ((choice.votesCount || 0) / totalVotes * 100).toFixed(0) : 0;
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700 truncate">{choice.label}</p>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="text-xs font-semibold text-gray-600 whitespace-nowrap">{percent}%</div>
                              </div>
                            );
                          })}
                          {poll.choices.length > 2 && (
                            <p className="text-xs text-gray-500 text-center pt-2">
                              +{poll.choices.length - 2} more option{poll.choices.length - 3 !== 0 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {/* CTA Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold hover:shadow-lg transition-all group-hover:scale-105 transform mt-4"
                        size="sm"
                      >
                        View & Vote
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Polls;
