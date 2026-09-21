import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Role } from '../../types';
import { hasAccess } from '../../utils/rbac';
import { cn } from '../../utils/cn';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  allowedRoles?: Role[];
  badge?: string | number;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const adminNavGroups: SidebarGroup[] = [
  {
    title: 'Platform',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales', 'Finance'] },
      { icon: FileText, label: 'Quotes', path: '/admin/quotes', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Sales'] },
      { icon: Briefcase, label: 'Services', path: '/admin/services', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Service', 'Ops'] },
    ],
  },
  {
    title: 'Catalog & CRM',
    items: [
      { icon: Package, label: 'Products', path: '/admin/products', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales'] },
      { icon: Megaphone, label: 'Leads', path: '/admin/leads', allowedRoles: ['SystemAdmin', 'admin', 'manager', 'Sales'] },
      { icon: Users, label: 'Users', path: '/admin/users', allowedRoles: ['SystemAdmin', 'admin', 'manager'] },
      { icon: FileText, label: 'Documents', path: '/admin/documents' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/admin/settings', allowedRoles: ['SystemAdmin', 'admin'] },
    ],
  },
];

const customerNavGroups: SidebarGroup[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { icon: ChefHat, label: 'Equipment Status', path: '/dashboard/equipment-status' },
      { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
      { icon: Package, label: 'Products', path: '/dashboard/products' },
      { icon: FileText, label: 'Documents', path: '/dashboard/documents' },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: Users, label: 'Staff', path: '/dashboard/staff' },
      { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
      { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ],
  },
];

interface SidebarProps {
  type: 'customer' | 'admin';
  isOpen: boolean;
  toggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  type,
  isOpen,
  toggle,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { role, user, logout } = useAuth();
  const navGroups = type === 'admin' ? adminNavGroups : customerNavGroups;

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      localStorage.removeItem('kb_auth_token');
    }
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header / Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
          <Link
            to={type === 'admin' ? '/admin' : '/dashboard'}
            className="flex items-center gap-3 overflow-hidden group focus:outline-hidden hover:opacity-90 transition-opacity"
            title="Go to Home Dashboard"
          >
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs shrink-0 tracking-wider group-hover:scale-105 transition-transform">
              KB
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-base tracking-tight truncate group-hover:text-primary transition-colors">
                    KitchenBots
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                    {type === 'admin' ? 'Ops' : 'Portal'}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate">
                  Commercial Automation
                </span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={toggle}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navGroups.map((group) => {
            const accessibleItems = group.items.filter((item) =>
              hasAccess(role, item.allowedRoles)
            );

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard' || item.path === '/admin'}
                        title={isCollapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-primary font-semibold shadow-xs'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                            isCollapsed && 'justify-center px-2'
                          )
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105" />
                        {!isCollapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary/10 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Profile & Actions Footer */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar/50 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border shadow-xs">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.name?.charAt(0) || (type === 'admin' ? 'A' : 'C')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || (type === 'admin' ? 'Ops Administrator' : 'Customer Account')}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {type === 'admin' ? (
                    <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                  ) : (
                    <Building2 className="w-3 h-3 text-primary shrink-0" />
                  )}
                  <span className="truncate capitalize">{role || (type === 'admin' ? 'Admin' : 'Client')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                window.location.href = type === 'admin' ? '/admin/settings' : '/dashboard/settings';
              }}
              title="Settings"
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors',
                isCollapsed ? 'w-full justify-center' : 'flex-1'
              )}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Help</span>}
            </button>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors',
                isCollapsed ? 'w-full justify-center' : 'flex-1'
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
