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
  Warehouse,
  Briefcase,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Orders', url: '/admin/orders', icon: ClipboardList },
  { title: 'Production', url: '/admin/production', icon: Factory },
  { title: 'Job Orders', url: '/admin/job-orders', icon: Briefcase },
  { title: 'Stock Summary', url: '/admin/stock-summary', icon: Warehouse },
  { title: 'Branches', url: '/admin/branches', icon: Building2 },
  { title: 'Expenses', url: '/admin/expenses', icon: Receipt },
  { title: 'Generate Invoice', url: '/admin/invoice', icon: FileText },
  { title: 'Customers', url: '/admin/customers', icon: Users },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Contacts', url: '/admin/contacts', icon: Contact },
  { title: 'History', url: '/admin/history', icon: History },
  { title: 'Contact Inquiries', url: '/admin/inquiries', icon: Mail },
  { title: 'Bulk Orders', url: '/admin/bulk-orders', icon: ShoppingCart },
  { title: 'Newsletter', url: '/admin/newsletter', icon: Newspaper },
  { title: 'Invoice Reset', url: '/admin/invoice-reset', icon: RotateCcw },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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