import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_ROLES } from '../../utils/rbac';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const isAdmin = role && ADMIN_ROLES.includes(role);
  const homePath = isAdmin ? '/admin' : '/dashboard';

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      localStorage.removeItem('kb_auth_token');
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-border shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Access Restricted
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Your current account role ({role || 'Guest'}) does not have authorization to view this section.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <Button
            type="button"
            className="w-full gap-2"
            onClick={() => navigate(homePath)}
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Dashboard</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
