import React, { useState } from 'react';
import {
  FileText,
  Globe,
  Mail,
  Settings2,
  ShieldCheck,
  Eye,
  UploadCloud,
  Save,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

type TabKey = 'homepage' | 'about' | 'contact' | 'policies' | 'seo';

interface ContentSettings {
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    ctaLink: string;
    announcementBanner: string;
  };
  about: {
    headline: string;
    mission: string;
    facilityLocations: string;
    establishedYear: string;
  };
  contact: {
    supportEmail: string;
    salesEmail: string;
    hotline: string;
    headquarters: string;
    operatingHours: string;
  };
  policies: {
    warrantyPolicy: string;
    amcTerms: string;
    privacyNotice: string;
  };
  seo: {
    siteTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

const DEFAULT_CONTENT: ContentSettings = {
  homepage: {
    heroTitle: 'Autonomous Commercial Kitchen Robotics',
    heroSubtitle: 'Next-generation industrial automation for high-volume quick service restaurants and commercial kitchens.',
    ctaText: 'Explore Commercial Catalog',
    ctaLink: '/dashboard/products',
    announcementBanner: 'Now deploying Q4 Batch 2 across metro commercial kitchens in India.',
  },
  about: {
    headline: 'Engineering the Future of Commercial Food Production',
    mission: 'Empowering hospitality businesses with reliable, precision-engineered automated cooking robots and IoT fleet diagnostics.',
    facilityLocations: 'Bengaluru, Mumbai, Delhi-NCR, Hyderabad',
    establishedYear: '2021',
  },
  contact: {
    supportEmail: 'ops@kitchenbots.in',
    salesEmail: 'sales@kitchenbots.in',
    hotline: '+91 80 4000 5000',
    headquarters: 'Kitchen Bots Tech Park, Electronic City Phase 1, Bengaluru 560100',
    operatingHours: '08:00 to 20:00 IST (Mon-Sat)',
  },
  policies: {
    warrantyPolicy: 'All commercial units carry a comprehensive 12-month factory parts and labor warranty.',
    amcTerms: 'Quarterly preventive maintenance visits, priority SLA dispatch within 4 hours, and genuine replacement parts coverage.',
    privacyNotice: 'Operational telemetry and kitchen metrics are strictly encrypted and governed by ISO/IEC 27001 standards.',
  },
  seo: {
    siteTitle: 'Kitchen Bots | Commercial Kitchen Automation & Robotics',
    metaDescription: 'Industrial food robotics, automated woks, fryers, and fleet management for commercial restaurants.',
    keywords: 'commercial kitchen robots, automated restaurant cooking, cloud kitchen automation, food robotics india',
  },
};

const STORAGE_KEY = 'kb_content_management_state';

export const ContentManagement: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('homepage');
  const [content, setContent] = useState<ContentSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore parse error
    }
    return DEFAULT_CONTENT;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'homepage', label: 'Homepage', icon: Globe },
    { id: 'about', label: 'About Us', icon: FileText },
    { id: 'contact', label: 'Contact Settings', icon: Mail },
    { id: 'policies', label: 'Legal & Policies', icon: ShieldCheck },
    { id: 'seo', label: 'Global SEO', icon: Settings2 },
  ];

  const handleUpdate = <K extends TabKey>(section: K, field: keyof ContentSettings[K], value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = (silent = false) => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      if (!silent) {
        showToast('Published', 'Portal content configuration saved successfully.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to persist content.', 'error');
    } finally {
      setTimeout(() => setIsSaving(false), 400);
    }
  };

  return (
    <PageContainer
      title="Content Management"
      description="Manage customer-facing portal documentation, legal disclosures, and commercial catalogs."
      homeHref="/admin"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Content Management' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Portal</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave()}
            isLoading={isSaving}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publish All</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Navigation */}
        <div className="md:col-span-3">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Right Configuration Form */}
        <div className="md:col-span-9 space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  {tabs.find((t) => t.id === activeTab)?.label} Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Review and edit customer-visible portal sections.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleSave()}
                isLoading={isSaving}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Section</span>
              </Button>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
              {/* Homepage Tab */}
              {activeTab === 'homepage' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Hero Banner Headline
                    </label>
                    <Input
                      value={content.homepage.heroTitle}
                      onChange={(e) => handleUpdate('homepage', 'heroTitle', e.target.value)}
                      placeholder="e.g. Autonomous Commercial Kitchen Robotics"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Hero Subtitle / Description
                    </label>
                    <textarea
                      rows={3}
                      value={content.homepage.heroSubtitle}
                      onChange={(e) => handleUpdate('homepage', 'heroSubtitle', e.target.value)}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Primary CTA Label
                      </label>
                      <Input
                        value={content.homepage.ctaText}
                        onChange={(e) => handleUpdate('homepage', 'ctaText', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        CTA Destination Link
                      </label>
                      <Input
                        value={content.homepage.ctaLink}
                        onChange={(e) => handleUpdate('homepage', 'ctaLink', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Announcement Bar Banner
                    </label>
                    <Input
                      value={content.homepage.announcementBanner}
                      onChange={(e) => handleUpdate('homepage', 'announcementBanner', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* About Us Tab */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      About Headline
                    </label>
                    <Input
                      value={content.about.headline}
                      onChange={(e) => handleUpdate('about', 'headline', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Corporate Mission Statement
                    </label>
                    <textarea
                      rows={3}
                      value={content.about.mission}
                      onChange={(e) => handleUpdate('about', 'mission', e.target.value)}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Regional Facilities & Hubs
                      </label>
                      <Input
                        value={content.about.facilityLocations}
                        onChange={(e) => handleUpdate('about', 'facilityLocations', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Established Year
                      </label>
                      <Input
                        value={content.about.establishedYear}
                        onChange={(e) => handleUpdate('about', 'establishedYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Settings Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Operations Support Email
                      </label>
                      <Input
                        type="email"
                        value={content.contact.supportEmail}
                        onChange={(e) => handleUpdate('contact', 'supportEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Commercial Sales Email
                      </label>
                      <Input
                        type="email"
                        value={content.contact.salesEmail}
                        onChange={(e) => handleUpdate('contact', 'salesEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Support Hotline
                      </label>
                      <Input
                        value={content.contact.hotline}
                        onChange={(e) => handleUpdate('contact', 'hotline', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Operating Hours
                      </label>
                      <Input
                        value={content.contact.operatingHours}
                        onChange={(e) => handleUpdate('contact', 'operatingHours', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Headquarters Postal Address
                    </label>
                    <Input
                      value={content.contact.headquarters}
                      onChange={(e) => handleUpdate('contact', 'headquarters', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === 'policies' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Warranty Policy Disclosure
                    </label>
                    <textarea
                      rows={3}
                      value={content.policies.warrantyPolicy}
                      onChange={(e) => handleUpdate('policies', 'warrantyPolicy', e.target.value)}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Annual Maintenance Contract (AMC) Terms
                    </label>
                    <textarea
                      rows={3}
                      value={content.policies.amcTerms}
                      onChange={(e) => handleUpdate('policies', 'amcTerms', e.target.value)}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Privacy & Data Encryption Notice
                    </label>
                    <textarea
                      rows={3}
                      value={content.policies.privacyNotice}
                      onChange={(e) => handleUpdate('policies', 'privacyNotice', e.target.value)}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Global SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Portal Meta Title
                    </label>
                    <Input
                      value={content.seo.siteTitle}
                      onChange={(e) => handleUpdate('seo', 'siteTitle', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Meta Description (Search Snippet)
                    </label>
                    <textarea
                      rows={3}
                      value={content.seo.metaDescription}
                      onChange={(e) => handleUpdate('seo', 'metaDescription', e.target.value)}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Meta Keywords (Comma-delimited)
                    </label>
                    <Input
                      value={content.seo.keywords}
                      onChange={(e) => handleUpdate('seo', 'keywords', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Portal Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Portal Public Preview"
        description="Simulated customer view of configured public pages and metadata."
      >
        <div className="space-y-4 py-2 text-xs">
          {/* Announcement Bar */}
          {content.homepage.announcementBanner && (
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-center font-medium text-primary text-xs flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{content.homepage.announcementBanner}</span>
            </div>
          )}

          {/* Hero Section Preview */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <Badge variant="outline" className="text-[10px]">Portal Hero Section</Badge>
            <h2 className="text-base font-bold text-foreground">{content.homepage.heroTitle}</h2>
            <p className="text-muted-foreground leading-relaxed">{content.homepage.heroSubtitle}</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs">
                {content.homepage.ctaText}
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* About Us & Contact Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-foreground block">Corporate Mission</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{content.about.mission}</p>
              <p className="text-[11px] text-muted-foreground font-mono pt-1">
                Hubs: {content.about.facilityLocations}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-foreground block">Operations Contact</span>
              <p className="text-muted-foreground text-[11px]">Phone: {content.contact.hotline}</p>
              <p className="text-muted-foreground text-[11px]">Email: {content.contact.supportEmail}</p>
              <p className="text-[11px] text-muted-foreground">Hours: {content.contact.operatingHours}</p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-2.5 rounded-lg border border-border bg-muted/10 text-[11px] text-muted-foreground">
            <strong>Warranty Notice:</strong> {content.policies.warrantyPolicy}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(false)}
              className="text-xs cursor-pointer"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ContentManagement;
