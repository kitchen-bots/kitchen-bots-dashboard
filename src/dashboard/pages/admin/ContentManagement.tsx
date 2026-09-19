import { useState } from 'react';
import { FileText, Globe, LayoutDashboard, Mail, Settings2, ShieldCheck } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageContainer } from '../../components/layout/PageContainer';

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
      description="Manage your website content, SEO, and static pages."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Content Management' }
      ]}
      actions={
        <>
          <button className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
            Preview Changes
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shadow-sm">
            Publish All
          </button>
        </>
      }
    >

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3">
          <nav className="space-y-1 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-9 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              {tabs.find(t => t.id === activeTab)?.label} Configuration
            </h2>
            
            <EmptyState
              title={`No content structure for ${activeTab} yet`}
              description="Use the CMS visual editor to drag and drop sections onto this page."
              action={{
                label: "Launch Visual Editor",
                onClick: () => {}
              }}
              icon={LayoutDashboard}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ContentManagement;
