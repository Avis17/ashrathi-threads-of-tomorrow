import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, IndianRupee, Calendar as CalendarIcon, UserX, Trash2, TrendingUp, TrendingDown, DollarSign, CalendarDays, Banknote, Wallet, Edit, User, Download } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
import {
  useStaffAdvances,
  useCreateStaffAdvance,
  useDeleteStaffAdvance,
  useStaffWeeklyPayouts,
  useDeleteStaffWeeklyPayout,
} from '@/hooks/useStaffAdvances';
import StaffWeeklyPayoutForm from '@/components/admin/jobmanagement/StaffWeeklyPayoutForm';
import StaffProfileEditForm from '@/components/admin/jobmanagement/StaffProfileEditForm';

const StaffDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: staff, isLoading: loadingStaff } = useStaffMember(id || '');
  const { data: salaryEntries = [] } = useStaffSalaryEntries(id || '');
  const { data: absences = [] } = useStaffAbsences(id || '');
  const { data: advances = [] } = useStaffAdvances(id || '');
  const { data: weeklyPayouts = [] } = useStaffWeeklyPayouts(id || '');
  const createSalaryEntry = useCreateStaffSalaryEntry();
  const deleteSalaryEntry = useDeleteStaffSalaryEntry();
  const createAbsence = useCreateStaffAbsence();
  const deleteAbsence = useDeleteStaffAbsence();
  const createAdvance = useCreateStaffAdvance();
  const deleteAdvance = useDeleteStaffAdvance();
  const deletePayout = useDeleteStaffWeeklyPayout();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [deletingPayout, setDeletingPayout] = useState<string | null>(null);

  // Salary form state
  const [salaryFromDate, setSalaryFromDate] = useState<Date | undefined>();
  const [salaryToDate, setSalaryToDate] = useState<Date | undefined>();
  const [salaryAmount, setSalaryAmount] = useState('');
  const [isSubmittingSalary, setIsSubmittingSalary] = useState(false);
  const [salaryCategory, setSalaryCategory] = useState('Salary');
  const [salaryNotes, setSalaryNotes] = useState('');

  // Absence form state
  const [absenceFromDate, setAbsenceFromDate] = useState<Date | undefined>();
  const [absenceToDate, setAbsenceToDate] = useState<Date | undefined>();
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceLeaveType, setAbsenceLeaveType] = useState('full_day');

  // Advance form state
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState<Date | undefined>(new Date());
  const [advanceNotes, setAdvanceNotes] = useState('');

  const dailyAmounts = useMemo(() => {
    const map: Record<string, number> = {};
    salaryEntries.forEach((e) => {
      const key = e.entry_date;
      map[key] = (map[key] || 0) + e.amount;
    });
    return map;
  }, [salaryEntries]);

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

  const dailyRate = staff.salary_amount || 0;

  // ─── Stats ───
  const totalSalaryPaid = salaryEntries.reduce((sum, e) => sum + e.amount, 0);
  const getAbsenceDays = (a: { from_date: string; to_date: string; leave_type?: string }) => {
    const fullDays = differenceInDays(parseISO(a.to_date), parseISO(a.from_date)) + 1;
    return a.leave_type === 'first_half' || a.leave_type === 'second_half' ? 0.5 : fullDays;
  };
  const totalAbsenceDays = absences.reduce((sum, a) => sum + getAbsenceDays(a), 0);
  const monthsActive = staff.joined_date
    ? Math.max(1, Math.ceil(differenceInDays(new Date(), parseISO(staff.joined_date)) / 30))
    : Math.max(1, Math.ceil(differenceInDays(new Date(), parseISO(staff.created_at)) / 30));
  const avgMonthlySalary = totalSalaryPaid / monthsActive;

  const totalPendingAdvances = advances.filter(a => a.remaining_amount > 0).reduce((s, a) => s + a.remaining_amount, 0);

  const categoryTotals = salaryEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // ─── Calendar ───
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isAbsentDay = (day: Date) => {
    return absences.some((a) => {
      const from = parseISO(a.from_date);
      const to = parseISO(a.to_date);
      return isWithinInterval(day, { start: from, end: to });
    });
  };

  const selectedDateEntries = selectedDate
    ? salaryEntries.filter((e) => isSameDay(parseISO(e.entry_date), selectedDate))
    : [];

  const currentMonthEntries = salaryEntries.filter(e => isSameMonth(parseISO(e.entry_date), currentMonth));
  const currentMonthTotal = currentMonthEntries.reduce((s, e) => s + e.amount, 0);

  const existingPayoutWeeks = weeklyPayouts.map(p => p.week_start_date);

  const handleAddSalaryEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryFromDate || !salaryAmount) return;
    setIsSubmittingSalary(true);
    try {
      const toDate = salaryToDate || salaryFromDate;
      const days = eachDayOfInterval({ start: salaryFromDate, end: toDate });
      for (const day of days) {
        await createSalaryEntry.mutateAsync({
          staff_id: id,
          entry_date: format(day, 'yyyy-MM-dd'),
          amount: parseFloat(salaryAmount),
          category: salaryCategory,
          notes: salaryNotes || undefined,
        });
      }
      setShowSalaryForm(false);
      setSalaryFromDate(undefined);
      setSalaryToDate(undefined);
      setSalaryAmount('');
      setSalaryCategory('Salary');
      setSalaryNotes('');
    } finally {
      setIsSubmittingSalary(false);
    }
  };

  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceFromDate || !absenceToDate) return;
    await createAbsence.mutateAsync({
      staff_id: id,
      from_date: format(absenceFromDate, 'yyyy-MM-dd'),
      to_date: format(absenceToDate, 'yyyy-MM-dd'),
      reason: absenceReason || undefined,
      leave_type: absenceLeaveType,
    });
    setShowAbsenceForm(false);
    setAbsenceFromDate(undefined);
    setAbsenceToDate(undefined);
    setAbsenceReason('');
    setAbsenceLeaveType('full_day');
  };

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceAmount || !advanceDate) return;
    await createAdvance.mutateAsync({
      staff_id: id,
      amount: parseFloat(advanceAmount),
      advance_date: format(advanceDate, 'yyyy-MM-dd'),
      notes: advanceNotes || undefined,
    });
    setShowAdvanceForm(false);
    setAdvanceAmount('');
    setAdvanceDate(new Date());
    setAdvanceNotes('');
  };

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
            {dailyRate > 0 && <> · ₹{dailyRate}/day</>}
            {staff.joined_date && <> · Joined {format(parseISO(staff.joined_date), 'dd MMM yyyy')}</>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowProfileEdit(true)} className="gap-1">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAdvanceForm(true)} className="gap-1">
            <Wallet className="h-4 w-4" /> Record Advance
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAbsenceForm(true)} className="gap-1">
            <UserX className="h-4 w-4" /> Mark Absence
          </Button>
          <Button variant="default" size="sm" onClick={() => setShowPayoutForm(true)} className="gap-1">
            <Banknote className="h-4 w-4" /> Weekly Payout
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSalaryForm(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
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
            <Wallet className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Pending Advance</span>
          </div>
          <p className="text-xl font-bold text-orange-600">₹{totalPendingAdvances.toLocaleString()}</p>
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
            <Banknote className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Weekly Payouts</span>
          </div>
          <p className="text-xl font-bold">{weeklyPayouts.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Daily Rate</span>
          </div>
          <p className="text-xl font-bold">₹{dailyRate}</p>
        </Card>
      </div>

      {/* Staff Profile Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Staff Profile</h3>
          <Button variant="outline" size="sm" onClick={() => setShowProfileEdit(true)} className="gap-1">
            <Edit className="h-3 w-3" /> Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          {staff.date_of_birth && <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{staff.date_of_birth}</span></div>}
          {staff.gender && <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium capitalize">{staff.gender}</span></div>}
          {staff.blood_group && <div><span className="text-muted-foreground">Blood Group:</span> <span className="font-medium">{staff.blood_group}</span></div>}
          {staff.father_name && <div><span className="text-muted-foreground">Father:</span> <span className="font-medium">{staff.father_name}</span></div>}
          {staff.marital_status && <div><span className="text-muted-foreground">Marital Status:</span> <span className="font-medium capitalize">{staff.marital_status}</span></div>}
          {staff.place && <div><span className="text-muted-foreground">Place:</span> <span className="font-medium">{staff.place}</span></div>}
          {staff.education && <div><span className="text-muted-foreground">Education:</span> <span className="font-medium">{staff.education}</span></div>}
          {staff.qualification && <div><span className="text-muted-foreground">Qualification:</span> <span className="font-medium">{staff.qualification}</span></div>}
          {staff.aadhar_number && <div><span className="text-muted-foreground">Aadhar:</span> <span className="font-medium">{staff.aadhar_number}</span></div>}
          {staff.pan_number && <div><span className="text-muted-foreground">PAN:</span> <span className="font-medium">{staff.pan_number}</span></div>}
          {staff.driving_license && <div><span className="text-muted-foreground">DL:</span> <span className="font-medium">{staff.driving_license}</span></div>}
          {staff.address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{staff.address}</span></div>}
          {staff.emergency_contact_name && <div><span className="text-muted-foreground">Emergency:</span> <span className="font-medium">{staff.emergency_contact_name} {staff.emergency_contact_phone && `(${staff.emergency_contact_phone})`}</span></div>}
          {staff.bank_name && <div><span className="text-muted-foreground">Bank:</span> <span className="font-medium">{staff.bank_name}</span></div>}
          {staff.bank_account_number && <div><span className="text-muted-foreground">A/C:</span> <span className="font-medium">{staff.bank_account_number}</span></div>}
          {staff.ifsc_code && <div><span className="text-muted-foreground">IFSC:</span> <span className="font-medium">{staff.ifsc_code}</span></div>}
          {staff.employee?.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{staff.employee.phone}</span></div>}
        </div>
        {!staff.date_of_birth && !staff.aadhar_number && !staff.place && !staff.education && (
          <p className="text-sm text-muted-foreground mt-2">No profile details added yet. Click "Edit" to add personal details.</p>
        )}
      </Card>

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

      {/* Pending Advances */}
      {advances.filter(a => a.remaining_amount > 0).length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-orange-500" /> Pending Advances
          </h3>
          <div className="space-y-2">
            {advances.filter(a => a.remaining_amount > 0).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">₹{a.remaining_amount.toLocaleString()}</span>
                    {a.remaining_amount < a.amount && (
                      <Badge variant="outline" className="text-xs">of ₹{a.amount.toLocaleString()}</Badge>
                    )}
                    <Badge variant={a.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(parseISO(a.advance_date), 'dd MMM yyyy')}
                    {a.notes && ` · ${a.notes}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAdvance.mutate({ id: a.id, staffId: id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
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
                  absent && 'bg-destructive/10 border-destructive/30',
                  isSelected && 'ring-2 ring-primary',
                  isToday && !isSelected && 'border-primary',
                  !absent && amount && 'bg-green-500/10 border-green-500/30',
                  'hover:bg-muted/50'
                )}
              >
                <span className={cn('text-sm font-medium', absent && 'text-destructive')}>
                  {format(day, 'd')}
                </span>
                {amount && (
                  <span className="text-[10px] font-semibold text-green-600 leading-none">
                    ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
                  </span>
                )}
                {absent && !amount && (
                  <span className="text-[9px] text-destructive leading-none font-medium">Absent</span>
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
                setSalaryFromDate(selectedDate);
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSalaryEntry.mutate({ id: entry.id, staffId: id })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No entries for this date.
              {isAbsentDay(selectedDate) && <span className="text-destructive ml-1">Staff was absent.</span>}
            </p>
          )}
        </Card>
      )}

      {/* Weekly Payouts History */}
      {weeklyPayouts.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" /> Weekly Payouts
          </h3>
          <div className="space-y-2">
            {weeklyPayouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {format(parseISO(p.week_start_date), 'dd MMM')} – {format(parseISO(p.week_end_date), 'dd MMM yyyy')}
                    </span>
                    <Badge variant="default" className="text-xs">₹{p.net_paid.toLocaleString()}</Badge>
                    {p.advance_deducted > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600">Adv: -₹{p.advance_deducted.toLocaleString()}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{p.working_days}/{p.total_days} days</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gross: ₹{p.gross_salary.toLocaleString()} · {p.payment_mode}
                    {p.notes && ` · ${p.notes}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingPayout(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Absences List */}
      {absences.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Absences</h3>
          <div className="space-y-2">
            {absences.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <span className="font-medium text-sm">
                    {format(parseISO(a.from_date), 'dd MMM yyyy')} → {format(parseISO(a.to_date), 'dd MMM yyyy')}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ({getAbsenceDays(a)} {getAbsenceDays(a) === 1 ? 'day' : 'days'})
                  </span>
                  {a.reason && <p className="text-sm text-muted-foreground mt-0.5">{a.reason}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAbsence.mutate({ id: a.id, staffId: id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Advances History */}
      {advances.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">All Advances</h3>
          <div className="space-y-2">
            {advances.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">₹{a.amount.toLocaleString()}</span>
                    <Badge variant={a.status === 'fully_deducted' ? 'secondary' : a.status === 'partially_deducted' ? 'outline' : 'destructive'} className="text-xs capitalize">
                      {a.status.replace('_', ' ')}
                    </Badge>
                    {a.remaining_amount > 0 && a.remaining_amount < a.amount && (
                      <span className="text-xs text-muted-foreground">Remaining: ₹{a.remaining_amount.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(parseISO(a.advance_date), 'dd MMM yyyy')}
                    {a.notes && ` · ${a.notes}`}
                  </p>
                </div>
                {a.status === 'pending' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAdvance.mutate({ id: a.id, staffId: id })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
            <DialogDescription>Record a payment or expense. Select a date range to create daily recurring entries.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSalaryEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left', !salaryFromDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {salaryFromDate ? format(salaryFromDate, 'PPP') : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={salaryFromDate} onSelect={setSalaryFromDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left', !salaryToDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {salaryToDate ? format(salaryToDate, 'PPP') : 'Same day'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={salaryToDate} onSelect={setSalaryToDate} disabled={(date) => salaryFromDate ? date < salaryFromDate : false} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {salaryFromDate && salaryToDate && salaryFromDate !== salaryToDate && (
              <p className="text-sm text-muted-foreground">
                This will create <span className="font-semibold text-foreground">{eachDayOfInterval({ start: salaryFromDate, end: salaryToDate }).length}</span> entries of ₹{salaryAmount || '0'} each
                {salaryAmount ? <> (Total: <span className="font-semibold text-foreground">₹{(parseFloat(salaryAmount) * eachDayOfInterval({ start: salaryFromDate, end: salaryToDate }).length).toLocaleString()}</span>)</> : null}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount per day *</Label>
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
              <Button type="submit" disabled={!salaryFromDate || !salaryAmount || isSubmittingSalary}>
                {isSubmittingSalary ? 'Adding...' : 'Add Entry'}
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
              <Label>Leave Type *</Label>
              <Select value={absenceLeaveType} onValueChange={setAbsenceLeaveType}>
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="first_half">First Half (AM)</SelectItem>
                  <SelectItem value="second_half">Second Half (PM)</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Advance Dialog */}
      <Dialog open={showAdvanceForm} onOpenChange={setShowAdvanceForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Advance</DialogTitle>
            <DialogDescription>Record an advance payment requested by the staff member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdvance} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input type="number" placeholder="Enter amount" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} required min={1} />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left', !advanceDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {advanceDate ? format(advanceDate, 'PPP') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={advanceDate} onSelect={setAdvanceDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Reason for advance..." value={advanceNotes} onChange={(e) => setAdvanceNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAdvanceForm(false)}>Cancel</Button>
              <Button type="submit" disabled={!advanceAmount || !advanceDate || createAdvance.isPending}>
                {createAdvance.isPending ? 'Recording...' : 'Record Advance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Weekly Payout Dialog */}
      <Dialog open={showPayoutForm} onOpenChange={setShowPayoutForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Weekly Salary Payout</DialogTitle>
            <DialogDescription>Calculate and record weekly salary with optional advance deduction</DialogDescription>
          </DialogHeader>
          {dailyRate > 0 ? (
            <StaffWeeklyPayoutForm
              staffId={id}
              staffName={staff.employee?.name || 'Staff'}
              dailyRate={dailyRate}
              advances={advances}
              absences={absences}
              existingPayoutWeeks={existingPayoutWeeks}
              onSuccess={() => setShowPayoutForm(false)}
              onCancel={() => setShowPayoutForm(false)}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Daily rate is not set for this staff member. Please update the staff profile with a salary amount first.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowPayoutForm(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Payout Confirmation */}
      <AlertDialog open={!!deletingPayout} onOpenChange={() => setDeletingPayout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Payout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the payout record, remove calendar salary entries for that week, and restore any advance deductions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (deletingPayout) {
                await deletePayout.mutateAsync({ id: deletingPayout, staffId: id });
                setDeletingPayout(null);
              }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
            <DialogDescription>Update personal, employment, and identification details</DialogDescription>
          </DialogHeader>
          <StaffProfileEditForm staff={staff} onClose={() => setShowProfileEdit(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDetailsPage;
