import { Card } from '@/components/ui/card';
import { Users, Scissors, Shirt, Flame, CheckCircle, Package, Wrench, UserCheck, UserX } from 'lucide-react';
import { JOB_DEPARTMENTS } from '@/lib/jobDepartments';

interface EmployeeStatsCardsProps {
  employees: any[] | undefined;
}

const getDepartmentIcon = (dept: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Cutting': <Scissors className="h-5 w-5" />,
    'Stitching(Singer)': <Shirt className="h-5 w-5" />,
    'Stitching(Powertable)': <Shirt className="h-5 w-5" />,
    'Ironing': <Flame className="h-5 w-5" />,
    'Checking': <CheckCircle className="h-5 w-5" />,
    'Packing': <Package className="h-5 w-5" />,
    'Maintenance': <Wrench className="h-5 w-5" />,
  };
  return icons[dept] || <Users className="h-5 w-5" />;
};

const getDepartmentColor = (dept: string) => {
  const colors: Record<string, string> = {
    'Cutting': 'from-blue-500 to-blue-600',
    'Stitching(Singer)': 'from-purple-500 to-purple-600',
    'Stitching(Powertable)': 'from-violet-500 to-violet-600',
    'Ironing': 'from-orange-500 to-orange-600',
    'Checking': 'from-green-500 to-green-600',
    'Packing': 'from-cyan-500 to-cyan-600',
    'Maintenance': 'from-yellow-500 to-yellow-600',
  };
  return colors[dept] || 'from-gray-500 to-gray-600';
};

const EmployeeStatsCards = ({ employees }: EmployeeStatsCardsProps) => {
  if (!employees) return null;

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.is_active).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  const directEmployees = employees.filter(e => e.employee_type === 'direct').length;
  const contractEmployees = employees.filter(e => e.employee_type === 'contract').length;

  // Count employees per department
  const departmentCounts = JOB_DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = employees.filter(e => {
      const depts = (e.departments as string[]) || [];
      return depts.includes(dept);
    }).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEmployees}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/20">
              <UserX className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">{inactiveEmployees}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{directEmployees}</p>
              <p className="text-xs text-muted-foreground">Direct</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{contractEmployees}</p>
              <p className="text-xs text-muted-foreground">Contract</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department-wise Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {JOB_DEPARTMENTS.map((dept) => (
          <Card 
            key={dept} 
            className={`p-3 bg-gradient-to-br ${getDepartmentColor(dept)} text-white`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 rounded-lg bg-white/20">
                {getDepartmentIcon(dept)}
              </div>
              <p className="text-2xl font-bold">{departmentCounts[dept]}</p>
              <p className="text-xs opacity-90 leading-tight">{dept.replace('(', '\n(')}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeStatsCards;
