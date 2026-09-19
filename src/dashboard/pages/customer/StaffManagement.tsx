import { useState } from 'react';
import { Activity, AlertCircle, Ban, ChevronLeft, ChevronRight, Edit, Filter, Lock, LogIn, MoreVertical, RefreshCw, Settings, UserPlus, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Heading, Text } from '../../components/ui/Typography';
import { Modal } from '../../components/ui/Modal';

export const StaffManagement = () => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <div className="p-4 lg:p-10 relative">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4 mb-10">
        <div>
          <Heading level="h2">User Management</Heading>
          <Text variant="muted" className="mt-2">Manage customers, admins, procurement teams, and staff members across all hubs.</Text>
        </div>
        <Button 
          variant="default"
          onClick={() => setIsAddUserModalOpen(true)}
          className="gap-2"
        >
          <UserPlus size={20} />
          Add User
        </Button>
      </div>

      {/* Top Analytics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Users */}
        <Card className="bg-primary-50/50">
          <CardContent className="p-8 flex items-start justify-between">
            <div>
              <Text className="text-primary-600 text-sm font-medium">Total Users</Text>
              <Heading level="h3" className="mt-1">2,840</Heading>
              <Text className="text-primary-600 text-[12px] font-medium mt-2">+12% from last month</Text>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-blue-50/50">
          <CardContent className="p-8 flex items-start justify-between">
            <div>
              <Text className="text-blue-700 text-sm font-medium">Active Users</Text>
              <Heading level="h3" className="mt-1">1,920</Heading>
              <Text className="text-blue-700 text-[12px] font-medium mt-2">Currently online: 142</Text>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        {/* New Registrations */}
        <Card className="bg-purple-50/50">
          <CardContent className="p-8 flex items-start justify-between">
            <div>
              <Text className="text-purple-600 text-sm font-medium">New Registrations</Text>
              <Heading level="h3" className="mt-1">156</Heading>
              <Text className="text-purple-600 text-[12px] font-medium mt-2">Past 7 days</Text>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Suspended */}
        <Card className="bg-rose-50/50">
          <CardContent className="p-8 flex items-start justify-between">
            <div>
              <Text className="text-rose-600 text-sm font-medium">Suspended</Text>
              <Heading level="h3" className="mt-1">24</Heading>
              <Text className="text-rose-600 text-[12px] font-medium mt-2">Requires review</Text>
            </div>
            <div className="bg-rose-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Split */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Table Card Section */}
        <Card className="flex-1 w-full overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-border-default">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>User Directory</CardTitle>
                <div className="hidden md:flex gap-2">
                  <Badge variant="secondary">All Roles</Badge>
                  <Badge variant="secondary">Last 30 Days</Badge>
                </div>
              </div>
              <Button variant="ghost" className="text-primary-600 gap-1 hover:underline h-8">
                <Filter size={18} />
                Advanced Filters
              </Button>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-8 py-5 text-xs">USER</TableHead>
                  <TableHead className="px-6 py-5 text-xs">BUSINESS</TableHead>
                  <TableHead className="px-6 py-5 text-xs">ROLE</TableHead>
                  <TableHead className="px-6 py-5 text-xs">ORDERS</TableHead>
                  <TableHead className="px-6 py-5 text-xs">STATUS</TableHead>
                  <TableHead className="px-8 py-5 text-xs text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* User Row 1 */}
                <TableRow>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100/40 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">PK</div>
                      <div className="flex flex-col">
                        <Text className="font-semibold text-slate-900">Priya Kapoor</Text>
                        <Text variant="muted" className="text-xs">priya.k@foodhubs.in</Text>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-500">Spice Roots Ltd.</TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge className="bg-primary-50 text-primary-600 hover:bg-primary-100 border-none">Procurement</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-900 font-medium">142</TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-primary-600">
                      <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      <Text className="text-xs font-semibold">Active</Text>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-500">
                      <Button variant="ghost" size="icon" className="hover:text-primary-600"><Edit size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-rose-600"><Ban size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-slate-900"><MoreVertical size={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* User Row 2 */}
                <TableRow>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img className="w-10 h-10 rounded-full object-cover shrink-0" alt="Rohan Das" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" />
                      <div className="flex flex-col">
                        <Text className="font-semibold text-slate-900">Rohan Das</Text>
                        <Text variant="muted" className="text-xs">rohan.das@currycloud.com</Text>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-500">Curry Cloud</TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none">Admin</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-900 font-medium">88</TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-primary-600">
                      <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      <Text className="text-xs font-semibold">Active</Text>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-500">
                      <Button variant="ghost" size="icon" className="hover:text-primary-600"><Edit size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-rose-600"><Ban size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-slate-900"><MoreVertical size={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* User Row 3 */}
                <TableRow>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">SN</div>
                      <div className="flex flex-col">
                        <Text className="font-semibold text-slate-900">Sanya Nair</Text>
                        <Text variant="muted" className="text-xs">s.nair@delhigrill.in</Text>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-500">Delhi Grill Hub</TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge variant="secondary" className="border-none">Staff</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-900 font-medium">12</TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      <Text className="text-xs font-semibold">Offline</Text>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-500">
                      <Button variant="ghost" size="icon" className="hover:text-primary-600"><Edit size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-rose-600"><Ban size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-slate-900"><MoreVertical size={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* User Row 4 */}
                <TableRow>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm shrink-0">VK</div>
                      <div className="flex flex-col">
                        <Text className="font-semibold text-slate-900">Vikram Khanna</Text>
                        <Text variant="muted" className="text-xs">v.khanna@tiffinbots.com</Text>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-500">TiffinBots Hub</TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge className="bg-primary-50 text-primary-600 hover:bg-primary-100 border-none">Procurement</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-slate-900 font-medium">204</TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-rose-600">
                      <AlertCircle size={14} />
                      <Text className="text-xs font-semibold">Suspended</Text>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-500">
                      <Button variant="ghost" size="icon" className="hover:text-primary-600"><Edit size={18} /></Button>
                      <Button variant="ghost" size="icon" className="text-primary-600 hover:text-primary-700"><Lock size={18} /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-slate-900"><MoreVertical size={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="p-6 border-t border-border-default flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <Text variant="muted" className="text-sm">Showing 4 of 2,840 users</Text>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="default" size="icon" className="w-10 h-10 rounded-full">1</Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">2</Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">3</Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Side Sidebar Panels */}
        <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
          {/* Quick Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="cursor-pointer bg-primary-100 text-primary-700 hover:bg-primary-200 border-none">All Users</Badge>
                  <Badge variant="secondary" className="cursor-pointer border-none bg-slate-100 hover:bg-slate-200">Admins</Badge>
                  <Badge variant="secondary" className="cursor-pointer border-none bg-slate-100 hover:bg-slate-200">Procurement</Badge>
                  <Badge variant="secondary" className="cursor-pointer border-none bg-slate-100 hover:bg-slate-200">Staff</Badge>
                  <Badge variant="secondary" className="cursor-pointer border-none bg-slate-100 hover:bg-slate-200">Inactive</Badge>
                </div>
                <div className="pt-4 border-t border-border-default">
                  <Heading level="h5" className="mb-3">Kitchen Hubs</Heading>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input defaultChecked className="rounded border-border-default text-primary-600 focus:ring-primary-500 w-4 h-4" type="checkbox" />
                      <Text variant="muted" className="text-sm">Mumbai South Hub</Text>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input className="rounded border-border-default text-primary-600 focus:ring-primary-500 w-4 h-4" type="checkbox" />
                      <Text variant="muted" className="text-sm">Bengaluru Tech Hub</Text>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input className="rounded border-border-default text-primary-600 focus:ring-primary-500 w-4 h-4" type="checkbox" />
                      <Text variant="muted" className="text-sm">Delhi Central</Text>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600">
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pt-2">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <LogIn className="text-primary-600 w-[16px] h-[16px]" />
                  </div>
                  <div>
                    <Text className="text-sm">Priya Kapoor <Text variant="muted" className="inline text-sm">logged in</Text></Text>
                    <Text variant="muted" className="text-xs mt-1">2 minutes ago • IP 192.168.1.1</Text>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="text-blue-600 w-[16px] h-[16px]" />
                  </div>
                  <div>
                    <Text className="text-sm">New Staff <Text variant="muted" className="inline text-sm">added by Arjun</Text></Text>
                    <Text variant="muted" className="text-xs mt-1">45 minutes ago</Text>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <Lock className="text-rose-600 w-[16px] h-[16px]" />
                  </div>
                  <div>
                    <Text className="text-sm">Vikram Khanna <Text variant="muted" className="inline text-sm">suspended</Text></Text>
                    <Text variant="muted" className="text-xs mt-1">3 hours ago • Policy Violation</Text>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="text-slate-500 w-[16px] h-[16px]" />
                  </div>
                  <div>
                    <Text className="text-sm">Permissions <Text variant="muted" className="inline text-sm">updated for Admin</Text></Text>
                    <Text variant="muted" className="text-xs mt-1">Yesterday, 4:20 PM</Text>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Quick Add User"
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Full Name</label>
              <Input placeholder="John Doe" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Business Unit</label>
              <Input placeholder="Kitchen Corp" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Email Address</label>
            <Input type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Assign Role</label>
            <select className="flex h-10 w-full items-center justify-between rounded-md border border-border-default bg-surface px-3 py-2 text-sm ring-offset-surface focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50">
              <option>Staff Member</option>
              <option>Admin</option>
              <option>Procurement Team</option>
            </select>
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsAddUserModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => setIsAddUserModalOpen(false)}
            >
              Save User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagement;
