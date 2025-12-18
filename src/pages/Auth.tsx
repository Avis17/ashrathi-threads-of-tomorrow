import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, user, isAdmin } = useAuth();
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

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success('Logged in successfully!');
      }
    } else {
      if (!fullName.trim()) {
        toast.error('Please enter your full name');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success('Account created successfully!');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
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
              ELEVATE YOUR
              <span className="block text-neon">PERFORMANCE</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Join the Feather Fashions community. Premium activewear designed for athletes who demand excellence.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              {['4-Way Stretch', 'Moisture-Wicking', 'Squat-Proof'].map((feature) => (
                <span 
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium border border-white/20"
                >
                  {feature}
                </span>
              ))}
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

      {/* Right Side - Auth Form */}
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
              {isLogin ? 'Welcome Back' : 'Join the Team'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Sign in to access your account'
                : 'Create an account to get started'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-neon focus:ring-neon/20 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-neon focus:ring-neon/20 rounded-xl"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-sm text-neon hover:text-neon/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
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
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">
                {isLogin ? 'New to Feather Fashions?' : 'Already have an account?'}
              </span>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full h-12 border-2 border-border/50 hover:border-neon/50 rounded-xl font-medium transition-all duration-300 hover:bg-neon/5"
          >
            {isLogin ? 'Create an Account' : 'Sign In Instead'}
          </button>

          {/* Back to Home */}
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-neon transition-colors inline-flex items-center gap-1"
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
