import { useState } from 'react';
import { FileText, Globe, LayoutDashboard, Mail, Settings2, ShieldCheck, Eye, UploadCloud } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState<'homepage' | 'about' | 'contact' | 'policies' | 'seo'>('homepage');

  const tabs = [
    { id: 'homepage', label: 'Homepage', icon: Globe },
    { id: 'about', label: 'About Us', icon: FileText },
    { id: 'contact', label: 'Contact Settings', icon: Mail },
    { id: 'policies', label: 'Legal & Policies', icon: ShieldCheck },
    { id: 'seo', label: 'Global SEO', icon: Settings2 },
  ];

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Preview Portal</span>
          </Button>
          <Button size="sm" className="gap-1.5">
            <UploadCloud className="w-4 h-4" />
            <span>Publish All</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-3">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="md:col-span-9 space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">
                {tabs.find((t) => t.id === activeTab)?.label} Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <EmptyState
                title={`No content structure for ${activeTab} yet`}
                description="Configure visual portal sections and published marketing copy using the centralized layout system."
                action={{
                  label: 'Launch Content Editor',
                  onClick: () => {},
                }}
                icon={LayoutDashboard}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ContentManagement;
