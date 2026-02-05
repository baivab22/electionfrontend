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
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Communist Party of Nepal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for any questions or support regarding our IT community.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-primary">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-900 font-medium mb-1">{item.info}</p>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Send us a Message</h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {/* <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Why Contact Us?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Join the Community</h3>
                    <p className="text-gray-600 text-sm">Connect with IT professionals across Nepal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Get Support</h3>
                    <p className="text-gray-600 text-sm">Technical help from experienced developers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Quick Response</h3>
                    <p className="text-gray-600 text-sm">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Office Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday:</span>
                  <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="text-gray-900">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="text-gray-500">Closed</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Our party community is active 24/7 for support and political engagement.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-gray-600 text-sm">Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">50K+</div>
                  <div className="text-gray-600 text-sm">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600 text-sm">Daily Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            © 2025 Communist Party of Nepal. Building a better future for Nepal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;