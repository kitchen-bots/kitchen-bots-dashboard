import { ReactNode } from 'react';
import { Sidebar, Header } from '../components/layout';

import { GlobalSearch } from '../components/GlobalSearch/GlobalSearch';
import { CommandPalette } from '../components/CommandPalette/CommandPalette';
import { Outlet } from 'react-router-dom';
import { AnimatedPage } from '../components/ui';

import { useState } from 'react';

export const CustomerLayout = ({ children }: { children?: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-y-auto custom-scrollbar">

      <Sidebar type="customer" isOpen={isSidebarOpen} toggle={toggleSidebar} />
      
      <div 
        className={`transition-all duration-300 flex flex-col min-h-screen
          ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}
      >
        <Header toggleSidebar={toggleSidebar} onSearchOpen={() => setGlobalSearchOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8 w-full max-w-screen-2xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
          <AnimatedPage>
            {children || <Outlet />}
          </AnimatedPage>
        </main>
      </div>

      <GlobalSearch isOpen={isGlobalSearchOpen} onOpenChange={setGlobalSearchOpen} />
      <CommandPalette isOpen={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
};
