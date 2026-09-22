import { useState } from 'react';
import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Eye,
  Globe,
  Moon,
  Sun,
  User,
  Shield,
  Check,
  Save,
  EyeOff,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences';

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
];

export const CustomerSettings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    serviceAlerts: true,
    promotions: false,
    weeklyReport: true,
    smsAlerts: false,
    appNotifications: true,
  });

  const handleSave = () => {
    setSaved(true);
    showToast('Settings saved', 'Profile and preferences updated.', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageContainer
      title="Settings"
      description="Manage account details, security credentials, notification preferences, and billing."
      homeHref="/dashboard"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings' },
      ]}
      actions={
        <Button onClick={handleSave} size="sm" className="gap-1.5">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </Button>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <Card className="w-full lg:w-64 shrink-0 p-2">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            ))}
          </nav>
        </Card>

        {/* Main Panel */}
        <div className="flex-1 space-y-6 w-full">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Profile Information</CardTitle>
                <CardDescription className="text-xs">
                  Commercial operator details and verified contact phone
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <div className="h-16 w-16 rounded-lg bg-muted border border-border flex items-center justify-center text-xl font-bold text-foreground">
                    RM
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Raj Malhotra</h3>
                    <p className="text-xs text-muted-foreground">raj.malhotra@kitchenbots.in</p>
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Raj"
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Malhotra"
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="raj.malhotra@kitchenbots.in"
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Facility Shipping Address
                    </label>
                    <textarea
                      defaultValue="12B, Food Court Complex, Andheri East, Mumbai - 400069"
                      rows={2}
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Commercial Entity Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Raj Food Services Pvt. Ltd."
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        GST Identification Number
                      </label>
                      <input
                        type="text"
                        defaultValue="27AAABM1234C1ZP"
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Choose updates and communications delivery channels
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-border">
                {[
                  { key: 'orderUpdates', label: 'Order Updates', desc: 'Freight tracking, dispatch, and delivery confirmations' },
                  { key: 'serviceAlerts', label: 'Service Alerts', desc: 'Scheduled maintenance and equipment error telemetry' },
                  { key: 'promotions', label: 'Promotions', desc: 'Commercial equipment launches and discount programs' },
                  { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Digest of fleet operations and consumption metrics' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical downtime warnings delivered via mobile SMS' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="font-medium text-xs text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof notifications],
                        }))
                      }
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">Security & Authentication</CardTitle>
                  <CardDescription className="text-xs">
                    Update credential password and configure multi-factor checks
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button size="sm" className="mt-2">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Status: Disabled</p>
                    <p className="text-[11px] text-muted-foreground">
                      Require OTP SMS verification on unrecognized commercial logins
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Subscription Plan</CardTitle>
                <CardDescription className="text-xs">
                  Current enterprise license and active kitchen units
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Enterprise Fleet Pro</span>
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ₹49,999 / yr • Annual billing renewed on Jan 1, 2025
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Download Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Application Appearance</CardTitle>
                <CardDescription className="text-xs">
                  Toggle interface styling and locale formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Display Theme
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="gap-1.5"
                    >
                      <Moon className="w-4 h-4" />
                      <span>Pitch Dark</span>
                    </Button>
                    <Button
                      type="button"
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="gap-1.5"
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Currency Formatting
                  </label>
                  <select className="w-full max-w-xs bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer">
                    <option>INR (₹) - Indian Rupee</option>
                    <option>USD ($) - US Dollar</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default CustomerSettings;
