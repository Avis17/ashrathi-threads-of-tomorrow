import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ExpenseForm } from "@/components/admin/expenses/ExpenseForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AddExpenseForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createExpense = useMutation({
    mutationFn: async (data: any) => {
      const expenseData = {
        expense_date: data.expense_date,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description,
        amount: parseFloat(data.amount),
        vendor_name: data.vendor_name || null,
        payment_method: data.payment_method,
        receipt_number: data.receipt_number || null,
        branch_id: data.branch_id || null,
        notes: data.notes || null,
      };
      
      const { error } = await supabase.from('expenses').insert(expenseData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Expense added successfully!");
      navigate("/admin-forms");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add expense");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-forms")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Add Expense</h1>
            <p className="text-slate-300 mt-1">
              Log a new business expense
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white border-0">
          <ExpenseForm
            onSubmit={(data) => createExpense.mutate(data)}
            onCancel={() => navigate("/admin-forms")}
          />
        </Card>
      </div>
    </div>
  );
}
