import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageSquare } from 'lucide-react';

const UniversityFooter = ({ 
  universityName = "Tribhuwan University",
  brandDescription = "Nepal's premier institution of higher education. Our feedback system ensures continuous improvement across all campuses and departments.",
  contactEmail = "feedback@tribhuwan.edu.np",
  contactPhone = "+977 1 4330258",
  address = "Kirtipur, Kathmandu, Nepal",
  socialLinks = {
    facebook: "https://facebook.com/tribhuwanuniversity",
    twitter: "https://twitter.com/tribhuwanuni",
    instagram: "https://instagram.com/tribhuwanuniversity",
    linkedin: "https://linkedin.com/school/tribhuwan-university",
    youtube: "https://youtube.com/tribhuwanuniversity"
  },
  customLinks = {}
}) => {

  const defaultLinks = {
    platform: [
      { name: 'Home', href: '/' },
      { name: 'Submit Feedback', href: '/submit' },
      { name: 'Public Feedback', href: '/public' },
      { name: 'Track Feedback', href: '/track' }
    ],
    departments: [
      { name: 'Faculty of Humanities', href: '/departments/humanities' },
      { name: 'Faculty of Science', href: '/departments/science' },
      { name: 'Faculty of Education', href: '/departments/education' },
      { name: 'Faculty of Management', href: '/departments/management' }
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'User Guides', href: '/guides' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact Support', href: '/support' }
    ],
    policies: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Feedback Policy', href: '/feedback-policy' },
      { name: 'Code of Conduct', href: '/conduct' }
    ]
  };

  const links = { ...defaultLinks, ...customLinks };

  const socialIcons = {
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin
  };


  console.log("hello data")

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Background decoration dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
        <div className="absolute top-32 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40"></div>
        <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-white rounded-full opacity-80"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        
        {/* Main Content - All in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              {/* University Logo Placeholder */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">TU</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{universityName}</h3>
                <p className="text-slate-400 text-xs">Kathmandu, Nepal</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-xs">
              {brandDescription}
            </p>

            {/* Social Links */}
            <div className="space-y-2">
              <div className="text-slate-400 text-xs">Follow Tribhuwan University</div>
              <div className="flex space-x-2">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  const IconComponent = socialIcons[platform];
                  if (!IconComponent) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      className="w-8 h-8 bg-slate-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label={`Follow Tribhuwan University on ${platform}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent className="w-4 h-4 text-slate-300" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">Feedback System</h4>
            <div className="space-y-2">
              {links.platform.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Departments Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">Faculties</h4>
            <div className="space-y-2">
              {links.departments.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Resources & Policies */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">Resources</h4>
            <div className="space-y-2">
              {links.resources.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2">
                <h4 className="text-white font-semibold mb-2 text-xs uppercase tracking-wide">Policies</h4>
                <div className="space-y-2">
                  {links.policies.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="block text-slate-400 hover:text-white transition-colors duration-200 text-xs"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-slate-800 pt-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              <div className="font-semibold mb-1">Contact Information:</div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs">
                <div className="flex items-center mb-1 sm:mb-0">
                  <span className="mr-1">📧</span>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                </div>
                <div className="flex items-center mb-1 sm:mb-0">
                  <span className="mr-1">📞</span>
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {contactPhone}
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">📍</span>
                  <span>{address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom with Powered By */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-xs mb-3 md:mb-0">
              © {new Date().getFullYear()} {universityName}. All rights reserved.
            </div>
            
            {/* Powered By Section */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-xs">Developed by</span>
              <div className="flex items-center bg-slate-800 px-3 py-1 rounded-lg">
                {/* Company Logo Placeholder - Replace with actual logo */}
                <div className="w-15 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded mr-2 flex items-center justify-center">
                  {/* <span className="text-white text-xs font-bold">N</span> */}
                  <img src="/nsoft.jpeg" alt="Nsoft Innovations"style={{height:'50px',width:'auto'}} />
                </div>
                {/* <span className="text-slate-300 text-sm font-medium">Nsoft Innovations</span> */}
              </div>
              <a 
                href="https://nsoftInnovations.com.np" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
               nsoftInnovations.com.np
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UniversityFooter;