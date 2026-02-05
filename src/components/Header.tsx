import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'np' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'candidates', path: '/candidates' },
    { key: 'news', path: '/news' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
    { key: 'membership-form', path: '/membership-form' },
    { key: 'feedback', path: '/feedback' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61580003008206&sk=friends', color: 'text-blue-600' },
    // { icon: Twitter, href: '#', color: 'text-sky-500' },
    // { icon: Linkedin, href: '#', color: 'text-blue-700' },
    { icon: Youtube, href: 'https://www.youtube.com/@NepalCommunistParty', color: 'text-red-600' },
    // { icon: Instagram, href: '#', color: 'text-pink-600' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-modern-lg border-b border-primary/10 sticky top-0 z-50">
      {/* Top bar with social links - Hidden on small screens */}
      <div className="hidden sm:block bg-gradient-to-r from-primary via-accent to-secondary text-white py-2">
        <div className="container mx-auto px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-medium hidden xs:inline">{t('contact.followUs')}:</span>
            <div className="flex gap-1.5 sm:gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="hover:text-secondary hover:scale-110 transition-all duration-200"
                >
                  <social.icon size={14} className="sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-white hover:text-secondary hover:bg-white/10 transition-all duration-200 font-medium text-xs px-2 sm:px-3 h-7 sm:h-8"
            >
              <Globe size={14} className="mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">{i18n.language === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}</span>
              <span className="xs:hidden">{i18n.language === 'en' ? '🇳🇵' : '🇬🇧'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-1 min-w-0">
            <img
              src="https://scontent.fktm17-1.fna.fbcdn.net/v/t39.30808-6/616828104_1195780432670354_4211802509173510793_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=lhW_dBOEzEkQ7kNvwFT29Yi&_nc_oc=AdnFcRc_wBgVSXUJQFWypBp84OowOeswqSP1BVGsM9pymtRAjHD6TX9DnkT4y_jHvV2Yxzp3Z2K7qu98MhtK8A7W&_nc_zt=23&_nc_ht=scontent.fktm17-1.fna&_nc_gid=dOYtjRtjN2Bvf9Nxu0uoCg&oh=00_Afudd_MRzayqd4cwuiW8Xhlq_8gpN6ktdFh_5xxCI4fYEA&oe=69860786"
              alt="Nepal Communist Party Logo"
              className="h-10 sm:h-14 w-10 sm:w-14 rounded-full object-cover shadow-modern group-hover:scale-105 transition-transform duration-200 flex-shrink-0"
            />
            <div className="hidden min-w-0">
              <h1 className="text-sm sm:text-xl md:text-2xl font-bold gradient-text line-clamp-1">
                नेपाल कम्युनिस्ट पार्टी 
              </h1>
              <p className="hidden sm:block text-xs text-muted-foreground font-medium tracking-wide">Nepal Communist Party</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`text-sm lg:text-base font-semibold transition-all duration-200 hover:text-primary relative group whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-foreground/80'
                }`}
              >
                {t(`nav.${item.key}`)}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 ${
                  location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
            <Link
              to="/admin"
              className="bg-gradient-to-r from-primary via-accent to-secondary text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-semibold hover:shadow-modern-lg hover:scale-105 transition-all duration-200 active:scale-95 text-sm lg:text-base whitespace-nowrap"
            >
              {t('nav.admin')}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 h-10 w-10">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] xs:w-[320px] sm:w-[400px] bg-white/95 backdrop-blur-lg p-4 xs:p-6">
              <div className="flex flex-col gap-3 xs:gap-4 mt-6 xs:mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-base xs:text-lg font-semibold p-3 xs:p-4 rounded-xl transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary shadow-modern'
                        : 'text-foreground/80 hover:bg-muted/50'
                    }`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="bg-gradient-to-r from-primary via-accent to-secondary text-white p-3 xs:p-4 rounded-xl text-center font-semibold hover:shadow-modern-lg transition-all duration-200 active:scale-95 text-base xs:text-lg"
                >
                  {t('nav.admin')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;