import React, { useState } from 'react';
import {
  CheckCircle2,
  Settings,
  RefreshCw,
  Wrench,
  Plus,
  Download,
  History,
  AlertTriangle,
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
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { ticketService } from '../../services/ticketService';

interface Equipment {
  id: string;
  name: string;
  status: 'operational' | 'maintenance' | 'warning';
  installDate: string;
  lastServiceDate: string;
  nextServiceDate: string;
  warrantyStatus: 'active' | 'expiring' | 'expired';
  amcStatus: 'active' | 'inactive';
  serialNumber?: string;
  location?: string;
}

interface ServiceLog {
  id: string;
  date: string;
  type: string;
  technician: string;
  notes: string;
}

const mockEquipment: Equipment[] = [
  {
    id: 'eq-1',
    name: 'GrillMaster 3000 PRO',
    status: 'operational',
    installDate: '12 Jan 2023',
    lastServiceDate: '15 Oct 2023',
    nextServiceDate: '15 Jan 2024',
    warrantyStatus: 'active',
    amcStatus: 'active',
    serialNumber: 'GM-3000-8821',
    location: 'Kitchen Station A',
  },
  {
    id: 'eq-2',
    name: 'CoolFreeze Industrial 500L',
    status: 'warning',
    installDate: '05 Mar 2023',
    lastServiceDate: '20 Sep 2023',
    nextServiceDate: '20 Nov 2023',
    warrantyStatus: 'expiring',
    amcStatus: 'active',
    serialNumber: 'CF-500-1092',
    location: 'Cold Storage Room 1',
  },
  {
    id: 'eq-3',
    name: 'SteamPro Commercial Oven',
    status: 'maintenance',
    installDate: '18 Nov 2022',
    lastServiceDate: '01 Oct 2023',
    nextServiceDate: '01 Dec 2023',
    warrantyStatus: 'expired',
    amcStatus: 'inactive',
    serialNumber: 'SP-OVEN-4432',
    location: 'Bakery & Pastry Section',
  },
  {
    id: 'eq-4',
    name: 'RoboChef Auto Stirrer Model X',
    status: 'operational',
    installDate: '22 Apr 2023',
    lastServiceDate: '10 Oct 2023',
    nextServiceDate: '10 Jan 2024',
    warrantyStatus: 'active',
    amcStatus: 'active',
    serialNumber: 'RC-STIR-9901',
    location: 'Main Cooking Line B',
  },
];

const mockServiceHistory: Record<string, ServiceLog[]> = {
  'eq-1': [
    { id: 'log-1', date: '15 Oct 2023', type: 'Quarterly Maintenance', technician: 'Vikram R.', notes: 'Heating element calibrated, grease trap cleared.' },
    { id: 'log-2', date: '15 Jul 2023', type: 'Preventative Inspection', technician: 'Amit K.', notes: 'Thermostat sensor checked and electrical harness secured.' },
  ],
  'eq-2': [
    { id: 'log-3', date: '20 Sep 2023', type: 'Compressor Diagnostic', technician: 'Priya D.', notes: 'Condenser coils vacuumed. Slight coolant variance noted; monitoring scheduled.' },
  ],
  'eq-3': [
    { id: 'log-4', date: '01 Oct 2023', type: 'Heating Element Repair', technician: 'Vikram R.', notes: 'Heating coil replacement pending part procurement.' },
  ],
  'eq-4': [
    { id: 'log-5', date: '10 Oct 2023', type: 'Firmware & Calibration', technician: 'Suresh M.', notes: 'Actuator arms lubricated and rotation rpm calibrated to factory specs.' },
  ],
};

export const EquipmentStatus: React.FC = () => {
  const { showToast } = useToast();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(mockEquipment);
  const [statusFilter, setStatusFilter] = useState<'all' | 'operational' | 'maintenance' | 'warning'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Service Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedEquipmentForService, setSelectedEquipmentForService] = useState<Equipment | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Standard' | 'Urgent' | 'Emergency'>('Standard');
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  // Service History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEquipmentForHistory, setSelectedEquipmentForHistory] = useState<Equipment | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Fleet Telemetry Updated', 'Latest equipment diagnostics synced.', 'info');
    }, 600);
  };

  const handleOpenServiceModal = (eq?: Equipment) => {
    setSelectedEquipmentForService(eq || equipmentList[0] || null);
    setIssueDescription('');
    setUrgencyLevel('Standard');
    setIsRequestModalOpen(true);
  };

  const handleOpenHistoryModal = (eq: Equipment) => {
    setSelectedEquipmentForHistory(eq);
    setIsHistoryModalOpen(true);
  };

  const handleSubmitServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentForService || !issueDescription.trim()) {
      showToast('Validation Error', 'Please describe the issue.', 'error');
      return;
    }

    setIsSubmittingService(true);
    try {
      await ticketService.createTicket({
        customerName: 'Commercial Kitchen Partner',
        customerInitials: 'CK',
        customerColor: 'bg-primary/10 text-primary',
        productName: selectedEquipmentForService.name,
        engineerName: 'On-Call Technician',
        engineerColor: 'bg-blue-500',
        status: 'Open',
        date: 'Just now',
        isUrgent: urgencyLevel !== 'Standard',
      });

      // Update equipment status locally if emergency
      if (urgencyLevel !== 'Standard') {
        setEquipmentList((prev) =>
          prev.map((eq) =>
            eq.id === selectedEquipmentForService.id ? { ...eq, status: 'maintenance' } : eq
          )
        );
      }

      setIsRequestModalOpen(false);
      setIssueDescription('');
      showToast(
        'Service Ticket Dispatched',
        `Request registered for ${selectedEquipmentForService.name} (${urgencyLevel} Priority).`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to dispatch service ticket.', 'error');
    } finally {
      setIsSubmittingService(false);
    }
  };

  const handleExportFleetSpecs = () => {
    const headers = ['ID,Name,Status,Serial Number,Location,Installed Date,Last Service,Next Service Due,Warranty,AMC Status'];
    const rows = equipmentList.map(
      (eq) =>
        `"${eq.id}","${eq.name}","${eq.status}","${eq.serialNumber || ''}","${eq.location || ''}","${eq.installDate}","${eq.lastServiceDate}","${eq.nextServiceDate}","${eq.warrantyStatus}","${eq.amcStatus}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fleet-specs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Fleet Export Complete', 'Equipment technical inventory exported to CSV.', 'success');
  };

  const filteredEquipment = equipmentList.filter((eq) => {
    if (statusFilter === 'all') return true;
    return eq.status === statusFilter;
  });

  const operationalCount = equipmentList.filter((eq) => eq.status === 'operational').length;
  const maintenanceCount = equipmentList.filter((eq) => eq.status === 'maintenance').length;
  const warningCount = equipmentList.filter((eq) => eq.status === 'warning').length;

  const getStatusBadge = (status: Equipment['status']) => {
    switch (status) {
      case 'operational':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Operational
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Warning
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">
            In Maintenance
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PageContainer
      title="Equipment & Fleet Status"
      description="Manage registered commercial kitchen units, maintenance intervals, and warranty coverage."
      homeHref="/dashboard"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Equipment Status' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportFleetSpecs}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Specs</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenServiceModal()}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Service</span>
          </Button>
        </div>
      }
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:border-primary/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Units
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{equipmentList.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Installed kitchen machinery</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('operational')}
          className={`cursor-pointer transition-all ${statusFilter === 'operational' ? 'ring-2 ring-emerald-500' : 'hover:border-emerald-500/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Operational
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-emerald-500">{operationalCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Ready for commercial cooking</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('maintenance')}
          className={`cursor-pointer transition-all ${statusFilter === 'maintenance' ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Maintenance
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-blue-500">
              <Settings className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-blue-500">{maintenanceCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Field service requested</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('warning')}
          className={`cursor-pointer transition-all ${statusFilter === 'warning' ? 'ring-2 ring-amber-500' : 'hover:border-amber-500/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Attention Needed
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-amber-500">{warningCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Expiring warranty or warning</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {(['all', 'operational', 'maintenance', 'warning'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
              statusFilter === tab
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            {tab === 'all' ? `All Units (${equipmentList.length})` : `${tab} (${equipmentList.filter((e) => e.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEquipment.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">No equipment matching "{statusFilter}"</p>
            <p className="text-xs mt-1">Adjust your filter to view registered kitchen machinery.</p>
          </div>
        ) : (
          filteredEquipment.map((eq) => (
            <Card key={eq.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
                      <Wrench className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{eq.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Installed: {eq.installDate} {eq.location ? `• ${eq.location}` : ''}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(eq.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded-md bg-muted/20 border border-border">
                      <span className="text-muted-foreground">Last Service</span>
                      <span className="font-semibold text-foreground">{eq.lastServiceDate}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-md bg-muted/20 border border-border">
                      <span className="text-muted-foreground">Next Due</span>
                      <span className="font-semibold text-foreground">{eq.nextServiceDate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded-md bg-muted/20 border border-border">
                      <span className="text-muted-foreground">AMC Policy</span>
                      <span className="font-semibold text-foreground capitalize">{eq.amcStatus}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-md bg-muted/20 border border-border">
                      <span className="text-muted-foreground">Warranty</span>
                      <span className="font-semibold text-foreground capitalize">{eq.warrantyStatus}</span>
                    </div>
                  </div>
                </div>

                {eq.serialNumber && (
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Serial: {eq.serialNumber}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenHistoryModal(eq)}
                    className="text-xs gap-1.5 h-8 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenServiceModal(eq)}
                    className="text-xs gap-1.5 h-8 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Request Service</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Service Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Field Service"
        description="Dispatch a factory-certified technician to your commercial kitchen installation."
      >
        <form onSubmit={handleSubmitServiceRequest} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Target Equipment</label>
            <select
              value={selectedEquipmentForService?.id || ''}
              onChange={(e) => {
                const found = equipmentList.find((eq) => eq.id === e.target.value);
                if (found) setSelectedEquipmentForService(found);
              }}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-ring outline-hidden"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Priority SLA</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Urgent', 'Emergency'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgencyLevel(lvl)}
                  className={`py-2 px-3 text-xs font-medium rounded-md border transition-all text-center cursor-pointer ${
                    urgencyLevel === lvl
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {urgencyLevel === 'Standard' && 'Response within 24 hours (Included in AMC)'}
              {urgencyLevel === 'Urgent' && 'Priority dispatch within 4 hours'}
              {urgencyLevel === 'Emergency' && 'Immediate emergency dispatch within 1 hour'}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Issue Description</label>
            <textarea
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Detail symptoms, error codes, temperature fluctuations, or noise..."
              className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-hidden resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRequestModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingService}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Submit Request</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Service History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`${selectedEquipmentForHistory?.name || 'Equipment'} Service Log`}
        description="Historical maintenance reports and technician interventions."
      >
        <div className="space-y-3 py-2">
          {selectedEquipmentForHistory && mockServiceHistory[selectedEquipmentForHistory.id]?.length ? (
            <div className="space-y-2.5">
              {mockServiceHistory[selectedEquipmentForHistory.id].map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{log.type}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{log.date}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{log.notes}</p>
                  <p className="text-[11px] text-muted-foreground">Certified Engineer: {log.technician}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-xs">
              No historical maintenance records logged for this unit.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default EquipmentStatus;
