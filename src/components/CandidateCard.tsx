import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface CandidateCardProps {
  candidate: {
    _id: string;
    personalInfo: {
      fullName: string;
      position: string;
      constituency: string;
    };
    biography: {
      bio_en: string;
      profilePhoto?: string;
    };
    achievements: Array<any>;
    issues: Array<any>;
  };
}

const getPositionColor = (position: string): string => {
  const colors: { [key: string]: string } = {
    'Presidential': 'bg-blue-100 text-blue-800',
    'Vice Presidential': 'bg-purple-100 text-purple-800',
    'Parliamentary': 'bg-cyan-100 text-cyan-800',
    'Local Body': 'bg-emerald-100 text-emerald-800',
    'Other': 'bg-gray-100 text-gray-800',
  };
  return colors[position] || 'bg-blue-100 text-blue-800';
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  return (
    <Link to={`/candidate/${candidate._id}`} className="group">
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 cursor-pointer">
        {/* Badge Section */}
        <div className="relative h-28 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-end p-4">
          <Badge className={`${getPositionColor(candidate.personalInfo.position)} text-xs font-semibold`}>
            {candidate.personalInfo.position}
          </Badge>
        </div>

        {/* Image Section */}
        <div className="flex justify-center -mt-14 mb-4">
          {candidate.biography?.profilePhoto ? (
            <img
              src={candidate.biography.profilePhoto}
              alt={candidate.personalInfo.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-white text-white text-3xl font-bold shadow-lg">
              {candidate.personalInfo.fullName.charAt(0)}
            </div>
          )}
        </div>

        <CardContent className="text-center pb-6">
          {/* Name */}
          <h3 className="text-lg font-extrabold text-foreground mb-1 group-hover:text-primary transition-colors">
            {candidate.personalInfo.fullName}
          </h3>

          {/* Constituency */}
          <p className="text-sm font-medium text-muted-foreground mb-4">
            {candidate.personalInfo.constituency}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{candidate.achievements?.length || 0}</div>
              <div className="text-xs font-semibold text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">{candidate.issues?.length || 0}</div>
              <div className="text-xs font-semibold text-muted-foreground">Issues</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">1</div>
              <div className="text-xs font-semibold text-muted-foreground">Manifesto</div>
            </div>
          </div>

          {/* Bio Preview */}
          <p className="text-xs font-medium text-foreground/70 mt-3 line-clamp-2">
            {candidate.biography?.bio_en || 'Click to view full profile'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CandidateCard;
