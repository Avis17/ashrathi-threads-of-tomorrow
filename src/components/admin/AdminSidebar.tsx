import { 
  FileText, 
  Users, 
  Package, 
  History, 
  Mail, 
  ShoppingCart, 
  Newspaper,
  RotateCcw
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Generate Invoice', url: '/admin/invoice', icon: FileText },
  { title: 'Customers', url: '/admin/customers', icon: Users },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'History', url: '/admin/history', icon: History },
  { title: 'Contact Inquiries', url: '/admin/inquiries', icon: Mail },
  { title: 'Bulk Orders', url: '/admin/bulk-orders', icon: ShoppingCart },
  { title: 'Newsletter', url: '/admin/newsletter', icon: Newspaper },
  { title: 'Invoice Reset', url: '/admin/invoice-reset', icon: RotateCcw },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            {!collapsed && <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>}
            <SidebarTrigger />
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
                          ? 'bg-accent text-accent-foreground font-medium' 
                          : 'hover:bg-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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