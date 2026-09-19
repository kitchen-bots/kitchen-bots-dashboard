import { useState } from 'react';
import { ShieldCheck, Settings, AlertTriangle, CheckCircle2, MoreVertical, RefreshCw } from 'lucide-react';

type Equipment = {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'offline' | 'maintenance';
  warrantyStatus: 'active' | 'expired' | 'expiring_soon';
  lastServiceDate: string;
  nextServiceDate: string;
  amcStatus: 'active' | 'inactive';
  installDate: string;
};

const equipmentList: Equipment[] = [
  {
    id: 'eq1',
    name: 'Commercial Stand Mixer',
    status: 'operational',
    warrantyStatus: 'active',
    lastServiceDate: '2023-08-15',
    nextServiceDate: '2024-02-15',
    amcStatus: 'active',
    installDate: '2023-02-10'
  },
  {
    id: 'eq2',
    name: 'Pro Gas Range',
    status: 'warning',
    warrantyStatus: 'expiring_soon',
    lastServiceDate: '2023-05-20',
    nextServiceDate: '2023-11-20',
    amcStatus: 'inactive',
    installDate: '2022-11-05'
  },
  {
    id: 'eq3',
    name: 'Commercial Freezer',
    status: 'operational',
    warrantyStatus: 'active',
    lastServiceDate: '2023-09-01',
    nextServiceDate: '2024-03-01',
    amcStatus: 'active',
    installDate: '2023-04-12'
  },
  {
    id: 'eq4',
    name: 'Industrial Dishwasher',
    status: 'maintenance',
    warrantyStatus: 'expired',
    lastServiceDate: '2023-01-10',
    nextServiceDate: '2023-07-10',
    amcStatus: 'inactive',
    installDate: '2021-06-20'
  },
];

const statusConfig = {
  operational: { label: 'Operational', bg: 'bg-primary-100', text: 'text-primary-700', icon: CheckCircle2 },
  warning: { label: 'Service Recommended', bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
  offline: { label: 'Out of Service', bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
  maintenance: { label: 'Under Maintenance', bg: 'bg-blue-100', text: 'text-blue-700', icon: Settings },
};

const warrantyConfig = {
  active: { label: 'Active', bg: 'bg-primary-100', text: 'text-primary-700' },
  expiring_soon: { label: 'Expiring Soon', bg: 'bg-amber-100', text: 'text-amber-700' },
  expired: { label: 'Expired', bg: 'bg-red-100', text: 'text-red-700' },
};

export const EquipmentStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const operationalCount = equipmentList.filter(eq => eq.status === 'operational').length;
  const maintenanceCount = equipmentList.filter(eq => eq.status === 'maintenance').length;
  const activeWarrantyCount = equipmentList.filter(eq => eq.warrantyStatus === 'active').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Equipment & Service Status</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your purchased equipment, warranties, and maintenance schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Equipment</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{equipmentList.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Operational</span>
          </div>
          <p className="text-3xl font-bold text-primary-600">{operationalCount}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">In Maintenance</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{maintenanceCount}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Active Warranties</span>
          </div>
          <p className="text-3xl font-bold text-primary-600">{activeWarrantyCount}</p>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {equipmentList.map((eq) => {
          const config = statusConfig[eq.status];
          const wConfig = warrantyConfig[eq.warrantyStatus];
          const StatusIcon = config.icon;

          return (
            <div key={eq.id} className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md shadow-primary-500/20 overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${config.bg} rounded-xl`}>
                      <StatusIcon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{eq.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Details */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Service Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Last Service</span>
                        <span className="text-sm font-semibold text-slate-900">{eq.lastServiceDate}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Next Due</span>
                        <span className="text-sm font-semibold text-slate-900">{eq.nextServiceDate}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                        <span className="text-xs text-slate-500 font-medium">AMC Status</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${eq.amcStatus === 'active' ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>
                          {eq.amcStatus === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Warranty & Install</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Installed</span>
                        <span className="text-sm font-semibold text-slate-900">{eq.installDate}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Warranty</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${wConfig.bg} ${wConfig.text}`}>
                          {wConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentStatus;
