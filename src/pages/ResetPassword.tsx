import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the password reset email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        toast.error('Invalid or expired reset link');
        navigate('/forgot-password');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password
    try {
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors[0].message);
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      navigate('/auth');
    }
    setLoading(false);
  };

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verifying reset link...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-neon/20" />
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link to="/">
              <img src="/logo.png" alt="Feather Fashions" className="h-16 w-auto brightness-0 invert" />
            </Link>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-athletic font-bold leading-tight">
              CREATE NEW
              <span className="block text-neon">PASSWORD</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Choose a strong password to keep your account secure. You're almost back in action!
            </p>

            {/* Security Tips */}
            <div className="space-y-3 pt-4">
              <p className="text-sm font-medium text-white/90">Password tips:</p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  Use at least 6 characters
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  Mix letters, numbers & symbols
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  Avoid common words
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-sm text-white/60">
            © 2024 Feather Fashions. All rights reserved.
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-neon/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-neon/10 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <img src="/logo.png" alt="Feather Fashions" className="h-20 w-auto" />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-athletic font-bold tracking-tight">
              Set New Password
            </h2>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-muted/50 border-border/50 focus:border-neon focus:ring-neon/20 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-muted/50 border-border/50 focus:border-neon focus:ring-neon/20 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-sm ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                {password === confirmPassword ? (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <span className="h-4 w-4 flex items-center justify-center">✗</span>
                    Passwords do not match
                  </>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-neon hover:bg-neon/90 text-white font-semibold rounded-xl shadow-lg shadow-neon/25 transition-all duration-300 hover:shadow-neon/40 hover:scale-[1.02] group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Update Password
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Back to Sign In */}
          <div className="text-center pt-4">
            <Link 
              to="/auth" 
              className="text-sm text-muted-foreground hover:text-neon transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
