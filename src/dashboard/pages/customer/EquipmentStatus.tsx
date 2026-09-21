import React, { useState } from 'react';
import {
  CheckCircle2,
  Settings,
  ShieldCheck,
  RefreshCw,
  Wrench,
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

interface Equipment {
  id: string;
  name: string;
  status: 'operational' | 'maintenance' | 'warning';
  installDate: string;
  lastServiceDate: string;
  nextServiceDate: string;
  warrantyStatus: 'active' | 'expiring' | 'expired';
  amcStatus: 'active' | 'inactive';
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
  },
];

export const EquipmentStatus: React.FC = () => {
  const [equipmentList] = useState<Equipment[]>(mockEquipment);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const operationalCount = equipmentList.filter((eq) => eq.status === 'operational').length;
  const maintenanceCount = equipmentList.filter((eq) => eq.status === 'maintenance').length;
  const activeWarrantyCount = equipmentList.filter((eq) => eq.warrantyStatus === 'active').length;

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
        <Button variant="outline" size="sm" onClick={handleRefresh} isLoading={isRefreshing} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Fleet Telemetry</span>
        </Button>
      }
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Warranties
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{activeWarrantyCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Covered under manufacturer AMC</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {equipmentList.map((eq) => (
          <Card key={eq.id}>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
                    <Wrench className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{eq.name}</CardTitle>
                    <CardDescription className="text-xs">Installed: {eq.installDate}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(eq.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default EquipmentStatus;
