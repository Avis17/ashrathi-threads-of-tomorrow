import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CanAccessProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const CanAccess = ({ permission, children, fallback = null }: CanAccessProps) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
