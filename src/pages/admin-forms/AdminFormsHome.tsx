import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Building2, ShoppingCart, Receipt, 
  Users, Package, ArrowRight, ClipboardList 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FormCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  route: string;
}

const FormCard = ({ title, description, icon, accentColor, route }: FormCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/10 backdrop-blur-sm">
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${accentColor}`} />
      
      <CardHeader className="pb-3">
        <div className={`p-3 rounded-xl ${accentColor} bg-opacity-20 w-fit`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl font-semibold mt-4 text-white">{title}</CardTitle>
        <CardDescription className="text-slate-300 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Button 
          className="w-full group/btn bg-white/10 hover:bg-white/20 text-white border-white/20"
          variant="outline"
          onClick={() => navigate(route)}
        >
          Open Form
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  );
};

const formCards: FormCardProps[] = [
  {
    title: 'Add Job Order',
    description: 'Create a new external job order with operations, pricing, and company details.',
    icon: <Briefcase className="h-6 w-6" />,
    accentColor: 'bg-blue-500',
    route: '/admin-forms/add-job'
  },
  {
    title: 'Register Company',
    description: 'Add a new company for external job orders with contact and payment details.',
    icon: <Building2 className="h-6 w-6" />,
    accentColor: 'bg-purple-500',
    route: '/admin-forms/add-company'
  },
  {
    title: 'Create Purchase Order',
    description: 'Record new purchases with supplier, line items, and GST details.',
    icon: <ShoppingCart className="h-6 w-6" />,
    accentColor: 'bg-orange-500',
    route: '/admin-forms/add-purchase'
  },
  {
    title: 'Add Expense',
    description: 'Log business expenses with category, vendor, and payment information.',
    icon: <Receipt className="h-6 w-6" />,
    accentColor: 'bg-red-500',
    route: '/admin-forms/add-expense'
  },
  {
    title: 'Add Customer',
    description: 'Register a new wholesale customer with company and contact details.',
    icon: <Users className="h-6 w-6" />,
    accentColor: 'bg-emerald-500',
    route: '/admin-forms/add-customer'
  },
  {
    title: 'Add Product',
    description: 'Create a new product with pricing, inventory, and catalog details.',
    icon: <Package className="h-6 w-6" />,
    accentColor: 'bg-cyan-500',
    route: '/admin-forms/add-product'
  },
];

export default function AdminFormsHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <ClipboardList className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Admin Forms
            </h1>
          </div>
          <p className="text-slate-300 text-lg mt-2 max-w-2xl">
            Quick data entry forms for your business operations. Select a form below to add new records.
          </p>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formCards.map((form) => (
            <FormCard key={form.title} {...form} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-sm text-slate-400">
          <p>All form submissions are saved to the database and visible in the admin dashboard.</p>
        </div>
      </div>
    </div>
  );
}
