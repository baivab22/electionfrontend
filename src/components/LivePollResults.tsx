import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import API from '@/lib/api';

interface PollChoice {
  _id: string;
  label: string;
  votesCount: number;
}

interface Poll {
  _id: string;
  title: string;
  description?: string;
  choices: PollChoice[];
  isActive: boolean;
}

interface ChartData {
  name: string;
  votes: number;
  percentage: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

const LivePollResults: React.FC = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    fetchActivePoll();
    // Refresh every 5 seconds for live updates
    const interval = setInterval(fetchActivePoll, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivePoll = async () => {
    try {
      setLoading(true);
      const res = await API.polls.listPolls({ activeOnly: true });
      
      if (res && res.data && res.data.length > 0) {
        const activePoll = res.data[0];
        setPoll(activePoll);

        // Calculate total votes and chart data
        const total = activePoll.choices.reduce((sum: number, choice: PollChoice) => sum + (choice.votesCount || 0), 0);
        setTotalVotes(total);

        const data = activePoll.choices.map((choice: PollChoice, index: number) => ({
          name: choice.label || `Option ${index + 1}`,
          votes: choice.votesCount || 0,
          percentage: total > 0 ? Math.round((choice.votesCount / total) * 100) : 0,
        }));

        setChartData(data);
      } else {
        setPoll(null);
        setChartData([]);
        setTotalVotes(0);
      }
    } catch (error) {
      console.error('Failed to fetch live poll results:', error);
    } finally {
      setLoading(false);
    }
  };

  const { t, i18n } = useTranslation();

  if (loading && !poll) {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll || chartData.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary text-center mb-2">
          {t('polls.electionResults', 'Election Results')}
        </h2>
      </div>
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-primary border-b border-primary/30 py-5 px-6">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <TrendingUp className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">{poll.title}</h2>
              <p className="text-sm text-blue-100 mt-1">
                {t('polls.liveResults', 'Live Poll Results')} • {totalVotes} {t('polls.totalVotes', 'total votes')}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 md:p-8 bg-white">
          {poll.description && (
            <p className="text-gray-700 text-sm md:text-base mb-6 pb-6 border-b border-gray-200">
              {poll.description}
            </p>
          )}

          {/* Chart */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Votes', angle: -90, position: 'insideLeft' }}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: any) => `${value} votes`}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]} animationDuration={300}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Results Table */}
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm md:text-base font-bold text-gray-800 truncate">{item.name}</span>
                    <span className="text-xs md:text-sm font-bold text-gray-600 ml-2 flex-shrink-0">
                      {item.percentage}% ({item.votes} votes)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs md:text-sm text-gray-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('polls.updatesRealtime', 'Updates in real-time')} • {t('polls.lastUpdated', 'Last updated just now')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePollResults;
