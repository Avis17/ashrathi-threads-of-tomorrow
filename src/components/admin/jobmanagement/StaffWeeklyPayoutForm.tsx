import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isWithinInterval, subWeeks } from 'date-fns';
import { useCreateStaffWeeklyPayout, type StaffAdvance } from '@/hooks/useStaffAdvances';
import type { StaffAbsence } from '@/hooks/useStaff';

interface StaffWeeklyPayoutFormProps {
  staffId: string;
  staffName: string;
  dailyRate: number;
  advances: StaffAdvance[];
  absences: StaffAbsence[];
  existingPayoutWeeks: string[]; // list of week_start_date strings already paid
  onSuccess: () => void;
  onCancel: () => void;
}

const StaffWeeklyPayoutForm = ({
  staffId,
  staffName,
  dailyRate,
  advances,
  absences,
  existingPayoutWeeks,
  onSuccess,
  onCancel,
}: StaffWeeklyPayoutFormProps) => {
  const createPayout = useCreateStaffWeeklyPayout();

  // Find unpaid weeks (last 4 weeks, excluding already paid)
  const availableWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 8; i++) {
      const refDate = subWeeks(new Date(), i);
      const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
      const startStr = format(weekStart, 'yyyy-MM-dd');
      if (!existingPayoutWeeks.includes(startStr)) {
        weeks.push({ start: weekStart, end: weekEnd, startStr, endStr: format(weekEnd, 'yyyy-MM-dd') });
      }
    }
    return weeks;
  }, [existingPayoutWeeks]);

  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const selectedWeek = availableWeeks[selectedWeekIdx] || null;

  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [advanceDeductions, setAdvanceDeductions] = useState<Record<string, number>>({});
  const [effortBonus, setEffortBonus] = useState<number>(0);

  // Pending advances
  const pendingAdvances = advances.filter(a => a.remaining_amount > 0);

  // Calculate absent days for selected week
  const weekCalc = useMemo(() => {
    if (!selectedWeek) return { totalDays: 7, absentDays: 0, workingDays: 7, days: [] as { date: Date; dateStr: string; absent: boolean; halfDay: boolean }[] };

    const days = eachDayOfInterval({ start: selectedWeek.start, end: selectedWeek.end });
    let absentDays = 0;
    const dayDetails = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      let absent = false;
      let halfDay = false;
      absences.forEach(a => {
        const from = parseISO(a.from_date);
        const to = parseISO(a.to_date);
        if (isWithinInterval(day, { start: from, end: to })) {
          if (a.leave_type === 'first_half' || a.leave_type === 'second_half') {
            halfDay = true;
            absentDays += 0.5;
          } else {
            absent = true;
            absentDays += 1;
          }
        }
      });
      return { date: day, dateStr, absent, halfDay };
    });

    return {
      totalDays: 7,
      absentDays,
      workingDays: 7 - absentDays,
      days: dayDetails,
    };
  }, [selectedWeek, absences]);

  const grossSalary = weekCalc.workingDays * dailyRate;
  const absenceDeduction = weekCalc.absentDays * dailyRate;
  const fullWeekSalary = weekCalc.totalDays * dailyRate;
  const totalAdvanceDeduction = Object.values(advanceDeductions).reduce((s, v) => s + (v || 0), 0);
  const netPaid = grossSalary - totalAdvanceDeduction + effortBonus;

  const handleAdvanceToggle = (advanceId: string, checked: boolean) => {
    if (checked) {
      const adv = pendingAdvances.find(a => a.id === advanceId);
      if (adv) {
        setAdvanceDeductions(prev => ({ ...prev, [advanceId]: adv.remaining_amount }));
      }
    } else {
      setAdvanceDeductions(prev => {
        const next = { ...prev };
        delete next[advanceId];
        return next;
      });
    }
  };

  const handleAdvanceAmountChange = (advanceId: string, value: number) => {
    const adv = pendingAdvances.find(a => a.id === advanceId);
    if (adv) {
      setAdvanceDeductions(prev => ({ ...prev, [advanceId]: Math.min(value, adv.remaining_amount) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeek) return;

    // Build salary entries for each working day
    const salaryEntries = weekCalc.days
      .filter(d => !d.absent)
      .map(d => ({
        staff_id: staffId,
        entry_date: d.dateStr,
        amount: d.halfDay ? dailyRate * 0.5 : dailyRate,
        category: 'Salary',
        notes: `Weekly payout (${format(selectedWeek.start, 'dd MMM')} - ${format(selectedWeek.end, 'dd MMM yyyy')})`,
      }));

    const deductions = Object.entries(advanceDeductions)
      .filter(([, amt]) => amt > 0)
      .map(([advance_id, amount_deducted]) => ({ advance_id, amount_deducted }));

    await createPayout.mutateAsync({
      payout: {
        staff_id: staffId,
        week_start_date: selectedWeek.startStr,
        week_end_date: selectedWeek.endStr,
        daily_rate: dailyRate,
        total_days: weekCalc.totalDays,
        absent_days: weekCalc.absentDays,
        working_days: weekCalc.workingDays,
        gross_salary: grossSalary,
        advance_deducted: totalAdvanceDeduction,
        net_paid: netPaid,
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_mode: paymentMode,
        notes: notes || null,
      },
      deductions,
      salaryEntries,
    });

    onSuccess();
  };

  if (availableWeeks.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">All recent weeks have been paid out already.</p>
        <Button variant="outline" onClick={onCancel}>Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-1">Weekly Payout for {staffName}</h3>
        <p className="text-sm text-muted-foreground">Daily rate: ₹{dailyRate}</p>
      </Card>

      {/* Week Selection */}
      <div className="space-y-2">
        <Label>Select Week</Label>
        <Select value={String(selectedWeekIdx)} onValueChange={(v) => setSelectedWeekIdx(Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {availableWeeks.map((w, i) => (
              <SelectItem key={w.startStr} value={String(i)}>
                {format(w.start, 'dd MMM')} – {format(w.end, 'dd MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day breakdown */}
      {selectedWeek && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-sm">Day Breakdown</h4>
          <div className="grid grid-cols-7 gap-1">
            {weekCalc.days.map(d => (
              <div
                key={d.dateStr}
                className={`text-center p-2 rounded-md text-xs border ${
                  d.absent ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                  d.halfDay ? 'bg-orange-500/10 border-orange-500/30 text-orange-600' :
                  'bg-green-500/10 border-green-500/30 text-green-600'
                }`}
              >
                <div className="font-medium">{format(d.date, 'EEE')}</div>
                <div>{format(d.date, 'dd')}</div>
                {d.absent && <div className="text-[10px]">Off</div>}
                {d.halfDay && <div className="text-[10px]">½</div>}
                {!d.absent && !d.halfDay && <div className="text-[10px]">₹{dailyRate}</div>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Calculation Summary */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Calculation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Full Week Salary ({weekCalc.totalDays} × ₹{dailyRate})</span>
            <span className="font-medium">₹{fullWeekSalary.toLocaleString()}</span>
          </div>
          {weekCalc.absentDays > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Absence Deduction ({weekCalc.absentDays} day{weekCalc.absentDays !== 1 ? 's' : ''} × ₹{dailyRate})</span>
              <span className="font-semibold">-₹{absenceDeduction.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Working Days</span>
            <span className="font-medium">{weekCalc.workingDays} / {weekCalc.totalDays} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Salary ({weekCalc.workingDays} × ₹{dailyRate})</span>
            <span className="font-semibold">₹{grossSalary.toLocaleString()}</span>
          </div>
          {totalAdvanceDeduction > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Advance Deduction</span>
              <span className="font-semibold">-₹{totalAdvanceDeduction.toLocaleString()}</span>
            </div>
          )}
          {effortBonus > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Effort Bonus</span>
              <span className="font-semibold">+₹{effortBonus.toLocaleString()}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Net Payable</span>
            <span className="font-bold text-primary">₹{netPaid.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Advance Deductions */}
      {pendingAdvances.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Deduct Advances</h4>
          <div className="space-y-3">
            {pendingAdvances.map(adv => {
              const isSelected = advanceDeductions[adv.id] !== undefined;
              return (
                <div key={adv.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAdvanceToggle(adv.id, !!checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">₹{adv.amount.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        Remaining: ₹{adv.remaining_amount.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(adv.advance_date), 'dd MMM yyyy')}
                      {adv.notes && ` · ${adv.notes}`}
                    </p>
                  </div>
                  {isSelected && (
                    <Input
                      type="number"
                      className="w-28"
                      value={advanceDeductions[adv.id] || ''}
                      onChange={(e) => handleAdvanceAmountChange(adv.id, parseFloat(e.target.value) || 0)}
                      max={adv.remaining_amount}
                      min={0}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Payment details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Mode</Label>
          <Select value={paymentMode} onValueChange={setPaymentMode}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional..." rows={2} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={createPayout.isPending || netPaid < 0}>
          {createPayout.isPending ? 'Processing...' : `Pay ₹${netPaid.toLocaleString()}`}
        </Button>
      </div>
    </form>
  );
};

export default StaffWeeklyPayoutForm;
