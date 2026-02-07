import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Trophy, Users, BarChart3, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Candidate {
  id: string;
  name: string;
  photo?: string;
  party?: string;
  constituency?: string;
  votes: number;
  votePercentage: number;
}

interface VotingStatsData {
  totalVotes: number;
  totalCandidates: number;
  candidates: Candidate[];
}

interface VotingStatisticsProps {
  constituency?: string;
  candidacyLevel?: string;
  partyName?: string;
}

const VotingStatistics: React.FC<VotingStatisticsProps> = ({
  constituency,
  candidacyLevel,
  partyName
}) => {
  const [statsData, setStatsData] = useState<VotingStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchVotingStats();
  }, [constituency, candidacyLevel, partyName]);

  const fetchVotingStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (constituency) params.append('constituency', constituency);
      if (candidacyLevel) params.append('candidacyLevel', candidacyLevel);
      if (partyName) params.append('partyName', partyName);

      const response = await axios.get(
        `${API_URL}/candidates/votes/statistics?${params.toString()}`
      );

      if (response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching voting statistics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voting statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!statsData || statsData.candidates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No voting data available</p>
        </CardContent>
      </Card>
    );
  }

  const topCandidate = statsData.candidates[0];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Votes</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statsData.totalVotes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Candidates</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {statsData.totalCandidates}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Leading</p>
                <p className="text-lg font-bold text-green-600 truncate">
                  {topCandidate.name}
                </p>
                <p className="text-sm text-gray-500">
                  {topCandidate.votePercentage}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Voting Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statsData.candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
                      <span className="text-lg font-bold text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Photo */}
                {candidate.photo && (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {candidate.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {candidate.party && (
                      <Badge variant="secondary" className="text-xs">
                        {candidate.party}
                      </Badge>
                    )}
                    {candidate.constituency && (
                      <span className="text-xs text-gray-500">
                        {candidate.constituency}
                      </span>
                    )}
                  </div>
                </div>

                {/* Votes & Percentage */}
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    {candidate.votes.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {candidate.votePercentage}%
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-24 hidden md:block">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${candidate.votePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingStatistics;
