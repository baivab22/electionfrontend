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
      image: '/assets/images/ncp-logo.jpg',
      bio: 'Leading political strategist with 15+ years of experience in party leadership and policy development.',
    },
    {
      name: 'Sita Gurung',
      role: 'Vice President',
      image: '/assets/images/ncp-logo.jpg',
      bio: 'Tech entrepreneur and advocate for women in technology across Nepal.',
    },
    {
      name: 'Prof. Bikash Koirala',
      role: 'Research Director',
      image: '/assets/images/ncp-logo.jpg',
      bio: 'Academic researcher specializing in AI applications for social good.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 xs:py-16 sm:py-20" data-aos="fade-up">
        <div className="container mx-auto px-0 xs:px-2 sm:px-4">
          <div className=" mx-auto text-center">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 xs:mb-4 sm:mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed px-2">
              नेपाली कम्युनिस्ट पार्टी is a revolutionary political party dedicated to building 
              a socialist society based on social justice, equality, and people's democracy.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 xs:py-16 sm:py-20 bg-white" data-aos="fade-up" data-aos-delay="100">
        <div className="container mx-auto px-0 xs:px-2 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-12">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="text-center pb-3 xs:pb-4 sm:pb-6">
                <div className="w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                  <Target className="text-white w-5 xs:w-6 sm:w-8" />
                </div>
                <CardTitle className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
                  {t('about.mission')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-xs xs:text-sm sm:text-base lg:text-lg leading-relaxed">
                  {t('about.missionText')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="text-center pb-3 xs:pb-4 sm:pb-6">
                <div className="w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                  <Eye className="text-white w-5 xs:w-6 sm:w-8" />
                </div>
                <CardTitle className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
                  {t('about.vision')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-xs xs:text-sm sm:text-base lg:text-lg leading-relaxed">
                  {t('about.visionText')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-red-50" data-aos="fade-up" data-aos-delay="200">
        <div className="container mx-auto px-0 xs:px-2 sm:px-4">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 xs:mb-4">Our Core Values</h2>
            <div className="w-16 xs:w-20 sm:w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-3 xs:p-4 sm:p-6 lg:p-8">
                  <div className="w-10 xs:w-12 sm:w-14 lg:w-16 h-10 xs:h-12 sm:h-14 lg:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6">
                    <value.icon className="text-white w-4 xs:w-5 sm:w-6 lg:w-7" />
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-[10px] xs:text-xs sm:text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white" data-aos="fade-up" data-aos-delay="300">
        <div className="container mx-auto px-0 xs:px-2 sm:px-4">
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
      <section className="py-12 xs:py-16 sm:py-20 bg-primary text-white" data-aos="fade-up" data-aos-delay="400">
        <div className="container mx-auto px-0 xs:px-2 sm:px-4">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-2 xs:mb-4">Our Impact</h2>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-200">Building a stronger movement for social change</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 xs:mb-2">500+</div>
              <p className="text-gray-200 text-[10px] xs:text-xs sm:text-sm">Active Members</p>
            </div>
            <div className="text-center">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 xs:mb-2">50+</div>
              <p className="text-gray-200 text-[10px] xs:text-xs sm:text-sm">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 xs:mb-2">25+</div>
              <p className="text-gray-200 text-[10px] xs:text-xs sm:text-sm">Communities Reached</p>
            </div>
            <div className="text-center">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 xs:mb-2">100+</div>
              <p className="text-gray-200 text-[10px] xs:text-xs sm:text-sm">Initiatives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-red-50" data-aos="fade-up" data-aos-delay="500">
        <div className="container mx-auto px-0 xs:px-2 sm:px-4 text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6">Join Our Movement</h2>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 xs:mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Be part of Nepal's progressive movement. Together, we can create a more inclusive and just society for all.
          </p>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl text-xs xs:text-sm sm:text-base"
            >
              Get Involved
            </a>
            <a
              href="/news"
              className="border-2 border-red-600 text-red-600 px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all duration-200 text-xs xs:text-sm sm:text-base"
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