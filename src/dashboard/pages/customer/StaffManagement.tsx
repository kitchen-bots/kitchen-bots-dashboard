import { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit,
  Lock,
  Search,
  RotateCcw,
  UserPlus,
  Users,
  MapPin,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';

interface StaffMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  businessUnit: string;
  hub: 'Mumbai South Hub' | 'Bengaluru Tech Hub' | 'Delhi Central';
  role: 'Admin' | 'Procurement' | 'Operator' | 'Staff Member';
  orders: number;
  status: 'Active' | 'Suspended';
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Priya Kapoor',
    initials: 'PK',
    email: 'priya.k@foodhubs.in',
    businessUnit: 'Spice Roots Ltd.',
    hub: 'Mumbai South Hub',
    role: 'Procurement',
    orders: 142,
    status: 'Active',
  },
  {
    id: 'staff-2',
    name: 'Rohan Das',
    initials: 'RD',
    email: 'rohan.das@currycloud.com',
    businessUnit: 'Curry Cloud',
    hub: 'Bengaluru Tech Hub',
    role: 'Admin',
    orders: 88,
    status: 'Active',
  },
  {
    id: 'staff-3',
    name: 'Vikram Khanna',
    initials: 'VK',
    email: 'v.khanna@tiffinbots.com',
    businessUnit: 'TiffinBots Hub',
    hub: 'Delhi Central',
    role: 'Procurement',
    orders: 204,
    status: 'Suspended',
  },
  {
    id: 'staff-4',
    name: 'Ananya Sharma',
    initials: 'AS',
    email: 'ananya.s@biryanicentral.com',
    businessUnit: 'Biryani Central',
    hub: 'Mumbai South Hub',
    role: 'Operator',
    orders: 95,
    status: 'Active',
  },
  {
    id: 'staff-5',
    name: 'Rajesh Nair',
    initials: 'RN',
    email: 'r.nair@malabarkitchen.in',
    businessUnit: 'Malabar Foods',
    hub: 'Bengaluru Tech Hub',
    role: 'Staff Member',
    orders: 52,
    status: 'Active',
  },
  {
    id: 'staff-6',
    name: 'Meera Patel',
    initials: 'MP',
    email: 'meera@gujaratbhojan.com',
    businessUnit: 'Gujarat Cloud Kitchen',
    hub: 'Delhi Central',
    role: 'Admin',
    orders: 173,
    status: 'Active',
  },
  {
    id: 'staff-7',
    name: 'Arjun Mehta',
    initials: 'AM',
    email: 'arjun.m@punjabgrill.org',
    businessUnit: 'North Feast Hub',
    hub: 'Delhi Central',
    role: 'Operator',
    orders: 61,
    status: 'Active',
  },
  {
    id: 'staff-8',
    name: 'Sunita Rao',
    initials: 'SR',
    email: 'sunita.rao@deccandishes.com',
    businessUnit: 'Deccan Culinary',
    hub: 'Mumbai South Hub',
    role: 'Procurement',
    orders: 118,
    status: 'Active',
  },
];

const HUB_OPTIONS = ['All Hubs', 'Mumbai South Hub', 'Bengaluru Tech Hub', 'Delhi Central'] as const;

