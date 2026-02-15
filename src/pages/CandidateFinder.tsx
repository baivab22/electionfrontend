import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, User, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import axios from 'axios';

interface Candidate {
  _id: string;
  personalInfo: {
    fullName: string;
    profileImage?: string;
  };
  politicalInfo: {
    party: string;
    position: string;
  };
  electionInfo: {
    district: string;
    municipality?: string;
    constituency?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

const NEPAL_DISTRICTS = [
  'All Districts',
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara', 'Bardiya', 'Bhaktapur',
  'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula', 'Dhading', 'Dhankuta', 'Dhanusa', 'Dolakha',
  'Dolpa', 'Doti', 'Eastern Rukum', 'Gorkha', 'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla',
  'Kailali', 'Kalikot', 'Kanchanpur', 'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung',
  'Mahottari', 'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalparasi East', 'Nawalparasi West', 'Nuwakot',
  'Okhaldhunga', 'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap', 'Rasuwa', 'Rautahat', 'Rolpa',
  'Rukum', 'Rupandehi', 'Salyan', 'Sankhuwasabha', 'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha', 'Solukhumbu',
  'Sunsari', 'Surkhet', 'Syangja', 'Tanahu', 'Taplejung', 'Terhathum', 'Udayapur', 'Western Rukum'
];

const CandidateFinder: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/candidates?limit=500');
      setCandidates(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesDistrict = selectedDistrict === 'All Districts' || 
                           candidate.electionInfo?.district === selectedDistrict;
    const matchesSearch = searchTerm === '' || 
                         candidate.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Candidate Finder
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and explore candidates running in your district. Learn about their background, party affiliation, and contact information.
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-lg border-t-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Search className="w-6 h-6 mr-2 text-blue-600" />
              Search Candidates
            </CardTitle>
            <CardDescription>Filter candidates by district and name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* District Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  {NEPAL_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter candidate name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredCandidates.length}</span> candidate(s)
              {selectedDistrict !== 'All Districts' && (
                <span> in <span className="font-semibold">{selectedDistrict}</span></span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Candidates Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card 
                key={candidate._id}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-gradient-to-r from-blue-500 to-purple-500"
              >
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      {candidate.personalInfo?.profileImage ? (
                        <img
                          src={candidate.personalInfo.profileImage}
                          alt={candidate.personalInfo?.fullName || 'Candidate'}
                          className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 truncate">
                        {candidate.personalInfo?.fullName || 'Unknown Candidate'}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {candidate.politicalInfo?.party || 'Independent'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Position */}
                  {candidate.politicalInfo?.position && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="font-medium">Position:</span>
                      <span className="ml-1">{candidate.politicalInfo.position}</span>
                    </div>
                  )}

                  {/* District and Area */}
                  {candidate.electionInfo?.district && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-1">
                        {candidate.electionInfo.district}
                        {candidate.electionInfo?.constituency && `, Area ${candidate.electionInfo.constituency}`}
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {candidate.contactInfo?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-green-500" />
                        <span>{candidate.contactInfo.phone}</span>
                      </div>
                    )}
                    {candidate.contactInfo?.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-red-500" />
                        <span className="truncate">{candidate.contactInfo.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No candidates found</h3>
            <p className="text-gray-500">
              Try selecting a different district or adjusting your search criteria.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-xl text-gray-600">Loading candidates...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateFinder;
