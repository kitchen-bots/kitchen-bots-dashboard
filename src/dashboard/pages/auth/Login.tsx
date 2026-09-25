import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '@/components/login-form';

export function Login() {
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const stateFrom = (location.state as any)?.from?.pathname;

  const handleSubmit = async (username: string, password: string) => {
    setError('');
    try {
      const normalized = username.trim();
      const usernameToSubmit =
        normalized.toLowerCase() === 'admin' ||
        normalized.toLowerCase() === 'admin@kitchenbots.com'
          ? 'Admin'
          : normalized;

      const user = await login(usernameToSubmit, password);
      const defaultDashboard = user.role === 'admin' ? '/admin' : '/customer';
      const navigateTo = redirect || stateFrom || defaultDashboard;
      navigate(navigateTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left Column: Branding and Login Form */}
      <div className="flex flex-col gap-4 p-6 sm:p-8 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-foreground group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <img
                src="/kitchenbots-icon.svg"
                alt="KitchenBots"
                className="h-5 w-5 object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight">KitchenBots</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Admin Control Center
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-6 sm:py-8">
          <div className="w-full max-w-sm">
            <LoginForm
              onSubmitLogin={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Hero Cover Image & Enterprise Automation Showcase */}
      <div className="relative hidden bg-muted lg:block overflow-hidden border-l border-border/40">
        <img
          src="/login-hero-bg.png"
          alt="KitchenBots Commercial Automation"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
          onError={(e) => {
            // Elegant fallback if cover image is unavailable
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 flex flex-col justify-end p-10 text-white">
          <div className="max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md shadow-2xl">
            <blockquote className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/25 text-primary-foreground text-xs font-semibold uppercase tracking-wider border border-primary/30">
                Enterprise Kitchen Automation
              </div>
              <p className="text-base font-medium leading-relaxed text-zinc-100">
                &ldquo;Intelligent robotics and automated culinary systems powering next-generation commercial kitchens.&rdquo;
              </p>
              <footer className="text-xs text-zinc-400 font-medium">
                KitchenBots Operational Systems
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
