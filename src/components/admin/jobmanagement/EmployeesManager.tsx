import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobEmployees } from '@/hooks/useJobEmployees';
import EmployeeForm from './EmployeeForm';
import EmployeeStatsCards from './EmployeeStatsCards';
import EmployeeDetails from './EmployeeDetails';
import EmployeePaymentRecords from './EmployeePaymentRecords';
import { UserPlus, Edit, Phone, MapPin, Briefcase, Users, Eye, Receipt } from 'lucide-react';
import { JOB_DEPARTMENTS } from '@/lib/jobDepartments';

const EmployeesManager = () => {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useJobEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPaymentRecords, setShowPaymentRecords] = useState(false);
  const [paymentRecordsEmployee, setPaymentRecordsEmployee] = useState<any>(null);

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleViewDetails = (employee: any) => {
    navigate(`/admin/job-management/employee/${employee.id}`);
  };

  // Filter employees
  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJobType = selectedJobType === 'all' || employee.employee_type === selectedJobType;
    
    const employeeDepts = (employee.departments as string[]) || [];
    const matchesDepartment = selectedDepartment === 'all' || employeeDepts.includes(selectedDepartment);
    
    return matchesSearch && matchesJobType && matchesDepartment;
  });

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      'Cutting': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Stitching(Singer)': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Stitching(Powertable)': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      'Ironing': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Checking': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Packing': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'Maintenance': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Complete Master': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    };
    return colors[dept] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employees Management</h2>
          <p className="text-muted-foreground">Manage production workforce</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <EmployeeStatsCards employees={employees} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedJobType} onValueChange={setSelectedJobType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="direct">Direct Worker</SelectItem>
              <SelectItem value="contract">Contract Worker</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {JOB_DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Employee Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredEmployees && filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee: any) => {
            const departments = (employee.departments as string[]) || [];
            const contractor = employee.contractor;
            return (
              <Card key={employee.id} className="p-6 hover:shadow-lg transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.employee_code}</p>
                    </div>
                    <Badge className={employee.employee_type === 'direct' ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}>
                      {employee.employee_type === 'direct' ? 'Direct' : 'Contract'}
                    </Badge>
                  </div>

                  {/* Departments */}
                  {departments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {departments.map((dept) => (
                        <Badge
                          key={dept}
                          variant="outline"
                          className={`text-xs ${getDepartmentColor(dept)}`}
                        >
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                    {contractor?.contractor_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{contractor.contractor_name}</span>
                      </div>
                    )}
                    {employee.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{employee.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Badge className={employee.is_active ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(employee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPaymentRecordsEmployee(employee);
                          setShowPaymentRecords(true);
                        }}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No employees found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedJobType !== 'all' || selectedDepartment !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first employee'}
          </p>
          {!searchTerm && selectedJobType === 'all' && selectedDepartment === 'all' && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          )}
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Update employee information' : 'Add a new employee to the workforce'}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm employee={editingEmployee} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Payment Records Dialog */}
      <Dialog open={showPaymentRecords} onOpenChange={setShowPaymentRecords}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Records</DialogTitle>
            <DialogDescription>
              View complete payment history and earnings summary
            </DialogDescription>
          </DialogHeader>
          {paymentRecordsEmployee && (
            <EmployeePaymentRecords
              employeeId={paymentRecordsEmployee.id}
              employeeName={paymentRecordsEmployee.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesManager;
