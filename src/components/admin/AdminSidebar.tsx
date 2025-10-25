import { 
  FileText, 
  Users, 
  Package, 
  History, 
  Mail, 
  ShoppingCart, 
  Newspaper,
  RotateCcw,
  LayoutDashboard,
  ClipboardList,
  Factory,
  Contact,
  Building2,
  Receipt,
  Shield
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
  { title: 'Orders', url: '/admin/orders', icon: ClipboardList, permission: 'view_orders' },
  { title: 'Production', url: '/admin/production', icon: Factory, permission: 'view_production' },
  { title: 'Branches', url: '/admin/branches', icon: Building2, permission: 'view_branches' },
  { title: 'Expenses', url: '/admin/expenses', icon: Receipt, permission: 'view_expenses' },
  { title: 'Generate Invoice', url: '/admin/invoice', icon: FileText, permission: 'view_invoice' },
  { title: 'Customers', url: '/admin/customers', icon: Users, permission: 'view_customers' },
  { title: 'Products', url: '/admin/products', icon: Package, permission: 'view_products' },
  { title: 'Contacts', url: '/admin/contacts', icon: Contact, permission: 'view_contacts' },
  { title: 'History', url: '/admin/history', icon: History, permission: 'view_history' },
  { title: 'Contact Inquiries', url: '/admin/inquiries', icon: Mail, permission: 'view_inquiries' },
  { title: 'Bulk Orders', url: '/admin/bulk-orders', icon: ShoppingCart, permission: 'view_bulk_orders' },
  { title: 'Newsletter', url: '/admin/newsletter', icon: Newspaper, permission: 'view_newsletter' },
  { title: 'Invoice Reset', url: '/admin/invoice-reset', icon: RotateCcw, permission: 'manage_invoice_reset' },
  { title: 'RBAC Management', url: '/admin/rbac', icon: Shield, permission: 'manage_rbac' },
];

export function AdminSidebar() {
  const { hasPermission } = useAuth();

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        isActive 
                          ? 'bg-accent/50' 
                          : 'hover:bg-accent/50'
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}