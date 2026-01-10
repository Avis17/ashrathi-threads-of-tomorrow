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
import { useExternalJobOrders } from "@/hooks/useExternalJobOrders";
import { useJobEmployees } from "@/hooks/useJobEmployees";
import {
  useCreateExternalJobSalary,
  useUpdateExternalJobSalary,
  SALARY_OPERATIONS,
  ExternalJobSalary,
} from "@/hooks/useExternalJobSalaries";
import { Loader2 } from "lucide-react";

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

export const SalaryEntryForm = ({ salary, onSuccess, onCancel }: SalaryEntryFormProps) => {
  const { data: jobOrders, isLoading: jobOrdersLoading } = useExternalJobOrders();
  const { data: employees, isLoading: employeesLoading } = useJobEmployees();
  const createMutation = useCreateExternalJobSalary();
  const updateMutation = useUpdateExternalJobSalary();
  
  const [selectedJobOrder, setSelectedJobOrder] = useState<string | null>(
    salary?.job_order_id || null
  );
  
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
  const totalAmount = (pieces || 0) * (rate || 0);
  
  // Update pieces and rate when job order is selected
  useEffect(() => {
    if (selectedJobOrder && !salary) {
      const job = jobOrders?.find(j => j.id === selectedJobOrder);
      if (job) {
        form.setValue("number_of_pieces", job.number_of_pieces || 0);
        form.setValue("rate_per_piece", job.rate_per_piece || 0);
      }
    }
  }, [selectedJobOrder, jobOrders, form, salary]);
  
  const onSubmit = async (data: FormData) => {
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
      total_amount: totalAmount,
    };
    
    if (salary) {
      await updateMutation.mutateAsync({ id: salary.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSuccess();
  };
  
  const isLoading = createMutation.isPending || updateMutation.isPending;
  
  // Filter active employees only
  const activeEmployees = employees?.filter(e => e.is_active !== false) || [];
  
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
              <Select value={field.value} onValueChange={field.onChange}>
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
        
        {/* Total Amount Display */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
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
    </Form>
  );
};
