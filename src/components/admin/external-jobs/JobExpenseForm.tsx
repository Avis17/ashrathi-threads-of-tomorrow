import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateExternalJobExpense, useUpdateExternalJobExpense, ExternalJobExpense } from "@/hooks/useExternalJobExpenses";
import { useEffect } from "react";

const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  expense_type: z.string().min(1, "Expense type is required"),
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  rate_per_unit: z.number().nullable(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  supplier_name: z.string().nullable(),
  bill_number: z.string().nullable(),
  notes: z.string().nullable(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const EXPENSE_TYPES = [
  "Transport",
  "Thread",
  "Button",
  "Zipper",
  "Label",
  "Packaging",
  "Accessories",
  "Machine Repair",
  "Diesel/Fuel",
  "Electricity",
  "Other",
];

interface JobExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOrderId: string;
  expense?: ExternalJobExpense | null;
}

export const JobExpenseForm = ({
  open,
  onOpenChange,
  jobOrderId,
  expense,
}: JobExpenseFormProps) => {
  const createExpense = useCreateExternalJobExpense();
  const updateExpense = useUpdateExternalJobExpense();
  const isEditing = !!expense;

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      expense_type: "",
      item_name: "",
      quantity: null,
      unit: null,
      rate_per_unit: null,
      amount: 0,
      supplier_name: null,
      bill_number: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        date: expense.date,
        expense_type: expense.expense_type,
        item_name: expense.item_name,
        quantity: expense.quantity,
        unit: expense.unit,
        rate_per_unit: expense.rate_per_unit,
        amount: expense.amount,
        supplier_name: expense.supplier_name,
        bill_number: expense.bill_number,
        notes: expense.notes,
      });
    } else {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        expense_type: "",
        item_name: "",
        quantity: null,
        unit: null,
        rate_per_unit: null,
        amount: 0,
        supplier_name: null,
        bill_number: null,
        notes: null,
      });
    }
  }, [expense, form]);

  const handleCalculateAmount = () => {
    const quantity = form.watch("quantity");
    const rate = form.watch("rate_per_unit");
    if (quantity && rate) {
      form.setValue("amount", quantity * rate);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (isEditing && expense) {
      await updateExpense.mutateAsync({
        id: expense.id,
        data,
      });
    } else {
      await createExpense.mutateAsync({
        job_order_id: jobOrderId,
        date: data.date,
        expense_type: data.expense_type,
        item_name: data.item_name,
        amount: data.amount,
        quantity: data.quantity,
        unit: data.unit,
        rate_per_unit: data.rate_per_unit,
        supplier_name: data.supplier_name,
        bill_number: data.bill_number,
        notes: data.notes,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
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

              <FormField
                control={form.control}
                name="expense_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Cotton Thread, Metal Buttons" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        onBlur={handleCalculateAmount}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="m">Meters</SelectItem>
                        <SelectItem value="l">Liters</SelectItem>
                        <SelectItem value="box">Boxes</SelectItem>
                        <SelectItem value="roll">Rolls</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate/Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        onBlur={handleCalculateAmount}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Optional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bill_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Optional" />
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
                    <Textarea {...field} value={field.value || ""} placeholder="Additional notes..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createExpense.isPending || updateExpense.isPending}>
                {createExpense.isPending || updateExpense.isPending ? "Saving..." : isEditing ? "Update" : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
