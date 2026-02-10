import React, { useEffect, useState } from 'react';
import API from '@/lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PollSummary {
  _id: string;
  title: string;
  description?: string;
  isActive?: boolean;
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
      const res = await API.polls.listPolls({ activeOnly: true });
      if (res && res.data) setPolls(res.data);
    } catch (err) {
      console.error('Failed to load polls', err);
    } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-0 xs:px-2 sm:px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Active Polls</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <div>Loading...</div>}
        {!loading && polls.length === 0 && <div>No active polls found.</div>}
        {polls.map(p => (
          <Card key={p._id} className="hover:shadow">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium">{p.title}</h2>
              {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
              <div className="mt-4 flex gap-2">
                <Link to={`/polls/${p._id}`}>
                  <Button size="sm">View & Vote</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Polls;
