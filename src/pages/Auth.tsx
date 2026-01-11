import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Ship, Package, Globe } from 'lucide-react';
import authExportImage from '@/assets/auth-export-logistics.jpg';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate(isAdmin ? '/admin/invoice' : '/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors[0].message);
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Logged in successfully!');
    }
  };

  return (
    <div className="min-h-screen flex -mt-[76px] pt-[76px]">
      {/* Left Side - Export Logistics Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${authExportImage})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/60 to-primary/20" />
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link to="/" className="inline-block">
              <div className="flex flex-col items-start leading-none">
                <span className="text-2xl font-serif font-light tracking-[0.35em] text-white">
                  FEATHER
                </span>
                <span className="text-xs font-medium tracking-[0.5em] text-white/70 uppercase mt-1">
                  FASHIONS
                </span>
              </div>
            </Link>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-light leading-tight">
              Global Export
              <span className="block text-primary mt-2">Partner Portal</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Access your B2B dashboard for order tracking, invoices, and export documentation.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              {[
                { icon: Ship, label: 'FOB / CIF Terms' },
                { icon: Package, label: 'Bulk Orders' },
                { icon: Globe, label: 'Global Shipping' }
              ].map((feature) => (
                <span 
                  key={feature.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium border border-white/20"
                >
                  <feature.icon className="h-4 w-4" />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} Feather Fashions. Export Manufacturer, Tiruppur, India.
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex flex-col items-center leading-none">
              <span className="text-2xl font-serif font-light tracking-[0.35em] text-foreground">
                FEATHER
              </span>
              <span className="text-xs font-medium tracking-[0.5em] text-muted-foreground uppercase mt-1">
                FASHIONS
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-serif font-light tracking-tight">
              Partner Login
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your B2B dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
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

            <Button 
              type="submit" 
              className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              This portal is for registered B2B partners only. For new business inquiries, please{' '}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                contact us
              </Link>
              .
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
