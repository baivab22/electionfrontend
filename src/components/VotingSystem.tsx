import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, ThumbsDown, TrendingUp, Users, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

interface VotingSystemProps {
  candidateId: string;
  candidateName: string;
  initialVotes?: number;
  initialVotePercentage?: number;
  votingEnabled?: boolean;
}

interface VoteData {
  hasVoted: boolean;
  totalVotes: number;
  votingEnabled: boolean;
  votePercentage?: number;
}

const VotingSystem: React.FC<VotingSystemProps> = ({
  candidateId,
  candidateName,
  initialVotes = 0,
  initialVotePercentage = 0,
  votingEnabled = true
}) => {
  const [voteData, setVoteData] = useState<VoteData>({
    hasVoted: false,
    totalVotes: initialVotes,
    votingEnabled,
    votePercentage: initialVotePercentage
  });
  const [loading, setLoading] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [voterInfo, setVoterInfo] = useState({
    voterId: '',
    voterName: '',
    voterEmail: '',
    constituency: ''
  });
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Check if user has already voted on component mount
  useEffect(() => {
    checkVoteStatus();
  }, [candidateId]);

  const checkVoteStatus = async () => {
    const storedVoterId = localStorage.getItem('voterId');
    if (!storedVoterId) return;

    try {
      const response = await axios.get(
        `${API_URL}/candidates/${candidateId}/vote/check?voterId=${storedVoterId}`
      );
      
      if (response.data.success) {
        setVoteData({
          hasVoted: response.data.data.hasVoted,
          totalVotes: response.data.data.totalVotes,
          votingEnabled: response.data.data.votingEnabled
        });
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const handleVoteClick = () => {
    if (!voteData.votingEnabled) {
      toast({
        title: "Voting Disabled",
        description: "Voting is currently disabled for this candidate.",
        variant: "destructive"
      });
      return;
    }

    const storedVoterId = localStorage.getItem('voterId');
    if (storedVoterId) {
      // User has voter ID, proceed to vote
      setVoterInfo(prev => ({ ...prev, voterId: storedVoterId }));
      setShowVoteDialog(true);
    } else {
      // Show dialog to collect voter information
      setShowVoteDialog(true);
    }
  };

  const handleCastVote = async () => {
    if (!voterInfo.voterId.trim()) {
      toast({
        title: "Error",
        description: "Voter ID is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/candidates/${candidateId}/vote`,
        voterInfo
      );

      if (response.data.success) {
        // Store voter ID for future use
        localStorage.setItem('voterId', voterInfo.voterId);
        
        setVoteData({
          hasVoted: true,
          totalVotes: response.data.data.totalVotes,
          votingEnabled: true
        });

        toast({
          title: "Vote Cast Successfully!",
          description: `Your vote for ${candidateName} has been recorded.`,
        });

        setShowVoteDialog(false);
        setVoterInfo({ voterId: '', voterName: '', voterEmail: '', constituency: '' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cast vote';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVote = async () => {
    const storedVoterId = localStorage.getItem('voterId');
    if (!storedVoterId) {
      toast({
        title: "Error",
        description: "Voter ID not found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/candidates/${candidateId}/vote`,
        { data: { voterId: storedVoterId } }
      );

      if (response.data.success) {
        setVoteData({
          hasVoted: false,
          totalVotes: response.data.data.totalVotes,
          votingEnabled: true
        });

        toast({
          title: "Vote Removed",
          description: "Your vote has been removed successfully.",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove vote';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Vote Count</h3>
                <p className="text-sm text-gray-500">Cast your vote</p>
              </div>
            </div>
            {voteData.hasVoted && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">
                  {voteData.totalVotes.toLocaleString()}
                </span>
              </div>
              <span className="text-sm text-gray-600">Total Votes</span>
            </div>

            {voteData.votePercentage !== undefined && voteData.votePercentage > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Vote Share</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {voteData.votePercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${voteData.votePercentage}%` }}
                  />
                </div>
              </div>
            )}

            {!voteData.hasVoted ? (
              <Button
                onClick={handleVoteClick}
                disabled={!voteData.votingEnabled || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Vote for {candidateName}
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    You have voted for this candidate
                  </p>
                </div>
                <Button
                  onClick={handleRemoveVote}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Remove Vote
                    </>
                  )}
                </Button>
              </div>
            )}

            {!voteData.votingEnabled && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Voting is currently disabled for this candidate
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cast Your Vote</DialogTitle>
            <DialogDescription>
              Please provide your information to cast your vote for {candidateName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="voterId">
                Voter ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="voterId"
                placeholder="Enter your voter ID"
                value={voterInfo.voterId}
                onChange={(e) => setVoterInfo({ ...voterInfo, voterId: e.target.value })}
                disabled={!!localStorage.getItem('voterId')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voterName">Full Name</Label>
              <Input
                id="voterName"
                placeholder="Enter your full name"
                value={voterInfo.voterName}
                onChange={(e) => setVoterInfo({ ...voterInfo, voterName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voterEmail">Email</Label>
              <Input
                id="voterEmail"
                type="email"
                placeholder="Enter your email"
                value={voterInfo.voterEmail}
                onChange={(e) => setVoterInfo({ ...voterInfo, voterEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constituency">Constituency</Label>
              <Input
                id="constituency"
                placeholder="Enter your constituency"
                value={voterInfo.constituency}
                onChange={(e) => setVoterInfo({ ...voterInfo, constituency: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowVoteDialog(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCastVote}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Casting Vote...
                </>
              ) : (
                'Cast Vote'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VotingSystem;
