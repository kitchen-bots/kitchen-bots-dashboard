import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  History,
  Home,
  Mail,
  Phone,
  Receipt,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const UserDetails = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="User Profile: Priya Kapoor"
      description="Procurement Manager account, organizational hierarchy, and assigned commercial units."
      homeHref="/dashboard"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Staff', href: '/dashboard/staff' },
        { label: 'Priya Kapoor' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-1.5"
            title="Return to Home Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/staff')}
            className="gap-1.5"
            title="Return to Staff Directory"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Staff</span>
          </Button>
          <Button size="sm" className="gap-1.5">
            <Mail className="w-4 h-4" />
            <span>Message User</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (Main Details) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Hero Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-xl text-foreground shrink-0">
                  PK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Priya Kapoor</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Procurement Manager at Spice Roots Ltd.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Active
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      priya.k@spiceroots.in
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      +91 98765 43210
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border">
                <Button size="sm" variant="outline">
                  Edit Profile
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600">
                  Suspend Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bento Grid Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Details */}
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Business Entity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Registered Facility</p>
                  <p className="font-semibold text-foreground">
                    45 Culinary Heights, Koramangala, Bengaluru 560034
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Tax Identifier / GSTIN</p>
                  <p className="font-semibold text-foreground font-mono">29ABCDE1234F1Z5</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Account Registered</p>
                  <p className="font-semibold text-foreground">October 12, 2022</p>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Active Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Place Commercial Orders</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Manage Fleet Inventory</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>View Billing & Invoices</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground line-through">
                  <XCircle className="w-4 h-4" />
                  <span>System Configuration</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Recent Transaction Activity
                </CardTitle>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                    <th className="p-3 pl-4">Order ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Valuation</th>
                    <th className="p-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 pl-4 font-mono font-medium text-foreground">#ORD-8902</td>
                    <td className="p-3 text-muted-foreground">Today, 10:42 AM</td>
                    <td className="p-3 font-semibold text-foreground">₹42,500</td>
                    <td className="p-3 pr-4">
                      <Badge variant="secondary">Processing</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 pl-4 font-mono font-medium text-foreground">#ORD-8875</td>
                    <td className="p-3 text-muted-foreground">Oct 24, 2023</td>
                    <td className="p-3 font-semibold text-foreground">₹18,200</td>
                    <td className="p-3 pr-4">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Delivered
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (Sidebar/Meta) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Admin Notes */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Operational Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <textarea
                className="w-full bg-background border border-input rounded-md p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring resize-none h-24 placeholder:text-muted-foreground transition-colors"
                placeholder="Internal fulfillment and communication notes..."
              />
              <Button size="sm" className="w-full">
                Save Note
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="font-medium text-foreground">Placed Order #ORD-8902</span>
                  <span className="text-[11px] text-muted-foreground">10:42 AM</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="font-medium text-foreground">Updated Delivery Address</span>
                  <span className="text-[11px] text-muted-foreground">Yesterday</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Authenticated via Web Portal</span>
                  <span className="text-[11px] text-muted-foreground">Oct 24</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default UserDetails;
