import { MapPin, BarChart3, Factory, Package, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'coming-soon';
  accentColor: string;
  route?: string;
}

const AppCard = ({ title, description, icon, status, accentColor, route }: AppCardProps) => {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-card`}>
      {/* Accent top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />
      
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${accentColor}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${accentColor} bg-opacity-10`}>
            <div className="text-foreground">
              {icon}
            </div>
          </div>
          <Badge 
            variant={status === 'active' ? 'default' : 'secondary'}
            className={status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-muted text-muted-foreground'}
          >
            {status === 'active' ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Coming Soon
              </span>
            )}
          </Badge>
        </div>
        <CardTitle className="text-xl font-semibold mt-4">{title}</CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {status === 'active' && route ? (
          <a href={route} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full group/btn" variant="default">
              Launch App
              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </a>
        ) : (
          <Button disabled className="w-full" variant="secondary">
            Coming Soon
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const apps: AppCardProps[] = [
  {
    title: 'Market Intel',
    description: 'Field intelligence system for capturing shop visits, buyer data, and market insights while visiting markets physically.',
    icon: <MapPin className="h-6 w-6" />,
    status: 'active',
    accentColor: 'bg-blue-500',
    route: '/market-intel'
  },
  {
    title: 'Admin Forms',
    description: 'Quick data entry forms for job orders, companies, purchases, expenses, customers, and products.',
    icon: <Package className="h-6 w-6" />,
    status: 'active',
    accentColor: 'bg-emerald-500',
    route: '/admin-forms'
  },
  {
    title: 'Analytics Hub',
    description: 'Advanced business analytics, custom reports, and data visualization for comprehensive business insights.',
    icon: <BarChart3 className="h-6 w-6" />,
    status: 'coming-soon',
    accentColor: 'bg-purple-500'
  },
  {
    title: 'Production Tracker',
    description: 'Real-time production monitoring, batch tracking, and factory floor management system.',
    icon: <Factory className="h-6 w-6" />,
    status: 'coming-soon',
    accentColor: 'bg-orange-500'
  },
  {
    title: 'Inventory Scanner',
    description: 'Mobile-first inventory management with barcode scanning and stock level tracking.',
    icon: <Package className="h-6 w-6" />,
    status: 'coming-soon',
    accentColor: 'bg-teal-500'
  }
];

export default function FeatherApps() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Feather Apps
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mt-2 max-w-2xl">
            Internal applications suite for Feather Fashions. Launch specialized tools designed for different aspects of your business operations.
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => (
            <AppCard key={app.title} {...app} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>More internal applications are being developed. Stay tuned for updates!</p>
        </div>
      </div>
    </div>
  );
}
