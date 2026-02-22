import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useStaffMembers } from '@/hooks/useStaff';
import StaffForm from './StaffForm';
import { UserPlus, Phone, Calendar, IndianRupee, Eye, Users, StickyNote } from 'lucide-react';
import { format } from 'date-fns';

const StaffManager = () => {
  const navigate = useNavigate();
  const { data: staffMembers, isLoading } = useStaffMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = staffMembers?.filter((s) => {
    const name = s.employee?.name || '';
    const code = s.employee?.employee_code || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff members, salaries & attendance</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{staffMembers?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{staffMembers?.filter(s => s.is_active).length || 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <IndianRupee className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{staffMembers?.filter(s => s.salary_type === 'monthly').length || 0}</p>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <IndianRupee className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{staffMembers?.filter(s => s.salary_type === 'weekly').length || 0}</p>
              <p className="text-xs text-muted-foreground">Weekly</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search by name or employee code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Staff Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6"><Skeleton className="h-24 w-full" /></Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((staff) => (
            <Card
              key={staff.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/admin/job-management/staff/${staff.id}`)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {staff.employee?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{staff.employee?.employee_code}</p>
                  </div>
                  <Badge className={staff.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {staff.salary_type && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span className="capitalize">{staff.salary_type}</span>
                      {staff.salary_amount && <span className="font-medium text-foreground">₹{staff.salary_amount.toLocaleString()}</span>}
                    </div>
                  )}
                  {staff.employee?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{staff.employee.phone}</span>
                    </div>
                  )}
                  {staff.joined_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {format(new Date(staff.joined_date), 'dd MMM yyyy')}</span>
                    </div>
                  )}
                  {staff.notes && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <StickyNote className="h-4 w-4" />
                      <span className="truncate">{staff.notes}</span>
                    </div>
                  )}
                </div>

                {/* Departments */}
                {staff.employee?.departments && (staff.employee.departments as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(staff.employee.departments as string[]).map((dept) => (
                      <Badge key={dept} variant="outline" className="text-xs">{dept}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end pt-2 border-t">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" /> View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first staff member'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff
            </Button>
          )}
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Select an employee and configure staff details</DialogDescription>
          </DialogHeader>
          <StaffForm onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManager;
