import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '@/components/login-form';
import { getMediaUrl } from '../../lib/cdn';

const SLIDES = [
  { id: 1, name: 'blog-1.png', alt: 'Commercial Kitchen Robotics 1' },
  { id: 2, name: 'blog-2.png', alt: 'Commercial Kitchen Robotics 2' },
  { id: 3, name: 'blog-3.png', alt: 'Commercial Kitchen Robotics 3' },
  { id: 4, name: 'blog-4.png', alt: 'Commercial Kitchen Robotics 4' },
  { id: 5, name: 'blog-5.png', alt: 'Commercial Kitchen Robotics 5' },
  { id: 6, name: 'blog-6.png', alt: 'Commercial Kitchen Robotics 6' },
];

export function Login() {
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const stateFrom = (location.state as any)?.from?.pathname;

  // Auto-play slideshow with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

      {/* Right Column: Hero Image Slideshow (blog-1 to blog-6) */}
      <div className="relative hidden bg-muted lg:block overflow-hidden border-l border-border/40">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          const imageUrl = getMediaUrl(`/images/redesign/${slide.name}`);
          const fallbackUrl = `/images/redesign/${slide.name}`;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={imageUrl}
                alt={slide.alt}
                className="h-full w-full object-cover dark:brightness-[0.75]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== fallbackUrl && !target.src.endsWith(fallbackUrl)) {
                    target.src = fallbackUrl;
                  }
                }}
              />
            </div>
          );
        })}

        {/* Subtle vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-20" />

        {/* Slideshow Navigation Indicator Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-white shadow-md'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
