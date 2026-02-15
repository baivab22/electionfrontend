import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Zap, Image, MessageSquare, Video } from 'lucide-react';

const DigitalCampaignCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const generateCampaignContent = (campaignTitle: string, campaignId: string, format: string) => {
    // Generate HTML content for campaigns
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaignTitle} - CPN Campaign Material</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            border-bottom: 4px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            color: #667eea;
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0;
        }
        .badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .section-title {
            color: #667eea;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .info-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }
        .info-label {
            color: #6c757d;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 16px;
            font-weight: 600;
        }
        ul {
            line-height: 1.8;
            padding-left: 20px;
        }
        li {
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .download-date {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">CPN Campaign Material</div>
            <h1 class="title">${campaignTitle}</h1>
            <p>Official Election Campaign Resource</p>
        </div>

        <div class="section">
            <div class="section-title">📋 Material Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Campaign ID</div>
                    <div class="info-value">${campaignId}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Download Date</div>
                    <div class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Format</div>
                    <div class="info-value">${format}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">Ready to Use</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📢 How to Use This Material</div>
            <ul>
                <li><strong>Digital Distribution:</strong> Share on social media platforms (Facebook, Twitter, Instagram, WhatsApp)</li>
                <li><strong>Print Distribution:</strong> Print this document for physical campaign activities</li>
                <li><strong>Email Campaigns:</strong> Forward to supporters and campaign volunteers</li>
                <li><strong>Event Promotion:</strong> Use at rallies, meetings, and campaign events</li>
                <li><strong>Customize:</strong> Edit content according to your local requirements</li>
            </ul>
        </div>

        <div class="section">
            <div class="section-title">✅ Campaign Guidelines</div>
            <ul>
                <li>Maintain party colors and branding consistency</li>
                <li>Follow election commission guidelines</li>
                <li>Include official party contact information</li>
                <li>Respect copyright and usage rights</li>
                <li>Report any issues to campaign coordinators</li>
            </ul>
        </div>

        <div class="section">
            <div class="section-title">📞 Contact & Support</div>
            <p>For additional campaign materials, templates, or support:</p>
            <ul>
                <li><strong>Platform:</strong> CPN Election Portal</li>
                <li><strong>Category:</strong> ${format}</li>
                <li><strong>Support:</strong> Available 24/7 through the platform</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Communist Party of Nepal (CPN)</strong></p>
            <p>Official Election Campaign Platform</p>
            <div class="download-date">Downloaded: ${new Date().toLocaleString()}</div>
            <p style="margin-top: 20px;">© ${new Date().getFullYear()} CPN - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleDownload = (campaignId: string, campaignTitle: string) => {
    // Determine file name and type
    const fileName = `${campaignTitle.replace(/\s+/g, '_')}_Campaign.html`;
    
    // Generate HTML campaign content
    const content = generateCampaignContent(campaignTitle, campaignId, 'HTML Document');

    // Create blob and trigger download
    try {
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Success!\n\nDownloaded: ${campaignTitle}\n\nThe campaign material has been saved to your Downloads folder.\nYou can open it in any web browser and print or share as needed.`);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Download failed. Please try again or contact support.');
    }
  };

  const handleShare = (campaignId: string, campaignTitle: string) => {
    // Share functionality
    const shareText = `Check out this campaign material: ${campaignTitle} - Supporting our candidates!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Campaign Material',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard! You can now paste and share this.');
    }
  };

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    alert('Caption copied to clipboard!');
  };

  const campaigns = [
    {
      id: 1,
      category: 'posters',
      title: 'Large Campaign Poster',
      np_title: 'ठूलो अभिनन्दन पोस्टर',
      description: 'Professional A2 size poster for street campaigns',
      size: '4.2 MB',
      format: 'PNG, JPG',
      downloads: 1234,
      icon: '📄'
    },
    {
      id: 2,
      category: 'social',
      title: 'WhatsApp Campaign Image',
      np_title: 'व्हाट्सएप अभिनन्दन छवि',
      description: 'Optimized for WhatsApp sharing (1080x1080px)',
      size: '1.8 MB',
      format: 'PNG',
      downloads: 3421,
      icon: '💬'
    },
    {
      id: 3,
      category: 'social',
      title: 'Facebook Banner',
      np_title: 'फेसबुक ब्यानर',
      description: 'Perfect for Facebook cover photos',
      size: '3.5 MB',
      format: 'JPG, PNG',
      downloads: 2156,
      icon: 'f'
    },
    {
      id: 4,
      category: 'captions',
      title: 'Social Media Captions (Bundle)',
      np_title: 'सामाजिक मिडिया मुखपृष्ठ',
      description: '50+ ready-to-post captions in English & Nepali',
      size: '0.8 MB',
      format: 'TXT, PDF',
      downloads: 892,
      icon: '✍️'
    },
    {
      id: 5,
      category: 'logos',
      title: 'High-Res Logo Pack',
      np_title: 'उच्च-रेस लोगो प्याकेज',
      description: 'All logo formats and variations',
      size: '5.2 MB',
      format: 'AI, PNG, SVG',
      downloads: 567,
      icon: '🎨'
    },
    {
      id: 6,
      category: 'videos',
      title: 'Campaign Video Template',
      np_title: 'अभिनन्दन भिडिओ टेम्प्लेट',
      description: '30-second video ready for editing',
      size: '245 MB',
      format: 'MP4',
      downloads: 445,
      icon: '🎬'
    },
    {
      id: 7,
      category: 'posters',
      title: 'Digital Billboard Design',
      np_title: 'डिजिटल विलबोर्ड डिजाइन',
      description: 'High-res for digital displays (1920x1080)',
      size: '6.8 MB',
      format: 'PSD, JPG',
      downloads: 334,
      icon: '📺'
    },
    {
      id: 8,
      category: 'captions',
      title: 'Instagram Story Templates',
      np_title: 'इन्स्टाग्राम कहानी टेम्प्लेट',
      description: '15 customizable story templates',
      size: '2.4 MB',
      format: 'PSD, PNG',
      downloads: 1567,
      icon: '📱'
    }
  ];

  const filteredCampaigns = selectedCategory === 'all' ? campaigns : campaigns.filter(c => c.category === selectedCategory);

  const categories = [
    { id: 'all', label: '📦 All Resources', icon: '📦' },
    { id: 'posters', label: '📄 Posters & Banners', icon: '📄' },
    { id: 'social', label: '💬 Social Media', icon: '💬' },
    { id: 'captions', label: '✍️ Captions & Text', icon: '✍️' },
    { id: 'logos', label: '🎨 Logos & Branding', icon: '🎨' },
    { id: 'videos', label: '🎬 Videos', icon: '🎬' }
  ];

  const sampleCaptions = [
    {
      platform: 'WhatsApp',
      caption: '🗳️ Make your voice heard! Democracy is in YOUR hands. Vote wisely, vote for change. Your vote counts!'
    },
    {
      platform: 'Facebook',
      caption: 'This election is about our collective future. Together, we can build a stronger nation. 🇳🇵 Vote on [DATE]!'
    },
    {
      platform: 'Instagram',
      caption: '✊ Change starts with you. Vote for progress. Vote for Nepal. 🗳️ #VoteForChange #Nepal2080'
    },
    {
      platform: 'Twitter',
      caption: 'Every vote matters. Make your voice count in the upcoming election. Register, vote, and inspire others! 🗳️ #ElectionDay'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-purple-600" />
            Digital Campaign Center
          </h1>
          <p className="text-xl text-gray-600">Download & share campaign materials to amplify your message</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold transition-all text-sm md:text-base ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="border-0 shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
              {/* Preview */}
              <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-6xl">{campaign.icon}</span>
              </div>

              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{campaign.title}</h3>
                <p className="text-purple-600 font-semibold text-sm mb-3">{campaign.np_title}</p>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold">Size</p>
                    <p>{campaign.size}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Format</p>
                    <p>{campaign.format}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold">Downloads: {campaign.downloads.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(campaign.id.toString(), campaign.title)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleShare(campaign.id.toString(), campaign.title)}
                    variant="outline"
                    className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Captions Section */}
        <Card className="border-0 shadow-lg mb-12 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="w-6 h-6" />
              Ready-to-Post Campaign Captions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleCaptions.map((item, idx) => (
                <div key={idx} className="p-6 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{item.platform}</h4>
                    <Button size="sm" variant="ghost" className="text-purple-600 hover:bg-purple-100">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{item.caption}</p>
                  <Button
                    onClick={() => copyCaption(item.caption)}
                    size="sm"
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
                  >
                    Copy & Share on {item.platform}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              💡 Campaign Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '📱 Social Media Strategy',
                  tips: [
                    'Post consistently on all platforms',
                    'Use trending hashtags relevant to elections',
                    'Engage with comments and messages',
                    'Share videos and images for higher engagement'
                  ]
                },
                {
                  title: '💬 WhatsApp Best Practices',
                  tips: [
                    'Share visually appealing images',
                    'Keep messages concise and impactful',
                    'Avoid spam - share valuable content',
                    'Encourage sharing within groups'
                  ]
                },
                {
                  title: '🎯 Targeting & Messaging',
                  tips: [
                    'Tailor message to your audience',
                    'Focus on local issues and needs',
                    'Use bilingual content (English & Nepali)',
                    'Tell compelling candidate stories'
                  ]
                },
                {
                  title: '📊 Measuring Success',
                  tips: [
                    'Track engagement metrics',
                    'Monitor reach and impressions',
                    'Ask for feedback from supporters',
                    'Adjust strategy based on results'
                  ]
                }
              ].map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-lg">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DigitalCampaignCenter;
