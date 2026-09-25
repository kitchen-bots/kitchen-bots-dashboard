import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit,
  RotateCcw,
  Search,
  UserCheck,
  UserPlus,
  Users,
  MapPin,
  Trash2,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { cn } from '../../utils/cn';

// Staff record as stored/returned by the backend.
// We use the canonical User type plus optional extra fields.
type StaffUser = User & {
  businessUnit?: string;
  hub?: string;
  orders?: number;
};

const ROLE_OPTIONS = ['All Roles', 'admin', 'manager', 'customer', 'Service', 'Ops'];
const STATUS_OPTIONS = ['All Status', 'active', 'suspended'];

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'KB';
}

function newRegistrations(users: StaffUser[]): number {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // last 30 days
  return users.filter((u) => {
    if (!u.createdAt) return false;
    return new Date(u.createdAt).getTime() >= cutoff;
  }).length;
}

export const StaffManagement = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const homePath = isAdmin ? '/admin' : '/dashboard';
  const homeLabel = isAdmin ? 'Admin' : 'Dashboard';
  const { showToast } = useToast();

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState('All Hubs');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Add user modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBusinessUnit, setNewBusinessUnit] = useState('');
  const [newHub, setNewHub] = useState('');
  const [newRole, setNewRole] = useState('customer');
  const [isSaving, setIsSaving] = useState(false);

  // Edit user modal
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBusinessUnit, setEditBusinessUnit] = useState('');
  const [editHub, setEditHub] = useState('');
  const [editRole, setEditRole] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await userService.getUsers();
      setUsers(res.data as StaffUser[]);
    } catch (err: any) {
      console.error('Failed to load users', err);
      setError(err?.message || 'Failed to load users from backend.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Derive unique hubs from real data
  const hubOptions = useMemo(() => {
    const hubs = new Set(users.map((u) => u.hub).filter(Boolean) as string[]);
    return ['All Hubs', ...Array.from(hubs).sort()];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchQuery === '' ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.businessUnit || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHub = selectedHub === 'All Hubs' || u.hub === selectedHub;
      const matchesRole = selectedRole === 'All Roles' || u.role === selectedRole;
      const matchesStatus = selectedStatus === 'All Status' || u.status === selectedStatus;

      return matchesSearch && matchesHub && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedHub, selectedRole, selectedStatus]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedHub !== 'All Hubs' ||
    selectedRole !== 'All Roles' ||
    selectedStatus !== 'All Status';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedHub('All Hubs');
    setSelectedRole('All Roles');
    setSelectedStatus('All Status');
  };

  // KPIs derived from real data
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const newRegCount = newRegistrations(users);

  // Add user
  const handleAddUser = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setIsSaving(true);
    try {
      const created = await userService.createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        status: 'active',
        businessUnit: newBusinessUnit.trim() || undefined,
        hub: newHub.trim() || undefined,
      });
      setUsers((prev) => [created as StaffUser, ...prev]);
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewBusinessUnit('');
      setNewHub('');
      setNewRole('customer');
      showToast('Staff Added', `${created.name} has been added.`, 'success');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add staff member.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open edit modal
  const openEdit = (u: StaffUser) => {
    setEditUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditBusinessUnit(u.businessUnit || '');
    setEditHub(u.hub || '');
    setEditRole(u.role);
  };

  // Save edit
  const handleEditSave = async () => {
    if (!editUser) return;
    setIsEditSaving(true);
    try {
      const updated = await userService.updateUser(editUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole as any,
        businessUnit: editBusinessUnit.trim() || undefined,
        hub: editHub.trim() || undefined,
      });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...updated } as StaffUser : u)));
      setEditUser(null);
      showToast('Updated', `${updated.name} has been updated.`, 'success');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to update user.', 'error');
    } finally {
      setIsEditSaving(false);
    }
  };

  // Suspend / activate
  const handleToggleStatus = async (u: StaffUser) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await userService.updateUserStatus(u.id, newStatus);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: updated.status } as StaffUser : x)));
      showToast(
        newStatus === 'suspended' ? 'Suspended' : 'Activated',
        `${u.name} is now ${newStatus}.`,
        'success'
      );
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to update status.', 'error');
    }
  };

  // Delete
  const handleDelete = async (u: StaffUser) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await userService.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      showToast('Deleted', `${u.name} removed.`, 'success');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to delete user.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <PageContainer
      title="Staff & User Directory"
      description="Manage staff accounts across commercial zones. Data sourced from Firestore."
      homeHref={homePath}
      breadcrumbs={[
        { label: homeLabel, href: homePath },
        { label: 'Staff Management' },
      ]}
      actions={
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </Button>
      }
    >
      {/* Error state */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={loadUsers}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards - computed from real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalUsers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Firestore staff accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-emerald-500">{activeCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New (30 days)</span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-primary">
              <UserPlus className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{newRegCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Onboarded in past 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suspended</span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-rose-500">{suspendedCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Requires review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main table */}
      <Card className="w-full overflow-hidden flex flex-col">
        <CardHeader className="p-4 sm:p-5 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-semibold">User Directory</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Live from Firestore — all edits persist immediately
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredUsers.length}</span> of {users.length} users
            </div>
          </div>

          {/* Hub filter pills — derived from real data */}
          {hubOptions.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Hubs:
              </span>
              {hubOptions.map((hub) => (
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
          )}

          {/* Search and dropdowns */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or business unit..."
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:ring-1 focus:ring-ring outline-hidden cursor-pointer"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:ring-1 focus:ring-ring outline-hidden cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === 'All Status' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">USER</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">BUSINESS UNIT</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">HUB</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">ROLE</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap">STATUS</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                    {users.length === 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-8 h-8 text-muted-foreground/30" />
                        <p>No staff accounts in Firestore yet.</p>
                        <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 text-xs">
                          <UserPlus className="w-3.5 h-3.5" />
                          Add the first staff member
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <p>No users match the selected filters.</p>
                        <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                          Clear filters
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                          {initials(user.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground whitespace-nowrap">{user.name}</span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-medium">
                      {user.businessUnit || <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {user.hub ? (
                        <span className="text-xs text-foreground/80 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          {user.hub}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {user.status === 'active' ? (
                        <div className="flex items-center gap-1.5 text-emerald-500">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:text-foreground"
                          title="Edit user"
                          onClick={() => openEdit(user)}
                        >
                          <Edit size={14} />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:text-rose-500"
                            title="Suspend user"
                            onClick={() => handleToggleStatus(user)}
                          >
                            <Ban size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:text-emerald-500"
                            title="Activate user"
                            onClick={() => handleToggleStatus(user)}
                          >
                            <UserCheck size={14} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:text-rose-500"
                          title="Delete user"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 bg-muted/10 text-xs text-muted-foreground">
          <span>
            Showing {filteredUsers.length} of {users.length} staff accounts
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

      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Staff Member">
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
              <Input placeholder="e.g. Anand Sharma" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Business Unit</label>
              <Input placeholder="e.g. Kitchen Corp" value={newBusinessUnit} onChange={(e) => setNewBusinessUnit(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email Address *</label>
            <Input type="email" placeholder="e.g. anand@kitchencorp.in" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hub / Location</label>
              <Input placeholder="e.g. Mumbai South Hub" value={newHub} onChange={(e) => setNewHub(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Assign Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer h-10"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="Ops">Ops</option>
                <option value="Service">Service</option>
              </select>
            </div>
          </div>
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddUser} disabled={!newName.trim() || !newEmail.trim()} isLoading={isSaving}>
              Save Staff Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      {editUser && (
        <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser.name}`}>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Business Unit</label>
                <Input value={editBusinessUnit} onChange={(e) => setEditBusinessUnit(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Hub / Location</label>
                <Input value={editHub} onChange={(e) => setEditHub(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer h-10"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="Ops">Ops</option>
                  <option value="Service">Service</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditSave} isLoading={isEditSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default StaffManagement;
