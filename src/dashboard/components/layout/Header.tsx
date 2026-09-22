import React from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Monitor,
  Shield,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationSystem } from '../NotificationSystem/NotificationSystem';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { useLocation, Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, onSearchOpen }) => {
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Generate readable title from current pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[0] === 'admin' ? 'Operations' : 'Portal';
  const currentPage = pathParts[1]
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
    : 'Dashboard';

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      localStorage.removeItem('kb_auth_token');
    }
    window.location.href = '/login';
  };

  return (
    <header className="h-16 px-4 lg:px-6 w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors">
      {/* Left Section: Mobile toggle, breadcrumb path */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={pathParts[0] === 'admin' ? '/admin' : '/dashboard'}
            className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            title="Go to Home Dashboard"
          >
            {currentSection}
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-semibold truncate">{currentPage}</span>
        </div>
      </div>

      {/* Center Section: Quick Search Command Trigger */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          onClick={onSearchOpen}
          type="button"
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 hover:bg-muted border border-input rounded-lg transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span>Search operations, orders, products...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Section: Actions & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={onSearchOpen}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <NotificationSystem />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          title={`Theme: ${theme}`}
          aria-label="Toggle theme mode"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
        </button>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        {/* User Dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-accent transition-colors text-left outline-hidden cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize leading-tight">
                  {role || 'Admin'}
                </span>
              </div>
            </button>
          }
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || 'Administrator'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email || 'admin@kitchenbots.in'}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              window.location.href = location.pathname.startsWith('/admin')
                ? '/admin/settings'
                : '/dashboard/settings';
            }}
            className="cursor-pointer gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.location.href = location.pathname.startsWith('/admin')
                ? '/admin/users'
                : '/dashboard/staff';
            }}
            className="cursor-pointer gap-2"
          >
            <User className="w-4 h-4" />
            <span>Account & Roles</span>
          </DropdownMenuItem>
          {role && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Role: <strong className="text-foreground capitalize">{role}</strong></span>
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive gap-2">
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
};
