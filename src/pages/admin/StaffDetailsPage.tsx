import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, IndianRupee, Calendar as CalendarIcon, UserX, Trash2, TrendingUp, TrendingDown, DollarSign, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, differenceInDays, subMonths, addMonths, isSameMonth } from 'date-fns';
import {
  useStaffMember,
  useStaffSalaryEntries,
  useCreateStaffSalaryEntry,
  useDeleteStaffSalaryEntry,
  useStaffAbsences,
  useCreateStaffAbsence,
  useDeleteStaffAbsence,
  STAFF_SALARY_CATEGORIES,
} from '@/hooks/useStaff';

const StaffDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: staff, isLoading: loadingStaff } = useStaffMember(id || '');
  const { data: salaryEntries = [] } = useStaffSalaryEntries(id || '');
  const { data: absences = [] } = useStaffAbsences(id || '');
  const createSalaryEntry = useCreateStaffSalaryEntry();
  const deleteSalaryEntry = useDeleteStaffSalaryEntry();
  const createAbsence = useCreateStaffAbsence();
  const deleteAbsence = useDeleteStaffAbsence();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);

  // Salary form state
  const [salaryDate, setSalaryDate] = useState<Date | undefined>();
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryCategory, setSalaryCategory] = useState('Salary');
  const [salaryNotes, setSalaryNotes] = useState('');

  // Absence form state
  const [absenceFromDate, setAbsenceFromDate] = useState<Date | undefined>();
  const [absenceToDate, setAbsenceToDate] = useState<Date | undefined>();
  const [absenceReason, setAbsenceReason] = useState('');

  if (!id) return null;

  if (loadingStaff) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Staff member not found</p>
        <Button variant="link" onClick={() => navigate('/admin/job-management?tab=staff')}>
          Back to Staff
        </Button>
      </div>
    );
  }

  // ─── Stats calculations ───
  const totalSalaryPaid = salaryEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalAbsenceDays = absences.reduce((sum, a) => {
    return sum + differenceInDays(parseISO(a.to_date), parseISO(a.from_date)) + 1;
  }, 0);

  const monthsActive = staff.joined_date
    ? Math.max(1, Math.ceil(differenceInDays(new Date(), parseISO(staff.joined_date)) / 30))
    : Math.max(1, Math.ceil(differenceInDays(new Date(), parseISO(staff.created_at)) / 30));

  const avgMonthlySalary = totalSalaryPaid / monthsActive;
  const avgMonthlyLeaves = totalAbsenceDays / monthsActive;

  // Category-wise breakdown
  const categoryTotals = salaryEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // ─── Calendar data ───
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Map entry_date -> total amount for calendar
  const dailyAmounts = useMemo(() => {
    const map: Record<string, number> = {};
    salaryEntries.forEach((e) => {
      const key = e.entry_date;
      map[key] = (map[key] || 0) + e.amount;
    });
    return map;
  }, [salaryEntries]);

  // Check if a date falls within any absence
  const isAbsentDay = (day: Date) => {
    return absences.some((a) => {
      const from = parseISO(a.from_date);
      const to = parseISO(a.to_date);
      return isWithinInterval(day, { start: from, end: to });
    });
  };

  // Entries for selected date
  const selectedDateEntries = selectedDate
    ? salaryEntries.filter((e) => isSameDay(parseISO(e.entry_date), selectedDate))
    : [];

  const currentMonthEntries = salaryEntries.filter(e => isSameMonth(parseISO(e.entry_date), currentMonth));
  const currentMonthTotal = currentMonthEntries.reduce((s, e) => s + e.amount, 0);

  const handleAddSalaryEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryDate || !salaryAmount) return;
    await createSalaryEntry.mutateAsync({
      staff_id: id,
      entry_date: format(salaryDate, 'yyyy-MM-dd'),
      amount: parseFloat(salaryAmount),
      category: salaryCategory,
      notes: salaryNotes || undefined,
    });
    setShowSalaryForm(false);
    setSalaryDate(undefined);
    setSalaryAmount('');
    setSalaryCategory('Salary');
    setSalaryNotes('');
  };

  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceFromDate || !absenceToDate) return;
    await createAbsence.mutateAsync({
      staff_id: id,
      from_date: format(absenceFromDate, 'yyyy-MM-dd'),
      to_date: format(absenceToDate, 'yyyy-MM-dd'),
      reason: absenceReason || undefined,
    });
    setShowAbsenceForm(false);
    setAbsenceFromDate(undefined);
    setAbsenceToDate(undefined);
    setAbsenceReason('');
  };

  // Weekday headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfWeek = monthStart.getDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/job-management?tab=staff')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{staff.employee?.name || 'Staff Member'}</h1>
          <p className="text-muted-foreground text-sm">
            {staff.employee?.employee_code}
            {staff.salary_type && <> · <span className="capitalize">{staff.salary_type}</span></>}
            {staff.salary_amount && <> · ₹{staff.salary_amount.toLocaleString()}</>}
            {staff.joined_date && <> · Joined {format(parseISO(staff.joined_date), 'dd MMM yyyy')}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAbsenceForm(true)} className="gap-1">
            <UserX className="h-4 w-4" /> Mark Absence
          </Button>
          <Button size="sm" onClick={() => setShowSalaryForm(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Paid</span>
          </div>
          <p className="text-xl font-bold">₹{totalSalaryPaid.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Avg Monthly</span>
          </div>
          <p className="text-xl font-bold">₹{Math.round(avgMonthlySalary).toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">This Month</span>
          </div>
          <p className="text-xl font-bold">₹{currentMonthTotal.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Total Leaves</span>
          </div>
          <p className="text-xl font-bold">{totalAbsenceDays}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Avg Monthly Leaves</span>
          </div>
          <p className="text-xl font-bold">{avgMonthlyLeaves.toFixed(1)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Total Entries</span>
          </div>
          <p className="text-xl font-bold">{salaryEntries.length}</p>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Category Breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => (
                <Badge key={cat} variant="outline" className="text-sm py-1 px-3">
                  {cat}: <span className="font-semibold ml-1">₹{total.toLocaleString()}</span>
                </Badge>
              ))}
          </div>
        </Card>
      )}

      {/* Calendar View */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            ← Prev
          </Button>
          <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next →
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const amount = dailyAmounts[dateKey];
            const absent = isAbsentDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(isSameDay(day, selectedDate || new Date(0)) ? null : day)}
                className={cn(
                  'aspect-square rounded-lg border p-1 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-0.5 relative',
                  absent && 'bg-red-500/10 border-red-500/30',
                  isSelected && 'ring-2 ring-primary',
                  isToday && !isSelected && 'border-primary',
                  !absent && amount && 'bg-green-500/10 border-green-500/30',
                  'hover:bg-muted/50'
                )}
              >
                <span className={cn('text-sm font-medium', absent && 'text-red-500')}>
                  {format(day, 'd')}
                </span>
                {amount && (
                  <span className="text-[10px] font-semibold text-green-600 leading-none">
                    ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
                  </span>
                )}
                {absent && !amount && (
                  <span className="text-[9px] text-red-500 leading-none font-medium">Absent</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Entries */}
      {selectedDate && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{format(selectedDate, 'dd MMMM yyyy')}</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSalaryDate(selectedDate);
                setShowSalaryForm(true);
              }}
              className="gap-1"
            >
              <Plus className="h-3 w-3" /> Add Entry
            </Button>
          </div>
          {selectedDateEntries.length > 0 ? (
            <div className="space-y-2">
              {selectedDateEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                      <span className="font-semibold">₹{entry.amount.toLocaleString()}</span>
                    </div>
                    {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteSalaryEntry.mutate({ id: entry.id, staffId: id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No entries for this date.
              {isAbsentDay(selectedDate) && <span className="text-red-500 ml-1">Staff was absent.</span>}
            </p>
          )}
        </Card>
      )}

      {/* Absences List */}
      {absences.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Absences</h3>
          <div className="space-y-2">
            {absences.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div>
                  <span className="font-medium text-sm">
                    {format(parseISO(a.from_date), 'dd MMM yyyy')} → {format(parseISO(a.to_date), 'dd MMM yyyy')}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ({differenceInDays(parseISO(a.to_date), parseISO(a.from_date)) + 1} days)
                  </span>
                  {a.reason && <p className="text-sm text-muted-foreground mt-0.5">{a.reason}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteAbsence.mutate({ id: a.id, staffId: id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Salary Entry Dialog */}
      <Dialog open={showSalaryForm} onOpenChange={setShowSalaryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Salary Entry</DialogTitle>
            <DialogDescription>Record a payment or expense for this staff member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSalaryEntry} className="space-y-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left', !salaryDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {salaryDate ? format(salaryDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={salaryDate} onSelect={setSalaryDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input type="number" placeholder="Enter amount" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={salaryCategory} onValueChange={setSalaryCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAFF_SALARY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Optional notes..." value={salaryNotes} onChange={(e) => setSalaryNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowSalaryForm(false)}>Cancel</Button>
              <Button type="submit" disabled={!salaryDate || !salaryAmount || createSalaryEntry.isPending}>
                {createSalaryEntry.isPending ? 'Adding...' : 'Add Entry'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Absence Dialog */}
      <Dialog open={showAbsenceForm} onOpenChange={setShowAbsenceForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Absence</DialogTitle>
            <DialogDescription>Record leave/absence for this staff member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAbsence} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left', !absenceFromDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {absenceFromDate ? format(absenceFromDate, 'PPP') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={absenceFromDate} onSelect={setAbsenceFromDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>To Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left', !absenceToDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {absenceToDate ? format(absenceToDate, 'PPP') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={absenceToDate} onSelect={setAbsenceToDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Reason for absence..." value={absenceReason} onChange={(e) => setAbsenceReason(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAbsenceForm(false)}>Cancel</Button>
              <Button type="submit" disabled={!absenceFromDate || !absenceToDate || createAbsence.isPending}>
                {createAbsence.isPending ? 'Recording...' : 'Record Absence'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDetailsPage;
