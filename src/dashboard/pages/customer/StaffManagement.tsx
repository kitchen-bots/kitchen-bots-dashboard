import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit,
  Lock,
  UserPlus,
  Users,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const StaffManagement = () => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <PageContainer
      title="Staff & User Directory"
      description="Manage operators, hub procurement teams, and facility staff accounts across commercial zones."
      homeHref="/dashboard"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Staff Management' },
      ]}
      actions={
        <Button onClick={() => setIsAddUserModalOpen(true)} size="sm" className="gap-2">
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </Button>
      }
    >
      {/* Top Analytics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">2,840</div>
            <p className="text-[11px] text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Operators
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-emerald-500">1,920</div>
            <p className="text-[11px] text-muted-foreground mt-1">Currently online: 142</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              New Registrations
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-primary">
              <UserPlus className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">156</div>
            <p className="text-[11px] text-muted-foreground mt-1">Past 7 days onboarded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suspended
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-rose-500">24</div>
            <p className="text-[11px] text-muted-foreground mt-1">Requires review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Split */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Table Card Section */}
        <Card className="flex-1 w-full overflow-hidden flex flex-col">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <CardTitle className="text-sm font-semibold">User Directory</CardTitle>
                <CardDescription className="text-xs">
                  Active accounts, permissions, and hub assignments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border text-xs">
                  <TableHead className="px-4 py-3 text-xs">USER</TableHead>
                  <TableHead className="px-4 py-3 text-xs">BUSINESS UNIT</TableHead>
                  <TableHead className="px-4 py-3 text-xs">ROLE</TableHead>
                  <TableHead className="px-4 py-3 text-xs">ORDERS</TableHead>
                  <TableHead className="px-4 py-3 text-xs">STATUS</TableHead>
                  <TableHead className="px-4 py-3 text-xs text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* User Row 1 */}
                <TableRow className="border-b border-border hover:bg-muted/20">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                        PK
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">Priya Kapoor</span>
                        <span className="text-[11px] text-muted-foreground">priya.k@foodhubs.in</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">Spice Roots Ltd.</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">Procurement</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-foreground font-medium">142</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit size={14} /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-rose-500"><Ban size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* User Row 2 */}
                <TableRow className="border-b border-border hover:bg-muted/20">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                        RD
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">Rohan Das</span>
                        <span className="text-[11px] text-muted-foreground">rohan.das@currycloud.com</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">Curry Cloud</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="default">Admin</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-foreground font-medium">88</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit size={14} /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-rose-500"><Ban size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* User Row 3 */}
                <TableRow className="border-b border-border hover:bg-muted/20">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                        VK
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">Vikram Khanna</span>
                        <span className="text-[11px] text-muted-foreground">v.khanna@tiffinbots.com</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">TiffinBots Hub</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="outline">Procurement</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-foreground font-medium">204</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <AlertCircle size={14} />
                      <span className="text-xs font-medium">Suspended</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit size={14} /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-primary"><Lock size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="p-3 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 bg-muted/10 text-xs text-muted-foreground">
            <span>Showing 3 of 2,840 users</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar Filter Panel */}
        <div className="w-full lg:w-72 space-y-4 shrink-0">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">Hub Filtering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input defaultChecked className="rounded border-input text-primary focus:ring-ring w-4 h-4" type="checkbox" />
                  <span className="text-foreground">Mumbai South Hub</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input className="rounded border-input text-primary focus:ring-ring w-4 h-4" type="checkbox" />
                  <span className="text-foreground">Bengaluru Tech Hub</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input className="rounded border-input text-primary focus:ring-ring w-4 h-4" type="checkbox" />
                  <span className="text-foreground">Delhi Central</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add User"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Business Unit</label>
              <Input placeholder="Kitchen Corp" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email Address</label>
            <Input type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Assign Role</label>
            <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring">
              <option>Staff Member</option>
              <option>Admin</option>
              <option>Procurement Team</option>
            </select>
          </div>
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsAddUserModalOpen(false)}>
              Save User
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default StaffManagement;
