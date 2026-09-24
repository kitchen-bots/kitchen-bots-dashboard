import { ReactNode, useState } from 'react';
import { Sidebar, Header } from '../components/layout';
import { GlobalSearch } from '../components/GlobalSearch/GlobalSearch';
import { CommandPalette } from '../components/CommandPalette/CommandPalette';
import { QuickActionsFAB } from '../components/common/QuickActionsFAB';
import { Outlet } from 'react-router-dom';
import { AnimatedPage } from '../components/ui';
import { cn } from '../utils/cn';

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex">
      {/* Sidebar */}
      <Sidebar
        type="admin"
        isOpen={isMobileSidebarOpen}
        toggle={toggleMobileSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out flex flex-col flex-1 min-w-0 min-h-screen',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Header
          toggleSidebar={toggleMobileSidebar}
          onSearchOpen={() => setCommandPaletteOpen(true)}
        />

        <main
          className={cn(
            'flex-1 p-4 lg:p-6 w-full max-w-screen-2xl mx-auto custom-scrollbar',
            isGlobalSearchOpen || isCommandPaletteOpen
              ? 'overflow-hidden select-none pointer-events-none'
              : 'overflow-y-auto'
          )}
        >
          <AnimatedPage>
            {children || <Outlet />}
          </AnimatedPage>
        </main>
      </div>

      <GlobalSearch isOpen={isGlobalSearchOpen} onOpenChange={setGlobalSearchOpen} />
      <CommandPalette isOpen={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <QuickActionsFAB />
    </div>
  );
};
