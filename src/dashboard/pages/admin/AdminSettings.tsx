import { useState, useEffect } from 'react';
import {
  Blocks,
  CreditCard,
  ExternalLink,
  Lock,
  MoreVertical,
  Plus,
  Shield,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { userService } from '../../services/userService';
import { AdminSettingsState } from '../../api/settings.api';
import { User } from '../../types';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../context/ToastContext';
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

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsState | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        settingsService.getSettings(),
        userService.getUsers(),
      ]);
      setSettings(settingsRes);
      setTeamMembers(usersRes.data);
    } catch (err) {
      console.error('Error fetching settings data', err);
      setErrorState('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      showToast('Settings saved', 'All changes synced to cloud.', 'success');
    } catch (err) {
      console.error('Error saving settings', err);
      showToast('Update failed', 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (field: keyof AdminSettingsState, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (errorState || !settings) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <ErrorState message={errorState || 'Failed to load settings'} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <PageContainer
      title="Admin Settings"
      description="Manage platform identity, operational preferences, security policies, and team permissions."
      homeHref="/admin"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Settings' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            Discard
          </Button>
          <Button size="sm" onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">General Profile</CardTitle>
                <CardDescription className="text-xs">
                  Instance naming and localized environment preferences
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Instance Name</label>
                  <input
                    type="text"
                    value={settings.instanceName}
                    onChange={(e) => handleSettingChange('instanceName', e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Default Language</label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer transition-colors"
                  >
                    <option>English (India)</option>
                    <option>Hindi</option>
                    <option>Bengali</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer transition-colors"
                  >
                    <option>(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                    <option>(GMT+00:00) UTC</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Permissions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Team Permissions</CardTitle>
                  <CardDescription className="text-xs">
                    Assigned operator roles and granular platform access
                  </CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus size={14} />
                <span>Invite Member</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teamMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border border-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center font-semibold text-xs text-foreground border border-border">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? 'Full Access' : 'Restricted'}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                        <MoreVertical size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Notification Alerts</CardTitle>
              <CardDescription className="text-xs">Dispatch triggers and critical messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-medium text-foreground">Email Reports</p>
                  <p className="text-[11px] text-muted-foreground">Daily digest of operations</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailReports}
                  onChange={(e) => handleSettingChange('emailReports', e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Push Alerts</p>
                  <p className="text-[11px] text-muted-foreground">Real-time service ticket updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushAlerts}
                  onChange={(e) => handleSettingChange('pushAlerts', e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Billing Updates</p>
                  <p className="text-[11px] text-muted-foreground">Invoice receipts and tax statements</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.billingUpdates}
                  onChange={(e) => handleSettingChange('billingUpdates', e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Integrations Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">System Integrations</CardTitle>
                <CardDescription className="text-xs">Connected gateway services</CardDescription>
              </div>
              <Zap className="text-primary w-4 h-4" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-md border border-border">
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-foreground border border-border">
                  <Blocks size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Stripe Gateway</p>
                  <p className="text-[10px] text-muted-foreground">Live Commercial Terminal</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-md border border-border">
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-foreground border border-border">
                  <Blocks size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Cloudflare Worker</p>
                  <p className="text-[10px] text-muted-foreground">Edge Routing Active</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
              </div>

              <Button variant="ghost" size="sm" className="w-full text-xs text-primary mt-1">
                Manage API Keys
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Security and Billing Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Security & Authentication</CardTitle>
                <CardDescription className="text-xs">
                  Session authentication and compliance safeguards
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <p className="font-semibold text-xs text-foreground">Two-Factor Authentication</p>
                  <p className="text-[11px] text-muted-foreground">Enforce OTP verification on sign-in</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-foreground">Active Web Sessions</p>
                  <p className="text-[11px] text-muted-foreground">Logged in across 3 authorized browsers</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                  <ExternalLink size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Commercial Subscription</CardTitle>
                <CardDescription className="text-xs">
                  Billing cycle and enterprise license tier
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Current License
                  </p>
                  <p className="text-base font-bold text-foreground">Enterprise Fleet Ops</p>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-muted-foreground">Next invoice scheduled: Nov 1, 2024</span>
                <span className="font-bold text-foreground">₹42,000 / mo</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default AdminSettings;