export const StaffManagement = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('All Hubs');
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');

  // Add User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBusinessUnit, setNewBusinessUnit] = useState('');
  const [newHub, setNewHub] = useState<'Mumbai South Hub' | 'Bengaluru Tech Hub' | 'Delhi Central'>('Mumbai South Hub');
  const [newRole, setNewRole] = useState<'Admin' | 'Procurement' | 'Operator' | 'Staff Member'>('Staff Member');

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        searchQuery === '' ||
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.businessUnit.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHub = selectedHub === 'All Hubs' || staff.hub === selectedHub;
      const matchesRole = selectedRole === 'All Roles' || staff.role === selectedRole;
      const matchesStatus = selectedStatus === 'All Status' || staff.status === selectedStatus;

      return matchesSearch && matchesHub && matchesRole && matchesStatus;
    });
  }, [staffList, searchQuery, selectedHub, selectedRole, selectedStatus]);

  const hasActiveFilters =
    searchQuery !== '' || selectedHub !== 'All Hubs' || selectedRole !== 'All Roles' || selectedStatus !== 'All Status';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedHub('All Hubs');
    setSelectedRole('All Roles');
    setSelectedStatus('All Status');
  };

  const handleSaveUser = () => {
    if (!newName.trim() || !newEmail.trim()) return;

    const initials = newName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      initials: initials || 'KB',
      email: newEmail.trim(),
      businessUnit: newBusinessUnit.trim() || 'Kitchen Unit',
      hub: newHub,
      role: newRole,
      orders: 0,
      status: 'Active',
    };

    setStaffList((prev) => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewBusinessUnit('');
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

      {/* Main User Directory Section */}
      <Card className="w-full overflow-hidden flex flex-col">
        <CardHeader className="p-4 sm:p-5 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-semibold">User Directory</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Active accounts, permissions, and hub assignments across commercial zones
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredStaff.length}</span> of {staffList.length} staff
            </div>
          </div>

          {/* Hub Selection Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Hubs:
            </span>
            {HUB_OPTIONS.map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setSelectedHub(hub)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md transition-colors font-medium cursor-pointer',
                  selectedHub === hub
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                )}
              >
                {hub}
              </button>
            ))}
          </div>

          {/* Search and Dropdown Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, or business unit..."
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:ring-1 focus:ring-ring outline-hidden cursor-pointer"
              >
                <option value="All Roles">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Procurement">Procurement</option>
                <option value="Operator">Operator</option>
                <option value="Staff Member">Staff Member</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:ring-1 focus:ring-ring outline-hidden cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">USER</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">BUSINESS UNIT</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">ASSIGNED HUB</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">ROLE</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">ORDERS</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">STATUS</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                    No staff members match the selected criteria.
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                        Clear all filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((user) => (
                  <TableRow key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                          {user.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground whitespace-nowrap">{user.name}</span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-medium">
                      {user.businessUnit}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-foreground/80 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        {user.hub}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={
                          user.role === 'Admin'
                            ? 'default'
                            : user.role === 'Procurement'
                            ? 'secondary'
                            : user.role === 'Operator'
                            ? 'info'
                            : 'outline'
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-foreground font-medium whitespace-nowrap">
                      {user.orders}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {user.status === 'Active' ? (
                        <div className="flex items-center gap-1.5 text-emerald-500">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-500">
                          <AlertCircle size={14} />
                          <span className="text-xs font-medium">Suspended</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-foreground" title="Edit Staff Details">
                          <Edit size={14} />
                        </Button>
                        {user.status === 'Active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:text-rose-500"
                            title="Suspend User Account"
                            onClick={() => {
                              setStaffList((prev) =>
                                prev.map((u) => (u.id === user.id ? { ...u, status: 'Suspended' } : u))
                              );
                            }}
                          >
                            <Ban size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:text-emerald-500"
                            title="Reactivate User Account"
                            onClick={() => {
                              setStaffList((prev) =>
                                prev.map((u) => (u.id === user.id ? { ...u, status: 'Active' } : u))
                              );
                            }}
                          >
                            <Lock size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 bg-muted/10 text-xs text-muted-foreground">
          <span>
            Showing {filteredStaff.length} of {staffList.length} staff accounts
          </span>
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add Staff Member"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input
                placeholder="e.g. Anand Sharma"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Business Unit</label>
              <Input
                placeholder="e.g. Kitchen Corp"
                value={newBusinessUnit}
                onChange={(e) => setNewBusinessUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="e.g. anand@kitchencorp.in"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Assigned Hub</label>
              <select
                value={newHub}
                onChange={(e) => setNewHub(e.target.value as 'Mumbai South Hub' | 'Bengaluru Tech Hub' | 'Delhi Central')}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="Mumbai South Hub">Mumbai South Hub</option>
                <option value="Bengaluru Tech Hub">Bengaluru Tech Hub</option>
                <option value="Delhi Central">Delhi Central</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Assign Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Procurement' | 'Operator' | 'Staff Member')}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="Staff Member">Staff Member</option>
                <option value="Admin">Admin</option>
                <option value="Procurement">Procurement</option>
                <option value="Operator">Operator</option>
              </select>
            </div>
          </div>
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveUser} disabled={!newName.trim() || !newEmail.trim()}>
              Save Staff Member
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default StaffManagement;
