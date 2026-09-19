import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, ChefHat, FileText, HelpCircle, LayoutDashboard, LogOut, Megaphone, Package, Settings, ShoppingCart, TrendingUp, Users, X } from 'lucide-react';
import { Role } from '../../types';
import { hasAccess } from '../../utils/rbac';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  allowedRoles?: Role[];
}

const customerLinks: SidebarItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Users className="w-5 h-5" />, label: 'Staff Management', path: '/dashboard/staff' },
  { icon: <ChefHat className="w-5 h-5" />, label: 'Equipment Status', path: '/dashboard/equipment-status' },
  { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/dashboard/products' },
  { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', path: '/dashboard/orders' },
  { icon: <FileText className="w-5 h-5" />, label: 'Documents', path: '/dashboard/documents' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' },
];

const adminLinks: SidebarItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
  { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/admin/products', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales'] },
  { icon: <FileText className="w-5 h-5" />, label: 'Quotes', path: '/admin/quotes', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Sales'] },
  { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', path: '/admin/orders', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales', 'Finance'] },
  { icon: <Users className="w-5 h-5" />, label: 'Users', path: '/admin/users', allowedRoles: ['SystemAdmin', 'admin', 'manager'] },
  { icon: <Megaphone className="w-5 h-5" />, label: 'Leads', path: '/admin/leads', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Sales'] },
  { icon: <FileText className="w-5 h-5" />, label: 'Documents', path: '/admin/documents' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Services', path: '/admin/services', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Service', 'Ops'] },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/admin/settings', allowedRoles: ['SystemAdmin', 'admin'] },
];

export const Sidebar = ({ type, isOpen, toggle }: { type: 'customer' | 'admin', isOpen: boolean, toggle: () => void }) => {
  const { role } = useAuth();
  const baseLinks = type === 'admin' ? adminLinks : customerLinks;
  const links = baseLinks.filter(link => hasAccess(role, link.allowedRoles));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* SideNavBar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col h-full p-4 overflow-y-auto z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="mb-8 px-2 pt-2 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              KB
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold text-slate-900 tracking-tight leading-tight">KitchenBots</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                {type === 'admin' ? 'Enterprise' : 'Customer'}
              </p>
            </div>
          </div>
          <button 
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            onClick={toggle}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/dashboard' || link.path === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-md font-medium text-sm
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 space-y-1">
          {type === 'customer' && (
            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-700">Storage</span>
                <span className="text-[10px] font-bold text-slate-500">75%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1 mb-1.5 overflow-hidden">
                <div className="bg-primary-500 h-1 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-[10px] font-medium text-slate-500">1.5GB of 2GB used</p>
            </div>
          )}
          <button className="w-full flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2 transition-colors duration-200 rounded-md text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </button>
          <button onClick={() => {
            localStorage.removeItem('kb_auth_token');
            window.location.href = '/login';
          }} className="w-full flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2 transition-colors duration-200 rounded-md text-sm font-medium">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
