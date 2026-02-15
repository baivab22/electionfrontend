import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle, Download, BookOpen, MapPin, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const VoterEducationHub = () => {
  const [activeTab, setActiveTab] = useState('how-to-vote');

  const votingSteps = [
    {
      number: 1,
      title: 'Register to Vote',
      np_title: 'मतदाता दर्ता गर्नुहोस्',
      description: 'Ensure you are registered as a voter in your constituency. Check your voter ID and registration status.',
      details: [
        'Visit your local election office or municipality',
        'Bring citizenship certificate or passport',
        'Fill out voter registration form',
        'Get your voter ID within 7-10 days'
      ]
    },
    {
      number: 2,
      title: 'Know Your Polling Station',
      np_title: 'आपको मतदान केन्द्र जान्नुहोस्',
      description: 'Find out where you need to vote and when polls open.',
      details: [
        'Check your voter ID for polling station location',
        'Visit the election commission website',
        'Call your local municipality office',
        'Polls open at 7:00 AM and close at 5:00 PM'
      ]
    },
    {
      number: 3,
      title: 'Prepare on Election Day',
      np_title: 'चुनाव दिन तयारी गर्नुहोस्',
      description: 'Come prepared with required documents and arrive early.',
      details: [
        'Bring your voter ID and citizenship certificate',
        'Arrive early to avoid long lines',
        'Come with a valid photo ID',
        'Bring pen for marking ballot (if required)'
      ]
    },
    {
      number: 4,
      title: 'Vote and Mark Your Choice',
      np_title: 'मतदान गरी आपनो छनोट गर्नुहोस्',
      description: 'Cast your vote by marking your preferred candidate.',
      details: [
        'Present voter ID and sign register',
        'Receive ballot paper from poll worker',
        'Mark your choice clearly with the symbol',
        'Place ballot in the sealed box'
      ]
    },
    {
      number: 5,
      title: 'Your Vote is Secret',
      np_title: 'आपनो मत गोप्य छ',
      description: 'Your vote is confidential and protected by law.',
      details: [
        'Vote privately in the booth',
        'No one can see your choice',
        'Your vote cannot be traced back to you',
        'Election is fair and transparent'
      ]
    }
  ];

  const requiredDocs = [
    {
      icon: '🆔',
      title: 'Voter ID Card',
      np_title: 'मतदाता पहिचान पत्र',
      description: 'Most important document. Issued by election commission.'
    },
    {
      icon: '📋',
      title: 'Citizenship Certificate',
      np_title: 'नागरिकता प्रमाण पत्र',
      description: 'Original or certified copy required.'
    },
    {
      icon: '📷',
      title: 'Photo ID',
      np_title: 'तस्वीर भएको पहिचान पत्र',
      description: 'Passport, License, or any government-issued ID.'
    },
    {
      icon: '✍️',
      title: 'Pen (Optional)',
      np_title: 'कलम (वैकल्पिक)',
      description: 'For marking your choice on ballot paper.'
    }
  ];

  const faqs = [
    {
      q: 'What if I lost my voter ID?',
      q_np: 'यदि मेरो मतदाता पहिचान पत्र हराम भएको छ भने?',
      a: 'You can still vote with your citizenship certificate or any government-issued photo ID. Contact your local election office immediately.'
    },
    {
      q: 'Can I vote in a different constituency?',
      q_np: 'के मैले अलग निर्वाचन क्षेत्रमा मतदान गर्न सक्छु?',
      a: 'No, you must vote in your registered constituency. Voting outside your constituency is not allowed.'
    },
    {
      q: 'What if I make a mistake on the ballot?',
      q_np: 'यदि मैले ब्यालटमा गल्ति गरें भने?',
      a: 'Ask the poll worker for a new ballot paper. They will destroy the spoiled ballot officially.'
    },
    {
      q: 'Can I vote if I am a first-time voter?',
      q_np: 'यदि मैले पहिलो पटक मत दिइरहेको छु भने क्या मतदान गर्न सक्छु?',
      a: 'Yes! First-time voters must register to vote and bring proper documentation.'
    },
    {
      q: 'What time can I vote?',
      q_np: 'मतदान कहिले सम्म हुन्छ?',
      a: 'Polling stations are open from 7:00 AM to 5:00 PM. Come early to avoid long queues.'
    },
    {
      q: 'Is voting mandatory?',
      q_np: 'मतदान अनिवार्य छ?',
      a: 'While not legally mandatory in Nepal, voting is a right and civic duty to strengthen democracy.'
    }
  ];

  const locationFinder = [
    {
      category: 'Find Your Polling Station',
      options: [
        'Visit: election.gov.np',
        'Call: 1-800-ELECTION',
        'Ask at your municipality office',
        'Check your voter ID card'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-orange-600" />
            Voter Education Hub
          </h1>
          <p className="text-xl text-gray-600">Learn how to vote and make your voice count</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { id: 'how-to-vote', label: '🗳️ How to Vote', icon: CheckCircle },
            { id: 'documents', label: '📋 Required Documents', icon: Download },
            { id: 'locations', label: '📍 Polling Locations', icon: MapPin },
            { id: 'faq', label: '❓ FAQs', icon: HelpCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'how-to-vote' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Step-by-Step Voting Guide</h2>
            
            {votingSteps.map((step, idx) => (
              <Card key={idx} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Step Number */}
                    <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white p-8 flex items-center justify-center min-w-[120px]">
                      <div className="text-center">
                        <div className="text-5xl font-black mb-2">{step.number}</div>
                        <div className="text-sm font-bold">Step</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{step.title}</h3>
                          <p className="text-orange-600 font-semibold">{step.np_title}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                      </div>

                      <p className="text-gray-600 mb-4 font-medium">{step.description}</p>

                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-700">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex-shrink-0">
                              ✓
                            </span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">📋 Documents You Need</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {requiredDocs.map((doc, idx) => (
                <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{doc.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{doc.title}</h3>
                    <p className="text-orange-600 font-semibold mb-3">{doc.np_title}</p>
                    <p className="text-gray-600">{doc.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Download Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-6 h-6 text-orange-600" />
                  Download Document Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg px-8 py-6">
                  📥 Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'locations' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">📍 Finding Your Polling Station</h2>
            
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Multiple Ways to Find Your Polling Station
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: '🌐 Online Search',
                      items: ['Visit: election.gov.np', 'Enter your district', 'View your location']
                    },
                    {
                      title: '📞 Phone Support',
                      items: ['Call: 1-800-ELECTION', '24-hour helpline', 'Multilingual support']
                    },
                    {
                      title: '🏛️ Local Office',
                      items: ['Visit your municipality', 'Ask election officers', 'Get physical address']
                    },
                    {
                      title: '🆔 Your Voter Card',
                      items: ['Check back of ID', 'Polling station address', 'Opening time']
                    }
                  ].map((method, idx) => (
                    <div key={idx} className="p-4 border-2 border-orange-200 rounded-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{method.title}</h3>
                      <ul className="space-y-2">
                        {method.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-700">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center text-center">
                  <div>
                    <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-800">Interactive Map Coming Soon</p>
                    <p className="text-gray-600 mt-2">Search for polling stations near you</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'faq' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border-0 bg-white shadow-lg hover:shadow-xl transition-all rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-lg">{faq.q}</p>
                      <p className="text-orange-600 font-semibold text-sm mt-1">{faq.q_np}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 pt-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Help CTA */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Still Have Questions?</h3>
            <p className="mb-6 text-lg">Contact your local election office or call our helpline for assistance.</p>
            <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg">
              📞 Get Help Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterEducationHub;
