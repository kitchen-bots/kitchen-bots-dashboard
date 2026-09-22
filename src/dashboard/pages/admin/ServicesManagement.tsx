import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Plus,
  Ticket,
  Wrench,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  MapPin,
} from 'lucide-react';
import { ticketService, ServiceTicket } from '../../services/ticketService';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../context/ToastContext';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Text } from '../../components/ui/Typography';
import { PageContainer } from '../../components/layout/PageContainer';

export const ServicesManagement = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Ticket Modal State
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('Smart Fryer Pro');
  const [engineerName, setEngineerName] = useState('Vikram R.');
  const [isUrgent, setIsUrgent] = useState(false);

  // Engineer Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketService.getTickets({
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setTickets(response.data);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Error fetching tickets', err);
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !productName.trim()) {
      showToast('Validation Error', 'Customer and equipment name are required.', 'error');
      return;
    }

    try {
      const initials = customerName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newTicket = await ticketService.createTicket({
        customerName: customerName.trim(),
        customerInitials: initials || 'KB',
        customerColor: 'bg-primary/10 text-primary',
        productName: productName.trim(),
        engineerName,
        engineerColor: 'bg-emerald-500',
        status: 'Open',
        date: 'Just now',
        isUrgent,
      });

      setTickets((prev) => [newTicket, ...prev]);
      setTotalCount((prev) => prev + 1);
      setIsNewTicketModalOpen(false);
      setCustomerName('');
      setIsUrgent(false);

      showToast('Ticket Created', `Service ticket #${newTicket.id} has been registered.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to create ticket.', 'error');
    }
  };

  const handleCycleStatus = async (ticket: ServiceTicket) => {
    const nextStatusMap: Record<ServiceTicket['status'], ServiceTicket['status']> = {
      Open: 'In Progress',
      Assigned: 'In Progress',
      'In Progress': 'Completed',
      Completed: 'Open',
    };
    const newStatus = nextStatusMap[ticket.status];

    try {
      await ticketService.updateTicketStatus(ticket.id, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t))
      );
      showToast('Status Updated', `Ticket #${ticket.id} marked as ${newStatus}.`, 'info');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to update ticket status.', 'error');
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" | "info" => {
    switch(status) {
      case 'Open': return 'destructive';
      case 'In Progress': return 'info';
      case 'Assigned': return 'warning';
      case 'Completed': return 'default';
      default: return 'secondary';
    }
  };

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const assignedCount = tickets.filter((t) => t.status === 'Assigned').length;
  const completedCount = tickets.filter((t) => t.status === 'Completed').length;

  const paginatedTickets = tickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.max(1, Math.ceil(tickets.length / itemsPerPage));

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <PageContainer
      title="Service Management"
      description="Manage service tickets, track engineers, and monitor resolution metrics."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Services' }
      ]}
      actions={
        <Button
          variant="default"
          onClick={() => setIsNewTicketModalOpen(true)}
          className="gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus size={16} />
          New Ticket
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Analytics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Ticket size={20} />
                </div>
                <Badge variant="warning">Open</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Open Tickets</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">{openCount}</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Wrench size={20} />
                </div>
                <Badge variant="info">In Progress</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Active Services</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">{inProgressCount}</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Clock size={20} />
                </div>
                <Badge variant="secondary">Assigned</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Assigned Engineers</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">{assignedCount}</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <Badge variant="default">Resolved</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Completed Tickets</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">{completedCount}</Text>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Main Table Column (75% / cols 1-3) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 min-w-0"
          >
            <Card className="overflow-hidden flex flex-col">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Service Records</CardTitle>
                  
                  {/* Toolbar */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                      <Input 
                        type="text" 
                        placeholder="Search tickets, customers, equipment..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64 text-xs h-9"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-hidden"
                    >
                      <option value="All Status">All Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Ticket ID</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Client / Restaurant</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Equipment Model</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Assigned Field Tech</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Status (Click to toggle)</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Date</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                          No service tickets found matching your query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTickets.map((ticket) => (
                        <TableRow 
                          key={ticket.id} 
                          className="hover:bg-muted/40 border-b border-border/50 cursor-pointer"
                          onClick={() => handleCycleStatus(ticket)}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-primary px-4 py-3 whitespace-nowrap">
                            #{ticket.id}
                            {ticket.isUrgent && (
                              <span className="ml-1.5 text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded">
                                Urgent
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {ticket.customerAvatar ? (
                                <img alt="Client Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" src={ticket.customerAvatar} />
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${ticket.customerColor}`}>
                                  {ticket.customerInitials}
                                </div>
                              )}
                              <Text className="font-medium text-foreground text-sm truncate max-w-[140px]">{ticket.customerName}</Text>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <Text className="text-sm text-muted-foreground truncate max-w-[140px]">{ticket.productName}</Text>
                          </TableCell>
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${ticket.engineerColor}`}></div>
                              <Text className="text-sm text-foreground">{ticket.engineerName}</Text>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <Badge 
                              variant={getStatusVariant(ticket.status)}
                              className="cursor-pointer hover:opacity-80"
                              title="Click to advance status"
                            >
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <Text className="text-sm text-muted-foreground">{ticket.date}</Text>
                          </TableCell>
                          <TableCell className="text-right px-4 py-3 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCycleStatus(ticket);
                              }}
                              title="Advance status"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 border-t border-border flex items-center justify-between">
                <Text variant="muted" className="text-sm font-medium">
                  {tickets.length === 0
                    ? 'Showing 0 tickets'
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, tickets.length)} of ${totalCount || tickets.length} tickets`}
                </Text>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <Button
                      key={idx}
                      variant={currentPage === idx + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0 cursor-pointer"
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 cursor-pointer"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Sidebar (25% / col 4) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 min-w-0 flex flex-col gap-6"
          >
            {/* Urgent Requests Widget */}
            <Card className="border-l-4 border-l-rose-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                    <span>Urgent Requests</span>
                  </CardTitle>
                  <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400">
                    2 High
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    onClick={() => setSearchQuery('Main Freezer Leak')}
                    className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 cursor-pointer hover:bg-rose-500/15 transition-colors"
                    title="Click to view this ticket"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Text className="font-bold text-foreground text-sm truncate">Main Freezer Leak</Text>
                      <span className="text-[10px] font-bold text-rose-500 px-2 py-0.5 bg-background border border-rose-200 dark:border-rose-800 rounded-md shrink-0">0:14:22</span>
                    </div>
                    <Text variant="muted" className="text-xs truncate">Cloud Kitchen Delhi-NSR</Text>
                  </div>
                  <div
                    onClick={() => setSearchQuery('Gas Range Component')}
                    className="p-3 bg-muted/20 rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors"
                    title="Click to view this ticket"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Text className="font-bold text-foreground text-sm truncate">Gas Range Component</Text>
                      <span className="text-[10px] font-bold text-amber-500 px-2 py-0.5 bg-background border border-border rounded-md shrink-0">1:02:45</span>
                    </div>
                    <Text variant="muted" className="text-xs truncate">Pizza Planet, G-Block</Text>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Engineer Schedules Widget */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Engineer Schedules</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMapModalOpen(true)}
                    className="text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium cursor-pointer"
                  >
                    View Map
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        alt="Engineer Avatar" 
                        className="w-9 h-9 rounded-full object-cover shrink-0" 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                      />
                      <div className="min-w-0">
                        <Text className="font-bold text-foreground text-sm truncate">Vikram R.</Text>
                        <Text variant="muted" className="text-[10px] uppercase tracking-wider truncate">At Royal Tandoor</Text>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        alt="Engineer Avatar" 
                        className="w-9 h-9 rounded-full object-cover shrink-0" 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
                      />
                      <div className="min-w-0">
                        <Text className="font-bold text-foreground text-sm truncate">Priya D.</Text>
                        <Text variant="muted" className="text-[10px] uppercase tracking-wider truncate">On Route (12m)</Text>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0"></span>
                  </div>
                  
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        alt="Engineer Avatar" 
                        className="w-9 h-9 rounded-full object-cover shrink-0" 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
                      />
                      <div className="min-w-0">
                        <Text className="font-bold text-foreground text-sm truncate">Amit K.</Text>
                        <Text variant="muted" className="text-[10px] uppercase tracking-wider truncate">Offline</Text>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Support Activity Feed */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Support Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-xs">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                    </div>
                    <Text className="text-sm text-foreground"><span className="font-bold">#SR-9821</span> was assigned to Vikram R.</Text>
                    <Text variant="muted" className="text-[10px] mt-0.5">2 mins ago</Text>
                  </div>
                  
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-background shadow-xs">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <Text className="text-sm text-foreground"><span className="font-bold">#SR-9824</span> marked as completed</Text>
                    <Text variant="muted" className="text-[10px] mt-0.5">15 mins ago</Text>
                  </div>
                  
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center border-4 border-background shadow-xs">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <Text className="text-sm text-foreground"><span className="font-bold">New Ticket</span> created by Cafe Bliss</Text>
                    <Text variant="muted" className="text-[10px] mt-0.5">1 hour ago</Text>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </motion.div>
        </div>
      </div>

      {/* New Service Ticket Modal */}
      <Modal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Create Service Ticket"
        description="Dispatch a field maintenance engineer to service commercial kitchen machinery."
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Client / Restaurant Name *
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Royal Tandoor"
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Equipment Model *
            </label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full h-10 px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-hidden"
            >
              <option value="Smart Fryer Pro">Smart Fryer Pro</option>
              <option value="Auto-Wok 3000">Auto-Wok 3000</option>
              <option value="GrillMaster 3000 PRO">GrillMaster 3000 PRO</option>
              <option value="SteamPro Commercial Oven">SteamPro Commercial Oven</option>
              <option value="Main Freezer Leak">CoolFreeze Industrial (Freezer)</option>
              <option value="Gas Range Component">Global Series Gas Range</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Assigned Field Technician
            </label>
            <select
              value={engineerName}
              onChange={(e) => setEngineerName(e.target.value)}
              className="w-full h-10 px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-hidden"
            >
              <option value="Vikram R.">Vikram R. (Available)</option>
              <option value="Priya D.">Priya D. (En Route)</option>
              <option value="Amit K.">Amit K. (General Dispatch)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="urgent-checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring h-4 w-4"
            />
            <label htmlFor="urgent-checkbox" className="text-xs font-medium text-foreground cursor-pointer">
              Mark as high-priority urgent service request (SLA &lt; 2 hours)
            </label>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewTicketModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              Dispatch Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Field Engineer Live Map Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Field Engineer Live Routes & Regional Hubs"
        description="Real-time dispatch telemetry across metro commercial kitchens."
      >
        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Bengaluru Tech Hub
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
            </div>
            <div className="text-xs space-y-1.5 text-muted-foreground">
              <p><strong className="text-foreground">Vikram R.:</strong> On-site at Royal Tandoor (Indiranagar)</p>
              <p><strong className="text-foreground">Priya D.:</strong> En route to Cloud Kitchen Delhi-NSR (ETA 12m)</p>
              <p><strong className="text-foreground">Amit K.:</strong> Ready for dispatch at Central Depot</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMapModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Close Map
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ServicesManagement;
