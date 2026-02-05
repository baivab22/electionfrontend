import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61580003008206&sk=friends', color: 'hover:text-blue-600', label: 'Facebook' },
    { icon: Twitter, href: '#', color: 'hover:text-sky-500', label: 'Twitter' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-700', label: 'LinkedIn' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600', label: 'YouTube' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-600', label: 'Instagram' },
  ];

  const quickLinks = [
    { key: 'home', path: '/' },
    { key: 'news', path: '/news' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
  ];

  const categories = [
    'technology',
    'digitalTransformation',
    'socialJustice',
    'events',
  ];

  return (
    <footer className="bg-gradient-to-br from-primary/95 via-accent to-secondary/80 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="https://scontent.fktm17-1.fna.fbcdn.net/v/t39.30808-6/616828104_1195780432670354_4211802509173510793_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=lhW_dBOEzEkQ7kNvwFT29Yi&_nc_oc=AdnFcRc_wBgVSXUJQFWypBp84OowOeswqSP1BVGsM9pymtRAjHD6TX9DnkT4y_jHvV2Yxzp3Z2K7qu98MhtK8A7W&_nc_zt=23&_nc_ht=scontent.fktm17-1.fna&_nc_gid=dOYtjRtjN2Bvf9Nxu0uoCg&oh=00_Afudd_MRzayqd4cwuiW8Xhlq_8gpN6ktdFh_5xxCI4fYEA&oe=69860786"
                alt="नेपाल कम्युनिस्ट पार्टी"
                className="h-12 w-12 rounded-full object-cover border-2 border-secondary"
              />
              <div>
                <h3 className="text-xl font-bold text-white">नेपाल कम्युनिस्ट पार्टी</h3>
              </div>
            </div>
            <p className="text-white/90 mb-6 leading-relaxed">
              Fighting for social justice, equality, and the rights of workers, farmers, and all working people of Nepal.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`text-white/80 ${social.color} transition-colors duration-200 p-2 rounded-full bg-white/10 hover:bg-white/20`}
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-secondary">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                  News & Forum
                </Link>
              </li>
              <li>
                <Link
                  to="/candidates"
                  className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                  Candidates
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-secondary">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/news?category=${category}`}
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                  >
                    <span className="w-2 h-2 bg-white/60 rounded-full mr-3"></span>
                    {t(`categories.${category}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          {/* <div>
            <h4 className="text-lg font-semibold mb-6 text-green-300">{t('contact.getInTouch')}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-green-400 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-300">Kathmandu, Nepal</p>
                  <p className="text-sm text-gray-400">Digital Innovation Hub</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-green-400 flex-shrink-0" size={18} />
                <a href="mailto:info@cpnelection.org" className="text-gray-300 hover:text-white transition-colors">
                  info@cpnelection.org
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-green-400 flex-shrink-0" size={18} />
                <a href="tel:+977-1-4444444" className="text-gray-300 hover:text-white transition-colors">
                  +977-1-4444444
                </a>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15 bg-primary/90">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/80 text-sm mb-4 md:mb-0">
              © 2024 नेपाल कम्युनिस्ट पार्टी. All rights reserved. | Building a Democratic Socialist Nepal
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;