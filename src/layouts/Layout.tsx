import React from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  Settings, 
  History, 
  Star, 
  LogOut, 
  Github, 
  ExternalLink,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  FileCode,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '../components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, activePage }) => {
  const { user, logout, token } = useGitHub();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(token ? true : false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activePage]);

  const menuItems: { id: string; label: string; icon: any; disabled?: boolean }[] = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    ...(token ? [
      { id: 'dashboard', label: 'Workspaces', icon: LayoutDashboard },
      { id: 'editor', label: 'Live Editor', icon: Zap },
    ] : []),
  ];

  return (
    <div className="h-screen w-full flex bg-background text-foreground font-sans overflow-hidden relative">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="h-full border-r border-border bg-card z-30 hidden md:flex flex-col relative"
      >
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-link/5 p-1.5 shrink-0 border border-border">
            <img src="/logo.png" alt="RemoteConfig Logo" className="w-full h-full object-contain" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[18px] font-semibold tracking-tight text-foreground truncate"
            >
              RemoteConfig<span className="text-link">.io</span>
            </motion.span>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 custom-scrollbar">
          <div className="space-y-1 py-6">
            {menuItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => !item.disabled && onNavigate(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all ${
                    activePage === item.id 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${activePage === item.id ? 'text-foreground' : ''}`} />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {activePage === item.id && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 mt-auto border-t border-border">
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-all text-left group outline-none">
                <div className="w-8 h-8 rounded-full border border-border bg-muted overflow-hidden shrink-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.login} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.login}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">Administrator</p>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border rounded-lg shadow-xl">
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-3 px-4">Account Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={logout} className="text-destructive font-medium py-3 px-4 focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-10 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest"
              onClick={() => onNavigate('dashboard')}
            >
              <Github className="w-4 h-4" />
              {isSidebarOpen ? 'Sign In' : null}
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10 bg-background noise-bg">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0 sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${token ? 'bg-green-500' : 'bg-amber-500'}`} />
              App / <span className="text-link">{activePage}</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <button 
                onClick={() => onNavigate('docs')}
                className="hover:text-foreground transition-colors"
              >
                Docs
              </button>
              <ThemeToggle />
            </div>
            {!token && (activePage === 'home' || activePage === 'docs') && (
              <Button 
                size="sm" 
                className="rounded-xl px-6 bg-link hover:bg-link/90 text-white font-bold h-9"
                onClick={() => onNavigate('dashboard')}
              >
                Sign In
              </Button>
            )}
            {token && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                API: <span className="text-green-600 ml-1">Live</span>
              </div>
            )}
          </div>
        </header>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="max-w-[1400px] mx-auto p-0">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

};
