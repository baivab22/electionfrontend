import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VotingStatistics from '@/components/VotingStatistics';

const VotingStatisticsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Live Voting Results
          </h1>
          <p className="text-gray-600">
            Real-time voting statistics and leaderboard for all candidates
          </p>
        </div>

        {/* Voting Statistics Component */}
        <VotingStatistics />
      </div>
    </div>
  );
};

export default VotingStatisticsPage;
