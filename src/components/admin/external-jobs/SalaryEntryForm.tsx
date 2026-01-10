import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExternalJobOrders, useExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { useJobEmployees } from "@/hooks/useJobEmployees";
import {
  useCreateExternalJobSalary,
  useUpdateExternalJobSalary,
  SALARY_OPERATIONS,
  ExternalJobSalary,
} from "@/hooks/useExternalJobSalaries";
import { useCloseAdvances, SalaryAdvanceEntry } from "@/hooks/useSalaryAdvances";
import { AdvanceDeductionModal } from "./AdvanceDeductionModal";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const formSchema = z.object({
  job_order_id: z.string().min(1, "Please select a job order"),
  employee_id: z.string().min(1, "Please select an employee"),
  operation: z.string().min(1, "Please select an operation"),
  number_of_pieces: z.number().min(1, "Number of pieces must be at least 1"),
  rate_per_piece: z.number().min(0.01, "Rate must be greater than 0"),
  payment_date: z.string().min(1, "Please select a date"),
  payment_mode: z.string().optional(),
  payment_status: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SalaryEntryFormProps {
  salary?: ExternalJobSalary | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Map salary operations to operation names in the database
const OPERATION_MAP: Record<string, string[]> = {
  'CUTTING': ['Cutting'],
  'STITCHING(SINGER)': ['Stitching (Singer)'],
  'STITCHING(POWERTABLE)': ['Stitching (Power Table) - Overlock', 'Stitching (Power Table) - Flatlock'],
  'STITCHING(OTHER)': ['Stitching (Other)'],
  'CHECKING': ['Checking'],
  'IRONING': ['Ironing'],
  'IRONING AND PACKING': ['Ironing', 'Packing', 'Ironing and Packing'],
};

export const SalaryEntryForm = ({ salary, onSuccess, onCancel }: SalaryEntryFormProps) => {
  const { data: jobOrders, isLoading: jobOrdersLoading } = useExternalJobOrders();
  const { data: employees, isLoading: employeesLoading } = useJobEmployees();
  const createMutation = useCreateExternalJobSalary();
  const updateMutation = useUpdateExternalJobSalary();
  const closeAdvancesMutation = useCloseAdvances();
  
  const [selectedJobOrder, setSelectedJobOrder] = useState<string | null>(
    salary?.job_order_id || null
  );
  const [selectedOperation, setSelectedOperation] = useState<string>(
    salary?.operation || ""
  );
  const [selectedAdvances, setSelectedAdvances] = useState<SalaryAdvanceEntry[]>([]);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  
  // Fetch full job order details for operation rates
  const { data: jobOrderDetails } = useExternalJobOrder(selectedJobOrder || "");
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_order_id: salary?.job_order_id || "",
      employee_id: salary?.employee_id || "",
      operation: salary?.operation || "",
      number_of_pieces: salary?.number_of_pieces || 0,
      rate_per_piece: salary?.rate_per_piece || 0,
      payment_date: salary?.payment_date || new Date().toISOString().split('T')[0],
      payment_mode: salary?.payment_mode || "cash",
      payment_status: salary?.payment_status || "pending",
      notes: salary?.notes || "",
    },
  });
  
  const pieces = form.watch("number_of_pieces");
  const rate = form.watch("rate_per_piece");
  const grossAmount = (pieces || 0) * (rate || 0);
  const totalDeductions = selectedAdvances.reduce((sum, a) => sum + a.amount, 0);
  const finalAmount = grossAmount - totalDeductions;
  
  // Update pieces when job order is selected
  useEffect(() => {
    if (selectedJobOrder && !salary) {
      const job = jobOrders?.find(j => j.id === selectedJobOrder);
      if (job) {
        form.setValue("number_of_pieces", job.number_of_pieces || 0);
      }
    }
  }, [selectedJobOrder, jobOrders, form, salary]);
  
  // Update rate when operation is selected based on operation-specific rates
  useEffect(() => {
    if (selectedJobOrder && selectedOperation && jobOrderDetails && !salary) {
      const operations = jobOrderDetails.external_job_operations || [];
      const operationNames = OPERATION_MAP[selectedOperation] || [];
      
      // Find matching operations and sum their rates (for POWERTABLE which has Overlock + Flatlock)
      let totalRate = 0;
      operationNames.forEach(opName => {
        const matchingOp = operations.find((op: any) => 
          op.operation_name.toLowerCase().includes(opName.toLowerCase()) ||
          opName.toLowerCase().includes(op.operation_name.toLowerCase())
        );
        if (matchingOp) {
          totalRate += matchingOp.total_rate || 0;
        }
      });
      
      if (totalRate > 0) {
        form.setValue("rate_per_piece", totalRate);
      }
    }
  }, [selectedJobOrder, selectedOperation, jobOrderDetails, form, salary]);
  
  const onSubmit = async (data: FormData) => {
    const calculationDetails = generateCalculationDetails(data, grossAmount, selectedAdvances, finalAmount);
    
    const payload = {
      job_order_id: data.job_order_id,
      employee_id: data.employee_id,
      operation: data.operation,
      number_of_pieces: data.number_of_pieces,
      rate_per_piece: data.rate_per_piece,
      payment_date: data.payment_date,
      payment_mode: data.payment_mode,
      payment_status: data.payment_status,
      notes: data.notes,
      total_amount: finalAmount,
      gross_amount: grossAmount,
      deduction_amount: totalDeductions,
      advance_deductions: selectedAdvances.map(a => ({
        id: a.id,
        amount: a.amount,
        employee_name: a.employee?.name,
        date: a.advance_date,
      })),
      calculation_details: calculationDetails,
    };
    
    if (salary) {
      await updateMutation.mutateAsync({ id: salary.id, data: payload });
    } else {
      const result = await createMutation.mutateAsync(payload);
      
      // Close the selected advances
      if (selectedAdvances.length > 0 && result) {
        await closeAdvancesMutation.mutateAsync({
          advanceIds: selectedAdvances.map(a => a.id),
          salaryId: result.id,
        });
      }
    }
    onSuccess();
  };
  
  const generateCalculationDetails = (
    data: FormData, 
    gross: number, 
    advances: SalaryAdvanceEntry[], 
    final: number
  ) => {
    let details = `Calculation Breakdown:\n`;
    details += `─────────────────────\n`;
    details += `Gross Salary: ${data.number_of_pieces} pcs × ₹${data.rate_per_piece} = ₹${gross.toLocaleString('en-IN')}\n`;
    
    if (advances.length > 0) {
      details += `\nAdvance Deductions:\n`;
      advances.forEach((adv, idx) => {
        details += `  ${idx + 1}. ${adv.employee?.name || 'Unknown'} - ₹${adv.amount.toLocaleString('en-IN')} (${format(new Date(adv.advance_date), 'dd MMM yyyy')})\n`;
      });
      details += `\nTotal Deductions: -₹${advances.reduce((s, a) => s + a.amount, 0).toLocaleString('en-IN')}\n`;
    }
    
    details += `─────────────────────\n`;
    details += `Final Amount: ₹${final.toLocaleString('en-IN')}`;
    
    return details;
  };
  
  const isLoading = createMutation.isPending || updateMutation.isPending || closeAdvancesMutation.isPending;
  
  // Filter active employees only
  const activeEmployees = employees?.filter(e => e.is_active !== false) || [];
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const removeAdvance = (advanceId: string) => {
    setSelectedAdvances(prev => prev.filter(a => a.id !== advanceId));
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="job_order_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Order *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedJobOrder(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job order" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {jobOrdersLoading ? (
                    <div className="p-2 text-center text-muted-foreground">Loading...</div>
                  ) : (
                    jobOrders?.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{job.job_id}</span>
                          <span className="text-muted-foreground">-</span>
                          <span>{job.style_name}</span>
                          <span className="text-muted-foreground">
                            ({job.number_of_pieces} pcs)
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="operation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operation *</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedOperation(value);
                  // Clear advances when operation changes
                  setSelectedAdvances([]);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an operation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SALARY_OPERATIONS.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee (Salary Receiver) *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {employeesLoading ? (
                    <div className="p-2 text-center text-muted-foreground">Loading...</div>
                  ) : (
                    activeEmployees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{emp.name}</span>
                          <span className="text-muted-foreground">({emp.employee_code})</span>
                          {emp.contractor && (
                            <span className="text-xs text-muted-foreground">
                              - {emp.contractor.contractor_name}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number_of_pieces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Pieces *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rate_per_piece"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate per Piece (₹) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Deduct Advance Section */}
        {selectedOperation && !salary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-medium">Deduct Advance</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdvanceModalOpen(true)}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Select Advances
              </Button>
            </div>
            
            {selectedAdvances.length > 0 && (
              <div className="border rounded-lg divide-y">
                {selectedAdvances.map((advance) => (
                  <div key={advance.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Minus className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">{advance.employee?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(advance.advance_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">
                        -{formatAmount(advance.amount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeAdvance(advance.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Calculation Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gross Amount</span>
            <span className="text-lg font-semibold">
              {formatAmount(grossAmount)}
            </span>
          </div>
          
          {selectedAdvances.length > 0 && (
            <>
              <div className="flex justify-between items-center text-red-600">
                <span className="text-sm">Total Deductions</span>
                <span className="font-semibold">
                  -{formatAmount(totalDeductions)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Final Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatAmount(finalAmount)}
                </span>
              </div>
            </>
          )}
          
          {selectedAdvances.length === 0 && (
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm font-medium">Total Amount</span>
              <span className="text-2xl font-bold">
                {formatAmount(grossAmount)}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="payment_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes or description..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {salary ? 'Update' : 'Create'} Salary Entry
          </Button>
        </div>
      </form>
      
      {/* Advance Deduction Modal */}
      <AdvanceDeductionModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        operation={selectedOperation}
        onSelect={setSelectedAdvances}
        selectedAdvances={selectedAdvances}
      />
    </Form>
  );
};
