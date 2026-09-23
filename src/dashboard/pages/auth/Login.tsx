import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ChefHat, Lock, Mail, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/Form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Production login (Phase 02, Task 1): Firebase email/password plus Google
 * sign-in. No fixed credentials. Redirects follow the authenticated role.
 */
export function Login() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { login, loginWithGoogle, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const stateFrom = (location.state as any)?.from?.pathname;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const navigateAfterAuth = (role: string | null | undefined) => {
    const defaultDashboard = role === 'admin' || role === 'SystemAdmin' ? '/admin' : '/dashboard';
    navigate(redirect || stateFrom || defaultDashboard, { replace: true });
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setNotice('');

    try {
      const user = await login(data.email, data.password);
      navigateAfterAuth(user.role);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  const onGoogleSignIn = async () => {
    setError('');
    setNotice('');
    try {
      const user = await loginWithGoogle();
      navigateAfterAuth(user.role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  const onForgotPassword = async () => {
    setError('');
    setNotice('');
    const email = form.getValues('email');
    if (!email) {
      setError('Enter your email address first, then click "Forgot password".');
      return;
    }
    try {
      await resetPassword(email);
      setNotice('If an account exists for that address, a reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-xl border border-border p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted mt-2 text-center">Sign in to your Kitchen Bots account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}
              {notice && (
                <Alert>
                  {notice}
                </Alert>
              )}

              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        leftIcon={<Mail className="h-5 w-5" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        leftIcon={<Lock className="h-5 w-5" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between mt-2">
                <FormField
                  control={form.control as any}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-6 text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Sign in
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={onGoogleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1H12v2.8h5.35c-.25 1.45-1.7 4.25-5.35 4.25-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.05.8 3.75 1.45l2.55-2.5C16.75 3.75 14.6 2.8 12 2.8 6.95 2.8 2.9 6.85 2.9 11.9s4.05 9.1 9.1 9.1c5.25 0 8.75-3.7 8.75-8.9 0-.6-.05-1-.15-1z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                <ShieldCheck className="h-3.5 w-3.5" />
                Accounts must have a verified email address before sign-in.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
