import { Grid, Menu, Search, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationSystem } from '../NotificationSystem/NotificationSystem';

export const Header = ({ toggleSidebar, onSearchOpen }: { toggleSidebar: () => void, onSearchOpen: () => void }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="h-16 flex justify-between items-center px-4 lg:px-8 w-full bg-surface border-b border-border-default sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="hidden md:block text-lg lg:text-xl text-slate-900 font-heading font-semibold tracking-tight">KitchenBots</h1>
        
        <div className="relative w-full max-w-xs lg:w-80 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-400 cursor-pointer transition-all shadow-sm" 
            placeholder="Search operations... (⌘K)" 
            type="text"
            readOnly
            onClick={() => onSearchOpen()}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <NotificationSystem />
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-neutral-surface transition-colors hidden sm:block text-neutral-body"
            title={`Current theme: ${theme}`}
          >
            {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          <button className="p-2 rounded-md hover:bg-neutral-surface transition-colors hidden sm:block text-neutral-body">
            <Grid className="w-4 h-4" />
          </button>
          <span className="hidden lg:inline-block text-sm font-medium text-neutral-body cursor-pointer hover:text-brand-primary transition-colors ml-2">Help</span>
        </div>
        
        <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-slate-200">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Raj Malhotra'}</p>
            <p className="text-xs text-slate-500 font-medium">{user?.role === 'admin' ? 'Senior Admin' : 'Manager'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-semibold text-primary-700 shadow-sm text-sm">
            {user?.name?.charAt(0) || 'R'}
          </div>
        </div>
      </div>
    </header>
  );
};
