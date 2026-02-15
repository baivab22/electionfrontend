import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

const VolunteerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    municipality: '',
    skills: [],
    availability: [],
    motivation: '',
    agreeTerms: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const districts = [
    'Kathmandu', 'Bhaktapur', 'Lalitpur', 'Kavre', 'Nuwakot', 'Rasuwa',
    'Sindhuli', 'Makwanpur', 'Ramechhap', 'Okhaldhunga', 'Khotang', 'Udayapur',
    'Dhanusha', 'Mahottari', 'Sarlahi', 'Rautahat', 'Parsa', 'Bara',
    'Chitwan', 'Makwanpur', 'Gorkha', 'Lamjung', 'Tanahu', 'Syangja',
    'Kaski', 'Myagdi', 'Parbat', 'Baglung', 'Gulmi', 'Palpa',
    'Nawalpur', 'Rupandehi', 'Arghakhanchi', 'Kapilvastu', 'Parasi', 'Morang',
    'Sunsari', 'Ilam', 'Jhapa', 'Panchthar', 'Terhathum', 'Dhankuta',
    'Sankhuwasabha', 'Bhojpur', 'Solukhumbu', 'Okhaldunga', 'Khotang', 'Udayapur',
    'Taplejung', 'Saptari', 'Siraha', 'Dhanusa', 'Mahottari', 'Rautahat'
  ].sort();

  const skillOptions = [
    { id: 'social_media', label: '📱 Social Media Management', icon: '📱' },
    { id: 'field_work', label: '🚶 Field Work / Door-to-Door', icon: '🚶' },
    { id: 'data_entry', label: '💻 Data Entry / Tech Support', icon: '💻' },
    { id: 'event_org', label: '🎪 Event Organization', icon: '🎪' },
    { id: 'content', label: '✍️ Content Writing', icon: '✍️' },
    { id: 'translation', label: '🌐 Translation (English/Nepali)', icon: '🌐' },
    { id: 'logistics', label: '📦 Logistics & Supply', icon: '📦' },
    { id: 'fundraising', label: '💰 Fundraising', icon: '💰' },
    { id: 'media', label: '📸 Photography / Video', icon: '📸' },
    { id: 'training', label: '🎓 Training & Mentoring', icon: '🎓' }
  ];

  const availabilityOptions = [
    { id: 'weekdays', label: 'Weekdays (Mon-Fri)', time: '9 AM - 5 PM' },
    { id: 'evenings', label: 'Evenings', time: '5 PM - 9 PM' },
    { id: 'weekends', label: 'Weekends', time: 'Sat-Sun' },
    { id: 'flexible', label: 'Flexible / On-call', time: 'As needed' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!formData.district) newErrors.district = 'Please select a district';
    if (formData.skills.length === 0) newErrors.skills = 'Select at least one skill';
    if (formData.availability.length === 0) newErrors.availability = 'Select at least one availability option';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const handleAvailabilityToggle = (availId) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(availId)
        ? prev.availability.filter(a => a !== availId)
        : [...prev.availability, availId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api.abhushangallery.com'}/api/volunteers/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            registeredAt: new Date()
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          district: '',
          municipality: '',
          skills: [],
          availability: [],
          motivation: '',
          agreeTerms: false
        });
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setErrors({
          ...errors,
          submit: result.message || 'Registration failed. Please try again.'
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({
        ...errors,
        submit: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Become a Volunteer
          </h1>
          <p className="text-xl text-gray-600">Join our campaign and make a real difference in the election process</p>
        </div>

        {submitted && (
          <Card className="bg-primary border-0 shadow-xl mb-8 text-white">
            <CardContent className="p-8 flex items-center gap-4">
              <CheckCircle className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-1">Registration Successful! ✓</h3>
                <p>Thank you for volunteering! We'll contact you soon with next steps. Welcome to the team!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {errors.submit && (
          <Card className="bg-red-500 border-0 shadow-xl mb-8 text-white">
            <CardContent className="p-8 flex items-center gap-4">
              <AlertCircle className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-1">Registration Failed</h3>
                <p>{errors.submit}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary text-white py-8">
            <CardTitle className="text-2xl">Volunteer Registration Form</CardTitle>
            <p className="text-primary/80 mt-2">Fill in your details and select the areas where you'd like to help</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary/20">
                  📋 Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`bg-white border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:border-primary focus:outline-none`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`bg-white border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:border-primary focus:outline-none`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                    <Input
                      type="tel"
                      placeholder="98XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`bg-white border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:border-primary focus:outline-none`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">District *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className={`w-full bg-white border-2 ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:border-primary focus:outline-none`}
                    >
                      <option value="">Select a district</option>
                      {districts.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.district}
                      </p>
                    )}
                  </div>

                  {/* Municipality */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Municipality / Ward (Optional)</label>
                    <Input
                      type="text"
                      placeholder="E.g., Kathmandu Metropolitan City, Ward 10"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary/20">
                  💪 Your Skills & Expertise *
                </h3>
                <p className="text-gray-600 text-sm mb-4">Select all areas where you can contribute:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skillOptions.map((skill) => (
                    <label
                      key={skill.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.skills.includes(skill.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 bg-white hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                        className="w-5 h-5 accent-green-500 cursor-pointer"
                      />
                      <span className="ml-3 font-semibold text-gray-900">{skill.label}</span>
                    </label>
                  ))}
                </div>

                {errors.skills && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.skills}
                  </p>
                )}
              </div>

              {/* Availability Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary/20">
                  ⏰ Your Availability *
                </h3>
                <p className="text-gray-600 text-sm mb-4">When can you volunteer?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availabilityOptions.map((avail) => (
                    <label
                      key={avail.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.availability.includes(avail.id)
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-300 bg-white hover:border-cyan-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(avail.id)}
                        onChange={() => handleAvailabilityToggle(avail.id)}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{avail.label}</p>
                        <p className="text-sm text-gray-600">{avail.time}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {errors.availability && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.availability}
                  </p>
                )}
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Why do you want to volunteer? (Optional)
                </label>
                <Textarea
                  placeholder="Tell us about your motivation to volunteer in this campaign..."
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:outline-none min-h-24"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 mt-1 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      I agree to the Volunteer Code of Conduct and Terms *
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      I commit to maintaining neutrality, respecting all candidates, and following all campaign guidelines.
                    </p>
                  </div>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.agreeTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white font-bold py-3 text-lg transition-all"
                >
                  {loading ? 'Registering...' : '✓ Register as Volunteer'}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 font-bold py-3 text-lg"
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      district: '',
                      municipality: '',
                      skills: [],
                      availability: [],
                      motivation: '',
                      agreeTerms: false
                    });
                    setErrors({});
                  }}
                >
                  Clear Form
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600 pt-4">
                * Required fields. We'll contact you within 24 hours!
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Make Impact</h3>
              <p className="text-gray-600">Help strengthen democratic participation in Nepal</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Join Community</h3>
              <p className="text-gray-600">Work with like-minded people passionate about change</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Grow Skills</h3>
              <p className="text-gray-600">Learn new skills and gain real-world experience</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegistration;
