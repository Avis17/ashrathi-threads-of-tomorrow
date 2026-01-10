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
import { useJobEmployees } from "@/hooks/useJobEmployees";
import { SALARY_OPERATIONS } from "@/hooks/useExternalJobSalaries";
import {
  useCreateSalaryAdvance,
  useUpdateSalaryAdvance,
  SalaryAdvanceEntry,
} from "@/hooks/useSalaryAdvances";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  employee_id: z.string().min(1, "Please select an employee"),
  operation: z.string().min(1, "Please select an operation"),
  amount: z.number().min(1, "Amount must be at least 1"),
  advance_date: z.string().min(1, "Please select a date"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AdvanceEntryFormProps {
  advance?: SalaryAdvanceEntry | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdvanceEntryForm = ({ advance, onSuccess, onCancel }: AdvanceEntryFormProps) => {
  const { data: employees, isLoading: employeesLoading } = useJobEmployees();
  const createMutation = useCreateSalaryAdvance();
  const updateMutation = useUpdateSalaryAdvance();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: advance?.employee_id || "",
      operation: advance?.operation || "",
      amount: advance?.amount || 0,
      advance_date: advance?.advance_date ? new Date(advance.advance_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: advance?.notes || "",
    },
  });
  
  const onSubmit = async (data: FormData) => {
    const payload = {
      employee_id: data.employee_id,
      operation: data.operation,
      amount: data.amount,
      advance_date: data.advance_date,
      notes: data.notes,
    };
    
    if (advance) {
      await updateMutation.mutateAsync({ id: advance.id, data: payload });
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
              <FormLabel>Employee (Paid To) *</FormLabel>
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹) *</FormLabel>
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
            name="advance_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
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
            {advance ? 'Update' : 'Create'} Advance Entry
          </Button>
        </div>
      </form>
    </Form>
  );
};
