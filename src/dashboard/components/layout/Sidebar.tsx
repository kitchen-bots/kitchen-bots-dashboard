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
        <div
          className={cn(
            'h-16 flex items-center border-b border-sidebar-border transition-all duration-300 relative',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          <Link
            to={type === 'admin' ? '/admin' : '/dashboard'}
            className={cn(
              'flex items-center overflow-hidden group focus:outline-hidden hover:opacity-90 transition-opacity',
              isCollapsed ? 'justify-center' : 'gap-3'
            )}
            title="Go to Home Dashboard"
          >
            <img
              src="/kitchenbots-icon.svg"
              alt="KitchenBots"
              className="w-9 h-9 rounded-lg shrink-0 object-contain shadow-xs group-hover:scale-105 transition-transform"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-base tracking-tight truncate group-hover:text-primary transition-colors">
                  KitchenBots
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {type === 'admin' ? 'Admin Dashboard' : 'Customer Portal'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={cn(
                'hidden lg:flex items-center justify-center transition-all duration-150 cursor-pointer',
                isCollapsed
                  ? 'absolute -right-3 top-5 z-50 w-6 h-6 rounded-full border border-sidebar-border bg-sidebar text-muted-foreground hover:text-foreground hover:bg-sidebar-accent shadow-xs'
                  : 'p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md'
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={toggle}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Content */}
        <div
          className={cn(
            'flex-1 overflow-y-auto py-4 custom-scrollbar',
            isCollapsed ? 'px-2 space-y-3' : 'px-3 space-y-6'
          )}
        >
          {navGroups.map((group, groupIdx) => {
            const accessibleItems = group.items.filter((item) =>
              hasAccess(role, item.allowedRoles)
            );

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!isCollapsed ? (
                  <div className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </div>
                ) : (
                  groupIdx > 0 && <div className="my-2 border-t border-sidebar-border/60 mx-2" />
                )}
                <div className="space-y-1">
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
                            'group flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-primary font-semibold shadow-xs'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                            isCollapsed
                              ? 'h-10 w-10 mx-auto justify-center p-0'
                              : 'gap-3 px-3 py-2'
                          )
                        }
                      >
                        <Icon
                          className={cn(
                            'shrink-0 transition-transform duration-150 group-hover:scale-105',
                            isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                          )}
                        />
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
        <div
          className={cn(
            'border-t border-sidebar-border bg-sidebar/50',
            isCollapsed ? 'p-2 space-y-2 flex flex-col items-center' : 'p-3 space-y-2'
          )}
        >
          {isCollapsed ? (
            <>
              {/* User Avatar */}
              <div
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-border shrink-0 cursor-default"
                title={`${user?.name || (type === 'admin' ? 'Ops Administrator' : 'Customer Account')} (${role || 'User'})`}
              >
                {user?.name?.charAt(0) || (type === 'admin' ? 'A' : 'C')}
              </div>

              {/* Help & Settings */}
              <button
                onClick={() => {
                  window.location.href = type === 'admin' ? '/admin/settings' : '/dashboard/settings';
                }}
                title="Help & Settings"
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 shrink-0" />
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="w-10 h-10 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5 shrink-0" />
              </button>
            </>
          ) : (
            <>
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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    window.location.href = type === 'admin' ? '/admin/settings' : '/dashboard/settings';
                  }}
                  title="Settings"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors flex-1 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Help</span>
                </button>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
