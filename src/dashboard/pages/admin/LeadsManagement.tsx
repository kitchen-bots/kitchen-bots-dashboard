import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, ChevronRight, Clock, Download, Edit, FileText, Filter, Mail, MessageSquare, PhoneCall, Search, Star, UserCheck, UserPlus, Users, XCircle, Plus } from 'lucide-react';
import { Quotation, leadService } from '../../services/leadService';
import { useLeads, useCRMActivities, useFollowUpTasks } from '../../hooks/queries';
import { Lead as LeadType } from '../../types';
import { ErrorState } from '../../components/common/ErrorState';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Heading, Text } from '../../components/ui/Typography';
import { Drawer } from '../../components/ui/Drawer';
import { PageContainer } from '../../components/layout/PageContainer';

export function LeadsManagement() {
  const { data: leadsData, isLoading: loadingLeads, error: leadsError, refetch } = useLeads();
  const { data: activitiesData, isLoading: loadingActivities } = useCRMActivities();
  const { data: followUpsData, isLoading: loadingFollowUps } = useFollowUpTasks();

  const leads = leadsData?.data || [];
  const activities = activitiesData?.data || [];
  const followUps = followUpsData?.data || [];
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  
  const loading = loadingLeads || loadingActivities || loadingFollowUps;
  const error = leadsError ? "Failed to load CRM data." : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);

  const handleLeadSelect = async (lead: LeadType) => {
    setSelectedLead(lead);
    try {
      const quotesRes = await leadService.getQuotationsByLead(lead.id);
      setQuotations(quotesRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const closePanel = () => setSelectedLead(null);

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" | "info" => {
    switch(status) {
      case 'New': return 'info';
      case 'Contacted': return 'default';
      case 'Requirement Gathering': return 'warning';
      case 'Proposal Sent': return 'info';
      case 'Negotiation': return 'warning';
      case 'Converted': return 'default';
      case 'Lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch(status) {
      case 'Converted': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Contacted': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'Proposal Sent': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'Negotiation': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default: return '';
    }
  };

  const getQuoteStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" | "info" => {
    switch(status) {
      case 'Draft': return 'secondary';
      case 'Sent': return 'info';
      case 'Pending': return 'warning';
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const getQuoteStatusClassName = (status: string) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return '';
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
        <ErrorState message={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <PageContainer
      title="Lead Management CRM"
      description="Track enquiries, manage prospects, monitor quotations and convert opportunities."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Leads' }
      ]}
      actions={
        <>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export Data
          </Button>
          <Button variant="default" className="gap-2">
            <UserPlus size={16} />
            Add Lead
          </Button>
        </>
      }
    >
      {/* Top Analytics Section (6 KPI Cards) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          { title: 'Total Leads', value: '248', icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+12%', trendUp: true },
          { title: 'New Leads', value: '34', icon: Star, color: 'bg-indigo-50 text-indigo-600', trend: '+5%', trendUp: true },
          { title: 'Contacted', value: '68', icon: PhoneCall, color: 'bg-purple-50 text-purple-600', trend: '+18%', trendUp: true },
          { title: 'Proposal Sent', value: '52', icon: FileText, color: 'bg-yellow-50 text-yellow-600', trend: '-2%', trendUp: false },
          { title: 'Converted', value: '71', icon: CheckCircle2, color: 'bg-green-50 text-green-600', trend: '+24%', trendUp: true },
          { title: 'Lost', value: '23', icon: XCircle, color: 'bg-red-50 text-red-600', trend: '-5%', trendUp: false },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <Badge variant={stat.trendUp ? "default" : "destructive"} className={stat.trendUp ? "bg-primary-100 text-primary-700 hover:bg-primary-100" : "bg-rose-100 text-rose-700 hover:bg-rose-100"}>
                  {stat.trend}
                </Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">{stat.title}</Text>
              <Text className="text-2xl font-black text-slate-900 mt-1">{stat.value}</Text>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Lead Pipeline Overview (Funnel) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center relative pt-4">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-slate-100 z-0"></div>
              
              {[
                { stage: 'New', status: 'New', color: 'border-blue-500 text-blue-600' },
                { stage: 'Contacted', status: 'Contacted', color: 'border-purple-500 text-purple-600' },
                { stage: 'Reqs', status: 'Requirement Gathering', color: 'border-yellow-500 text-yellow-600' },
                { stage: 'Proposal', status: 'Proposal Sent', color: 'border-indigo-500 text-indigo-600' },
                { stage: 'Negotiation', status: 'Negotiation', color: 'border-orange-500 text-orange-600' },
                { stage: 'Converted', status: 'Converted', color: 'border-green-500 text-green-600' },
              ].map((step, idx) => {
                const count = leads.filter(l => l.status === step.status).length;
                const totalActive = leads.filter(l => l.status !== 'Lost').length || 1;
                const percent = Math.round((count / totalActive) * 100) + '%';
                
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-4">
                    <div className={`w-16 h-16 rounded-full border-4 ${step.color} flex flex-col items-center justify-center bg-white shadow-sm mb-3`}>
                      <span className="text-lg font-bold text-slate-900">{count}</span>
                    </div>
                    <Text className="text-xs font-semibold uppercase tracking-wide">{step.stage}</Text>
                    <Text variant="muted" className="text-xs mt-1">{percent} of total</Text>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        
        {/* Left Column (Table) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="border-b border-border-default pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Active Leads</CardTitle>
                
                {/* Toolbar */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      type="text" 
                      placeholder="Search leads..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter size={16} />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Info</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      className="cursor-pointer"
                      onClick={() => handleLeadSelect(lead)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </div>
                          <div>
                            <Text className="font-semibold text-slate-900">{lead.firstName} {lead.lastName}</Text>
                            <Text variant="muted" className="text-xs">{lead.companyName}</Text>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Text className="text-sm text-slate-900 truncate max-w-[150px]">{lead.equipmentNeeded}</Text>
                        <Text variant="muted" className="text-xs">Qty: {lead.quantity}</Text>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(lead.status)}
                          className={getStatusBadgeClassName(lead.status)}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleLeadSelect(lead); }}
                        >
                          <ChevronRight size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        {/* Right Column (Widgets) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-6"
        >
          {/* Follow-up Calendar */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  Follow-Ups
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followUps.map(task => (
                  <div key={task.id} className="flex gap-3">
                    <div className="flex flex-col items-center min-w-[48px] pt-1">
                      <Text className="text-xs font-semibold">{task.date === 'Today' ? 'Today' : task.date.substring(0,6)}</Text>
                      <Text variant="muted" className="text-[10px]">{task.time}</Text>
                    </div>
                    <div className={`flex-1 p-3 rounded-lg border-l-4 ${task.type === 'Call' ? 'border-blue-500 bg-blue-50' : task.type === 'Meeting' ? 'border-purple-500 bg-purple-50' : 'border-yellow-500 bg-yellow-50'}`}>
                      <Text className="text-sm font-medium">{task.title}</Text>
                      <Text className="text-xs text-slate-600 mt-1">{task.leadName}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CRM Activities Feed */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative overflow-hidden">
                      {activity.user ? <img src={activity.user.avatar} alt="user" className="w-full h-full object-cover" /> : <div className="w-2 h-2 bg-slate-400 rounded-full" />}
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Text className="text-xs font-semibold">{activity.type}</Text>
                        <time className="text-[10px] text-slate-400 font-medium">{activity.timestamp}</time>
                      </div>
                      <Text className="text-xs text-slate-600">{activity.message}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Slide-out Lead Detail Panel */}
      <Drawer
        isOpen={!!selectedLead}
        onClose={closePanel}
        position="right"
        size="lg"
        title={selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : "Lead Details"}
        description={selectedLead?.companyName}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={closePanel}>
              Archive Lead
            </Button>
            <Button variant="default">
              Convert to Customer
            </Button>
          </div>
        }
      >
        {selectedLead && (
          <div className="space-y-8">
            
            {/* Status Header */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl">
                  {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                </div>
                <div>
                   {selectedLead.score !== undefined && (
                      <div className="flex items-center gap-2 mb-1">
                        <Text className="text-[10px] text-slate-500 font-bold uppercase">Lead Score</Text>
                        <Text className={`text-sm font-bold ${selectedLead.score >= 80 ? 'text-green-600' : selectedLead.score >= 50 ? 'text-yellow-600' : 'text-orange-600'}`}>
                          {selectedLead.score}/100
                        </Text>
                      </div>
                    )}
                   <Badge 
                      variant={getStatusBadgeVariant(selectedLead.status)}
                      className={getStatusBadgeClassName(selectedLead.status)}
                    >
                      {selectedLead.status}
                    </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <Mail size={18} className="mb-2 text-blue-500" />
                <span className="text-xs font-medium">Email</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <PhoneCall size={18} className="mb-2 text-green-500" />
                <span className="text-xs font-medium">Call</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <FileText size={18} className="mb-2 text-purple-500" />
                <span className="text-xs font-medium">Quote</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <UserCheck size={18} className="mb-2 text-orange-500" />
                <span className="text-xs font-medium">Assign</span>
              </button>
            </div>

            {/* Contact & Business Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Heading level="h4" className="text-sm font-semibold mb-3 uppercase tracking-wider">Contact Info</Heading>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Email</Text>
                    <Text className="text-sm font-medium text-slate-900">{selectedLead.email}</Text>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Phone</Text>
                    <Text className="text-sm font-medium text-slate-900">{selectedLead.phone}</Text>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Source</Text>
                    <Text className="text-sm font-medium text-slate-900">{selectedLead.source}</Text>
                  </div>
                </div>
              </div>
              <div>
                <Heading level="h4" className="text-sm font-semibold mb-3 uppercase tracking-wider">Requirements</Heading>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Equipment</Text>
                    <Text className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{selectedLead.equipmentNeeded}</Text>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Quantity</Text>
                    <Text className="text-sm font-medium text-slate-900">{selectedLead.quantity} Units</Text>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Timeline</Text>
                    <Text className="text-sm font-medium text-slate-900">{selectedLead.timeline}</Text>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <Text variant="muted" className="text-xs">Follow-up</Text>
                    <div className="flex items-center gap-2">
                      <Text className="text-sm font-medium text-primary-600">
                        {selectedLead.followUpDate ? new Date(selectedLead.followUpDate).toLocaleDateString() : 'Unscheduled'}
                      </Text>
                      <button className="text-slate-400 hover:text-primary-600"><Edit size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            {selectedLead.message && (
              <div>
                <Heading level="h4" className="text-sm font-semibold mb-2 uppercase tracking-wider">Message</Heading>
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 italic border border-slate-100">
                  "{selectedLead.message}"
                </div>
              </div>
            )}

            {/* Sales Owner Widget */}
            {selectedLead.assignedTo && (
              <div>
                <Heading level="h4" className="text-sm font-semibold mb-3 uppercase tracking-wider">Assigned Rep</Heading>
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={selectedLead.assignedTo.avatar} alt="rep" className="w-10 h-10 rounded-full" />
                    <div>
                      <Text className="text-sm font-bold">{selectedLead.assignedTo.name}</Text>
                      <Text variant="muted" className="text-xs">{selectedLead.assignedTo.email}</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                      selectedLead.assignedTo.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedLead.assignedTo.status}
                    </span>
                    <Text variant="muted" className="text-xs mt-1">Load: {selectedLead.assignedTo.load} leads</Text>
                  </div>
                </div>
              </div>
            )}

            {/* Quotations Widget */}
            {quotations.length > 0 && (
              <div>
                <Heading level="h4" className="text-sm font-semibold mb-3 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Quotations
                </Heading>
                <div className="space-y-3">
                  {quotations.map(quote => (
                    <div key={quote.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div>
                        <Text className="text-sm font-bold">{quote.id}</Text>
                        <Text variant="muted" className="text-xs mt-1">Date: {new Date(quote.date).toLocaleDateString()}</Text>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Text className="text-sm font-bold text-slate-900">₹{quote.value.toLocaleString('en-IN')}</Text>
                        <Badge 
                          variant={getQuoteStatusVariant(quote.status)} 
                          className={`mt-1 ${getQuoteStatusClassName(quote.status)}`}
                        >
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Heading level="h4" className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={16} /> Internal Notes
                </Heading>
                <Button variant="ghost" size="sm" className="text-primary-600 gap-1 h-8">
                  <Plus size={14}/> Add Note
                </Button>
              </div>
              <div className="space-y-3">
                {selectedLead.notes.sales.map((note, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <Text className="text-xs font-semibold text-blue-800 mb-1">Sales Note</Text>
                    <Text className="text-sm text-slate-700">{note}</Text>
                  </div>
                ))}
                {selectedLead.notes.admin.map((note, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <Text className="text-xs font-semibold text-purple-800 mb-1">Admin Note</Text>
                    <Text className="text-sm text-slate-700">{note}</Text>
                  </div>
                ))}
                {selectedLead.notes.followUp.map((note, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <Text className="text-xs font-semibold text-yellow-800 mb-1">Follow Up</Text>
                    <Text className="text-sm text-slate-700">{note}</Text>
                  </div>
                ))}
                {selectedLead.notes.sales.length === 0 && selectedLead.notes.admin.length === 0 && selectedLead.notes.followUp.length === 0 && (
                  <Text variant="muted" className="text-sm italic text-center py-4">No notes added yet.</Text>
                )}
              </div>
            </div>

          </div>
        )}
      </Drawer>
    </PageContainer>
  );
}

export default LeadsManagement;
