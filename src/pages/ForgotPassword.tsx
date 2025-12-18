import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, CheckCircle, RefreshCw } from 'lucide-react';

const emailSchema = z.string().email('Invalid email address');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
    } catch (err: any) {
      toast.error(err.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { email },
      });

      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        setEmailSent(true);
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      toast.error('Failed to send reset email. Please try again.');
      console.error('Password reset error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
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
              RESET YOUR
              <span className="block text-neon">PASSWORD</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              No worries! We'll send you a secure link to reset your password and get you back on track.
            </p>
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

          {!emailSent ? (
            <>
              {/* Header */}
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-athletic font-bold tracking-tight">
                  Forgot Password?
                </h2>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a reset link
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
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-neon focus:ring-neon/20 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-neon hover:bg-neon/90 text-white font-semibold rounded-xl shadow-lg shadow-neon/25 transition-all duration-300 hover:shadow-neon/40 hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-neon/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-neon" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-athletic font-bold tracking-tight">
                  Check Your Email
                </h2>
                <p className="text-muted-foreground">
                  We've sent a password reset link to
                </p>
                <p className="font-semibold text-foreground">{email}</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full h-12 border-2 border-border/50 hover:border-neon/50 rounded-xl font-medium transition-all duration-300 hover:bg-neon/5"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Email
              </Button>
            </div>
          )}

          {/* Back to Sign In */}
          <div className="pt-4">
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-neon transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
