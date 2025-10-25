import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Permission {
  permission_name: string;
  description: string;
  category: string;
  action: string;
  resource: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  userPermissions: Permission[];
  hasPermission: (permission: string) => boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status and permissions when session changes
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
            checkSuperAdmin(session.user.id);
            loadUserPermissions(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserPermissions([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
        checkSuperAdmin(session.user.id);
        loadUserPermissions(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const checkSuperAdmin = async (userId: string) => {
    const { data, error } = await supabase.rpc('is_super_admin', { _user_id: userId });
    if (!error && data !== null) {
      setIsSuperAdmin(data);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_permissions', { _user_id: userId });
    if (!error && data) {
      setUserPermissions(data);
    }
  };

  const refreshPermissions = async () => {
    if (user?.id) {
      await loadUserPermissions(user.id);
      await checkSuperAdmin(user.id);
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Super admin has all permissions
    if (isSuperAdmin) return true;
    // Check if user has the specific permission
    return userPermissions.some(p => p.permission_name === permission);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAdmin, 
      isSuperAdmin,
      loading, 
      userPermissions,
      hasPermission,
      signUp, 
      signIn, 
      signOut,
      refreshPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
