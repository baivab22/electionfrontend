import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PollSummary {
  _id: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

const ActivePolls: React.FC = () => {
  const [polls, setPolls] = useState<PollSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await API.polls.listPolls({ activeOnly: true });
      if (res && res.data) setPolls(res.data);
    } catch (err) {
      console.error('Failed to load active polls', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!loading && polls.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Participate in Polls</h2>
          <p className="text-sm text-gray-600 mt-1">See current polls and share your voice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map(p => (
            <Card key={p._id} className="hover:shadow">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium">{p.title}</h3>
                {p.description && <p className="text-sm text-gray-600 mt-2">{p.description}</p>}
                <div className="mt-4">
                  <Link to={`/polls/${p._id}`}>
                    <Button size="sm">View & Vote</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivePolls;
