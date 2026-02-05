import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Eye, Users, Globe, Lightbulb, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Globe,
      title: 'People\'s Power',
      description: 'Empowering every citizen to participate in building a democratic socialist society.',
    },
    {
      icon: Heart,
      title: 'Social Justice',
      description: 'Fighting for equality, dignity, and justice for all working people.',
    },
    {
      icon: Lightbulb,
      title: 'Progressive Policies',
      description: 'Developing transformative solutions for economic development and social welfare.',
    },
    {
      icon: Users,
      title: 'Unity',
      description: 'Building a strong movement of workers, farmers, and progressive forces.',
    },
  ];

  const team = [
    {
      name: 'Dr. Ramesh Sharma',
      role: 'Founder & President',
      image: '/assets/images/WhatsApp Image 2025-09-26 at 8.50.23 PM (1).jpeg',
      bio: 'Leading political strategist with 15+ years of experience in party leadership and policy development.',
    },
    {
      name: 'Sita Gurung',
      role: 'Vice President',
      image: '/assets/images/WhatsApp Image 2025-09-26 at 8.50.22 PM.jpeg',
      bio: 'Tech entrepreneur and advocate for women in technology across Nepal.',
    },
    {
      name: 'Prof. Bikash Koirala',
      role: 'Research Director',
      image: '/assets/images/WhatsApp Image 2025-09-26 at 8.50.23 PM.jpeg',
      bio: 'Academic researcher specializing in AI applications for social good.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              नेपाल कम्युनिस्ट पार्टी is a revolutionary political party dedicated to building 
              a socialist society based on social justice, equality, and people's democracy.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-white" size={32} />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {t('about.mission')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('about.missionText')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="text-white" size={32} />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {t('about.vision')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('about.visionText')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              Meet the visionary leaders building a democratic socialist future for Nepal through party initiatives.
            </p>
          </div> */}
          
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-500 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div> */}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-gray-200">Building a stronger movement for social change</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">500+</div>
              <p className="text-gray-200">Active Members</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <p className="text-gray-200">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">25+</div>
              <p className="text-gray-200">Communities Reached</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">100+</div>
              <p className="text-gray-200">Initiatives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Movement</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of Nepal's progressive movement. Together, we can create a more inclusive and just society for all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-gradient-to-r from-red-600 to-yellow-600 text-white px-8 py-4 rounded-lg font-medium hover:from-red-700 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Involved
            </a>
            <a
              href="/news"
              className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;