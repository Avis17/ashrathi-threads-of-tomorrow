import { 
  FileText, 
  Users, 
  Package, 
  History, 
  Mail,
  Newspaper,
  RotateCcw,
  LayoutDashboard,
  ClipboardList,
  Contact,
  Building2,
  Receipt,
  Shirt,
  Settings,
  Sparkles,
  Briefcase,
  ScrollText,
  Tags,
  ShoppingBag,
  Boxes,
  ShieldCheck,
  Activity,
  Truck
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
  { title: 'Feather Apps', url: '/admin/apps', icon: Boxes },
  { title: 'App Access', url: '/admin/app-access', icon: ShieldCheck },
  { title: 'Orders', url: '/admin/orders', icon: ClipboardList },
  { title: 'External Job Orders', url: '/admin/external-jobs', icon: Briefcase },
  { title: 'Delivery Challan', url: '/admin/delivery-challan', icon: Truck },
  { title: 'Job Management', url: '/admin/job-management', icon: Shirt },
  { title: 'Returns & Quality', url: '/admin/returns', icon: RotateCcw },
  { title: 'Branches', url: '/admin/branches', icon: Building2 },
  { title: 'Purchases & Expenses', url: '/admin/purchases', icon: ShoppingBag },
  { title: 'Expenses', url: '/admin/expenses', icon: Receipt },
  { title: 'Generate Invoice', url: '/admin/invoice', icon: FileText },
  { title: 'Company Letterhead', url: '/admin/letterhead', icon: ScrollText },
  { title: 'Label Generator', url: '/admin/label-generator', icon: Tags },
  { title: 'Customers', url: '/admin/customers', icon: Users },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Generate Products', url: '/admin/seed-products', icon: Sparkles },
  { title: 'Contacts', url: '/admin/contacts', icon: Contact },
  { title: 'History', url: '/admin/history', icon: History },
  { title: 'Enquiries', url: '/admin/enquiries', icon: Mail },
  { title: 'Newsletter', url: '/admin/newsletter', icon: Newspaper },
  { title: 'Activity Logs', url: '/admin/activity-logs', icon: Activity },
  { title: 'Invoice Reset', url: '/admin/invoice-reset', icon: Settings },
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