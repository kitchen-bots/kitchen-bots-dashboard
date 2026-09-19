import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Download, Filter, Plus, Ticket, Wrench, MoreVertical, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { ticketService, ServiceTicket } from '../../services/ticketService';
import { ErrorState } from '../../components/common/ErrorState';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';

import { Badge } from '../../components/ui/Badge';
import { Text } from '../../components/ui/Typography';
import { PageContainer } from '../../components/layout/PageContainer';

export const ServicesManagement = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketService.getTickets();
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets', err);
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" | "info" => {
    switch(status) {
      case 'Open': return 'destructive';
      case 'In Progress': return 'info';
      case 'Assigned': return 'warning';
      case 'Completed': return 'default';
      default: return 'secondary';
    }
  };

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
        <Button variant="default" className="gap-2 self-start md:self-auto">
          <Plus size={16} />
          New Ticket
        </Button>
      }
    >
      {/* Analytics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <Ticket size={20} />
              </div>
              <Badge variant="warning" className="bg-orange-100 text-orange-700 hover:bg-orange-100">+12%</Badge>
            </div>
            <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Open Tickets</Text>
            <Text className="text-3xl font-black text-slate-900 mt-1">42</Text>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Wrench size={20} />
              </div>
              <Badge variant="info" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Stable</Badge>
            </div>
            <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Active Services</Text>
            <Text className="text-3xl font-black text-slate-900 mt-1">156</Text>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Clock size={20} />
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">8 Pending</Badge>
            </div>
            <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Pending Installations</Text>
            <Text className="text-3xl font-black text-slate-900 mt-1">24</Text>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">98%</Badge>
            </div>
            <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Resolved Requests</Text>
            <Text className="text-3xl font-black text-slate-900 mt-1">892</Text>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Main Table Section (70%) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="border-b border-border-default pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Service Tickets</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-primary-500/20 appearance-none text-slate-700 font-medium">
                      <option>All Status</option>
                      <option>Open</option>
                      <option>Assigned</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer group">
                      <TableCell className="font-bold text-primary-600">{ticket.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {ticket.customerAvatar ? (
                            <img alt="Client Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" src={ticket.customerAvatar} />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${ticket.customerColor}`}>
                              {ticket.customerInitials}
                            </div>
                          )}
                          <Text className="font-medium text-slate-900">{ticket.customerName}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Text className="text-sm text-slate-600">{ticket.productName}</Text>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${ticket.engineerColor}`}></div>
                          <Text className="text-sm text-slate-900">{ticket.engineerName}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Text className="text-sm text-slate-600">{ticket.date}</Text>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-border-default flex items-center justify-between">
              <Text variant="muted" className="text-sm font-medium">Showing 1 to 4 of 24 tickets</Text>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="w-9 h-9">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="default" className="w-9 h-9 p-0">1</Button>
                <Button variant="outline" className="w-9 h-9 p-0 text-slate-600">2</Button>
                <Button variant="outline" size="icon" className="w-9 h-9">
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Sidebar (30%) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 flex flex-col gap-6"
        >
          
          {/* Urgent Requests Widget */}
          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-500" />
                  Urgent Requests
                </CardTitle>
                <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100">3 High</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="flex justify-between items-start mb-1">
                    <Text className="font-bold text-slate-900">Main Freezer Leak</Text>
                    <span className="text-[10px] font-bold text-rose-700 px-2 py-1 bg-white rounded-lg shadow-sm">0:14:22</span>
                  </div>
                  <Text variant="muted" className="text-xs">Cloud Kitchen Delhi-NSR</Text>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <Text className="font-bold text-slate-900">Gas Range Component</Text>
                    <span className="text-[10px] font-bold text-rose-700 px-2 py-1 bg-white rounded-lg shadow-sm">1:02:45</span>
                  </div>
                  <Text variant="muted" className="text-xs">Pizza Planet, G-Block</Text>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Engineer Schedules Widget */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Engineer Schedules</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">View Map</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      alt="Engineer Avatar" 
                      className="w-10 h-10 rounded-full object-cover shrink-0" 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                    />
                    <div>
                      <Text className="font-bold text-slate-900">Vikram R.</Text>
                      <Text variant="muted" className="text-[10px] uppercase tracking-wider">At Royal Tandoor</Text>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      alt="Engineer Avatar" 
                      className="w-10 h-10 rounded-full object-cover shrink-0" 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
                    />
                    <div>
                      <Text className="font-bold text-slate-900">Priya D.</Text>
                      <Text variant="muted" className="text-[10px] uppercase tracking-wider">On Route (12m)</Text>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                </div>
                
                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <img 
                      alt="Engineer Avatar" 
                      className="w-10 h-10 rounded-full object-cover shrink-0" 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
                    />
                    <div>
                      <Text className="font-bold text-slate-900">Amit K.</Text>
                      <Text variant="muted" className="text-[10px] uppercase tracking-wider">Offline</Text>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Support Activity Feed */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle>Support Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center border-4 border-white shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <Text className="text-sm text-slate-900"><span className="font-bold">#SR-9821</span> was assigned to Vikram R.</Text>
                  <Text variant="muted" className="text-[10px] mt-0.5">2 mins ago</Text>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-4 border-white shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <Text className="text-sm text-slate-900"><span className="font-bold">#SR-9824</span> marked as completed</Text>
                  <Text variant="muted" className="text-[10px] mt-0.5">15 mins ago</Text>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center border-4 border-white shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <Text className="text-sm text-slate-900"><span className="font-bold">New Ticket</span> created by Cafe Bliss</Text>
                  <Text variant="muted" className="text-[10px] mt-0.5">1 hour ago</Text>
                </div>
                
              </div>
            </CardContent>
          </Card>
          
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default ServicesManagement;
