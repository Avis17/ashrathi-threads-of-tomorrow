export interface Role {
  name: string;
  display_name: string;
  description: string | null;
  is_system_role: boolean;
  user_count?: number;
  permission_count?: number;
}

export const getRoleColor = (roleName: string): string => {
  const colorMap: Record<string, string> = {
    admin: 'bg-primary text-primary-foreground',
    manager: 'bg-purple-500 text-white',
    accountant: 'bg-green-500 text-white',
    sales: 'bg-orange-500 text-white',
    viewer: 'bg-gray-500 text-white',
  };
  
  return colorMap[roleName] || 'bg-blue-500 text-white';
};

export const getRoleBorderColor = (roleName: string): string => {
  const colorMap: Record<string, string> = {
    admin: 'border-primary',
    manager: 'border-purple-500',
    accountant: 'border-green-500',
    sales: 'border-orange-500',
    viewer: 'border-gray-500',
  };
  
  return colorMap[roleName] || 'border-blue-500';
};

export const validateRoleName = (name: string): { valid: boolean; error?: string } => {
  if (!name) {
    return { valid: false, error: 'Role name is required' };
  }
  
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return { 
      valid: false, 
      error: 'Role name must start with a letter and contain only lowercase letters, numbers, and underscores' 
    };
  }
  
  if (name.length < 3) {
    return { valid: false, error: 'Role name must be at least 3 characters' };
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Role name must not exceed 50 characters' };
  }
  
  return { valid: true };
};
