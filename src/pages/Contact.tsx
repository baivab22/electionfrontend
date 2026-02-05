import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Users } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus('');
      }, 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      info: "contact@cpnelection.org",
      description: "Send us an email"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      info: "+977 1-4123456",
      description: "Mon-Fri, 9AM-6PM"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location",
      info: "Kathmandu, Nepal",
      description: "Our office"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 xs:px-4 py-8 xs:py-10 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
            Contact Communist Party of Nepal
          </h1>
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Get in touch with us for any questions or support regarding our IT community.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-8 xs:mb-10 sm:mb-12">
          {contactInfo.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-3 xs:p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <div className="text-primary">
                  {item.icon}
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-900 font-medium mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">{item.info}</p>
              <p className="text-gray-500 text-[10px] xs:text-xs sm:text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 sm:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-4 xs:p-6 sm:p-8 shadow-sm border border-gray-200">
            <div className="mb-4 xs:mb-6 sm:mb-8">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2 xs:mb-3">Send us a Message</h2>
              <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4 xs:space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs xs:text-sm"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs xs:text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs xs:text-sm"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-xs xs:text-sm"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white font-medium py-2 xs:py-2.5 sm:py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs xs:text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 xs:h-4 w-3 xs:w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 xs:w-4 h-3 xs:h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 xs:px-4 py-2 xs:py-3 rounded-md text-xs xs:text-sm">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 xs:mt-10 sm:mt-12 pt-6 xs:pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
            © 2025 Communist Party of Nepal. Building a better future for Nepal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;