import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Choice {
  id: string;
  _id?: string;
  label: string;
  votes?: number;
  percentage?: string;
}

const PollDetail: React.FC = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState<any>(null);
  const [results, setResults] = useState<{ totalVotes: number; choices: Choice[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // API client
  // Note: use API.polls helpers from client lib
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const resultsIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (id) fetchPoll();
    return () => {
      // cleanup polling interval
      if (resultsIntervalRef.current) {
        window.clearInterval(resultsIntervalRef.current);
        resultsIntervalRef.current = null;
      }
    };
  }, [id]);

  const fetchPoll = async () => {
    try {
      const res = await API.polls.getPoll(id as string);
      if (res?.data) {
        setPoll(res.data);

        // Check if current user/voter already voted
        const storedVoterId = localStorage.getItem('voterId') || undefined;
        try {
          const status = await API.polls.checkStatus(id as string, { voterId: storedVoterId });
          if (status?.data?.hasVoted) setHasVoted(true);
        } catch (err) {
          // ignore check errors
        }

        // Fetch initial results and start polling for updates (every 5s)
        await fetchResults();
        try {
          if (res.data.isActive) {
            if (resultsIntervalRef.current) window.clearInterval(resultsIntervalRef.current);
            resultsIntervalRef.current = window.setInterval(() => {
              fetchResults();
            }, 5000) as unknown as number;
          }
        } catch (e) {
          console.warn('Polling setup failed', e);
        }
      }
    } catch (e) {
      console.error('Failed to load poll', e);
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
    setLoading(true);
    try {
      const voterId = localStorage.getItem('voterId') || undefined;
      const res = await API.polls.vote(id as string, { choiceId, voterId });
      if (res?.message || res?.success) {
        toast({ title: 'Vote recorded' });
        if (voterId) localStorage.setItem('voterId', voterId);
        setHasVoted(true);
        await fetchResults();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to vote';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto py-8">
      {!poll && <div>Loading poll...</div>}
      {poll && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">{poll.title}</h1>
          {poll.description && <p className="text-sm text-gray-600 mb-4">{poll.description}</p>}

          <Card className="mb-4">
            <CardContent>
              <div className="space-y-3">
                {poll.choices.map((c: any) => {
                  const cid = c._id || c.id;
                  const r = results?.choices.find(rc => String(rc.id) === String(cid));
                  const percent = r ? parseFloat(String(r.percentage || '0')) : 0;
                  return (
                    <div key={cid} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium">{c.label}</div>
                          {r && <div className="text-sm text-gray-500">{r.votes} votes • {r.percentage}%</div>}
                        </div>
                        <div>
                          <Button
                            onClick={() => handleVote(cid)}
                            disabled={loading || !poll.isActive || hasVoted}
                          >
                            {hasVoted ? 'Voted' : 'Vote'}
                          </Button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-indigo-600 h-3 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardContent>
                <h3 className="font-medium mb-2">Results</h3>
                <div className="space-y-2">
                  {results.choices.map(c => (
                    <div key={c.id} className="flex justify-between">
                      <div>{c.label}</div>
                      <div>{c.votes} • {c.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PollDetail;
