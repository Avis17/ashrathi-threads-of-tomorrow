import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Plus,
  X,
  Minus,
  Search,
  Loader2,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useExternalJobOrders, useExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { useJobEmployees } from "@/hooks/useJobEmployees";
import {
  SALARY_OPERATIONS,
  ExternalJobSalary,
} from "@/hooks/useExternalJobSalaries";
import { useCloseAdvances, SalaryAdvanceEntry } from "@/hooks/useSalaryAdvances";
import { AdvanceDeductionModal } from "@/components/admin/external-jobs/AdvanceDeductionModal";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  employee_id: z.string().min(1, "Please select an employee"),
  operation: z.string().min(1, "Please select an operation"),
  payment_date: z.string().min(1, "Please select a date"),
  payment_mode: z.string().optional(),
  payment_status: z.string().optional(),
  notes: z.string().optional(),
  custom_job_detail: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SelectedJob {
  id: string;
  job_id: string;
  style_name: string;
  company_name: string;
  number_of_pieces: number;
  rate_per_piece: number;
  is_custom_job: boolean;
  custom_products_data?: any[];
  is_other?: boolean;
  custom_detail?: string;
}

// Map salary operations to operation names in the database
const OPERATION_MAP: Record<string, string[]> = {
  'CUTTING': ['Cutting'],
  'STITCHING(SINGER)': ['Stitching (Singer)', 'Stitching(Singer)'],
  'STITCHING(POWERTABLE)': ['Stitching (Power Table) - Overlock', 'Stitching (Power Table) - Flatlock', 'Stitching(Powertable)'],
  'STITCHING(OTHER)': ['Stitching (Other)', 'Stitching(Other)'],
  'CHECKING': ['Checking'],
  'IRONING': ['Ironing'],
  'IRONING AND PACKING': ['Ironing', 'Packing', 'Ironing and Packing'],
};

const getCustomJobProductName = (jobOrder: any) => {
  if (!jobOrder?.custom_products_data || !Array.isArray(jobOrder.custom_products_data)) {
    return 'N/A';
  }
  const products = jobOrder.custom_products_data as Array<{ name?: string }>;
  if (products.length === 0) return 'N/A';
  
  const productNames = products.map(p => p.name?.trim()).filter(Boolean);
  if (productNames.length === 0) return 'N/A';
  if (productNames.length === 1) return productNames[0];
  return `${productNames[0]} +${productNames.length - 1} more`;
};

const AddSalaryEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const queryClient = useQueryClient();
  
  const { data: jobOrders, isLoading: jobOrdersLoading } = useExternalJobOrders();
  const { data: employees, isLoading: employeesLoading } = useJobEmployees();
  const closeAdvancesMutation = useCloseAdvances();
  
  const [selectedJobs, setSelectedJobs] = useState<SelectedJob[]>([]);
  const [selectedAdvances, setSelectedAdvances] = useState<SalaryAdvanceEntry[]>([]);
  const [isJobSelectorOpen, setIsJobSelectorOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSalary, setEditingSalary] = useState<ExternalJobSalary | null>(null);
  const [hasOtherJob, setHasOtherJob] = useState(false);
  const [otherJobDetail, setOtherJobDetail] = useState("");
  const [otherJobPieces, setOtherJobPieces] = useState(0);
  const [otherJobRate, setOtherJobRate] = useState(0);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      operation: "",
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: "cash",
      payment_status: "pending",
      notes: "",
      custom_job_detail: "",
    },
  });

  const selectedOperation = form.watch("operation");

  // Load salary for editing
  useEffect(() => {
    if (editId) {
      loadSalaryForEdit(editId);
    }
  }, [editId]);

  const loadSalaryForEdit = async (id: string) => {
    const { data, error } = await supabase
      .from('external_job_salaries')
      .select(`
        *,
        job_order:external_job_orders(
          id,
          job_id,
          style_name,
          number_of_pieces,
          is_custom_job,
          custom_products_data,
          company:external_job_companies(company_name)
        ),
        employee:job_employees(id, name, employee_code)
      `)
      .eq('id', id)
      .single();
    
    if (!error && data) {
      setEditingSalary(data as any);
      form.reset({
        employee_id: data.employee_id,
        operation: data.operation,
        payment_date: data.payment_date,
        payment_mode: data.payment_mode || "cash",
        payment_status: data.payment_status || "pending",
        notes: data.notes || "",
      });
      
      // Set selected job
      if (data.job_order) {
        const job = data.job_order as any;
        setSelectedJobs([{
          id: job.id,
          job_id: job.job_id,
          style_name: job.style_name,
          company_name: job.company?.company_name || '',
          number_of_pieces: data.number_of_pieces,
          rate_per_piece: data.rate_per_piece,
          is_custom_job: job.is_custom_job,
          custom_products_data: job.custom_products_data,
        }]);
      }
    }
  };

  // Fetch operation rates for selected jobs
  const fetchOperationRate = async (jobOrderId: string, operation: string): Promise<number> => {
    const { data: jobDetails } = await supabase
      .from('external_job_orders')
      .select(`
        *,
        external_job_operations(*)
      `)
      .eq('id', jobOrderId)
      .single();
    
    if (!jobDetails) return 0;
    
    const operations = (jobDetails as any).external_job_operations || [];
    const operationNames = OPERATION_MAP[operation] || [];
    
    let totalRate = 0;
    operationNames.forEach(opName => {
      const matchingOp = operations.find((op: any) => {
        const opNameLower = op.operation_name?.toLowerCase() || '';
        const searchNameLower = opName.toLowerCase();
        return opNameLower === searchNameLower ||
               opNameLower.includes(searchNameLower) ||
               searchNameLower.includes(opNameLower);
      });
      if (matchingOp && !totalRate) {
        totalRate = matchingOp.total_rate || 0;
      } else if (matchingOp && operation === 'STITCHING(POWERTABLE)' && !(jobDetails as any).is_custom_job) {
        totalRate += matchingOp.total_rate || 0;
      }
    });
    
    return totalRate;
  };

  // Update rates when operation changes
  useEffect(() => {
    if (selectedOperation && selectedJobs.length > 0 && !editingSalary) {
      updateJobRates();
    }
  }, [selectedOperation]);

  const updateJobRates = async () => {
    const updatedJobs = await Promise.all(
      selectedJobs.filter(j => !j.is_other).map(async (job) => {
        const rate = await fetchOperationRate(job.id, selectedOperation);
        return { ...job, rate_per_piece: rate };
      })
    );
    
    const otherJobs = selectedJobs.filter(j => j.is_other);
    setSelectedJobs([...updatedJobs, ...otherJobs]);
  };

  // Filter jobs for selector
  const filteredJobOrders = useMemo(() => {
    if (!jobOrders) return [];
    
    const alreadySelected = new Set(selectedJobs.filter(j => !j.is_other).map(j => j.id));
    
    return jobOrders.filter(job => {
      if (alreadySelected.has(job.id)) return false;
      
      const searchLower = jobSearchTerm.toLowerCase();
      const matchesSearch = 
        job.job_id.toLowerCase().includes(searchLower) ||
        job.style_name?.toLowerCase().includes(searchLower) ||
        (job as any).company?.company_name?.toLowerCase().includes(searchLower) ||
        job.number_of_pieces?.toString().includes(searchLower);
      
      return matchesSearch;
    });
  }, [jobOrders, jobSearchTerm, selectedJobs]);

  // Calculations
  const jobTotals = selectedJobs.map(job => ({
    ...job,
    total: job.number_of_pieces * job.rate_per_piece,
  }));
  
  const otherJobTotal = hasOtherJob ? otherJobPieces * otherJobRate : 0;
  const grossAmount = jobTotals.reduce((sum, j) => sum + j.total, 0) + otherJobTotal;
  const totalDeductions = selectedAdvances.reduce((sum, a) => sum + a.amount, 0);
  const finalAmount = grossAmount - totalDeductions;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const addJob = async (job: any) => {
    const rate = selectedOperation ? await fetchOperationRate(job.id, selectedOperation) : 0;
    
    setSelectedJobs(prev => [...prev, {
      id: job.id,
      job_id: job.job_id,
      style_name: job.style_name,
      company_name: (job as any).company?.company_name || '',
      number_of_pieces: job.number_of_pieces,
      rate_per_piece: rate,
      is_custom_job: job.is_custom_job,
      custom_products_data: job.custom_products_data,
    }]);
    setIsJobSelectorOpen(false);
    setJobSearchTerm("");
  };

  const removeJob = (jobId: string) => {
    setSelectedJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const updateJobPieces = (jobId: string, pieces: number) => {
    setSelectedJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, number_of_pieces: pieces } : j
    ));
  };

  const updateJobRate = (jobId: string, rate: number) => {
    setSelectedJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, rate_per_piece: rate } : j
    ));
  };

  const generateCalculationDetails = () => {
    let details = `Calculation Breakdown:\n`;
    details += `─────────────────────\n\n`;
    
    details += `Jobs Included:\n`;
    jobTotals.forEach((job, idx) => {
      const styleName = job.is_custom_job ? getCustomJobProductName(job) : job.style_name;
      details += `  ${idx + 1}. ${job.job_id} - ${styleName}\n`;
      details += `     ${job.number_of_pieces} pcs × ₹${job.rate_per_piece} = ₹${job.total.toLocaleString('en-IN')}\n`;
    });
    
    if (hasOtherJob && otherJobPieces > 0) {
      details += `  • Other: ${otherJobDetail}\n`;
      details += `     ${otherJobPieces} pcs × ₹${otherJobRate} = ₹${otherJobTotal.toLocaleString('en-IN')}\n`;
    }
    
    details += `\nGross Total: ₹${grossAmount.toLocaleString('en-IN')}\n`;
    
    if (selectedAdvances.length > 0) {
      details += `\nAdvance Deductions:\n`;
      selectedAdvances.forEach((adv, idx) => {
        details += `  ${idx + 1}. ${adv.employee?.name || 'Unknown'} - ₹${adv.amount.toLocaleString('en-IN')} (${format(new Date(adv.advance_date), 'dd MMM yyyy')})\n`;
      });
      details += `\nTotal Deductions: -₹${totalDeductions.toLocaleString('en-IN')}\n`;
    }
    
    details += `─────────────────────\n`;
    details += `Final Amount: ₹${finalAmount.toLocaleString('en-IN')}`;
    
    return details;
  };

  const onSubmit = async (data: FormData) => {
    if (selectedJobs.length === 0 && !hasOtherJob) {
      toast.error("Please add at least one job");
      return;
    }

    setIsSubmitting(true);
    try {
      const calculationDetails = generateCalculationDetails();
      
      // For multi-job, we'll create one salary entry per job (to maintain data integrity)
      // but link them together with notes
      const allJobs = [...selectedJobs];
      if (hasOtherJob && otherJobPieces > 0) {
        allJobs.push({
          id: 'other',
          job_id: 'OTHER',
          style_name: otherJobDetail || 'Other Work',
          company_name: '',
          number_of_pieces: otherJobPieces,
          rate_per_piece: otherJobRate,
          is_custom_job: false,
          is_other: true,
          custom_detail: otherJobDetail,
        });
      }
      
      // If editing, update single entry
      if (editingSalary) {
        const firstJob = selectedJobs[0];
        const { error } = await supabase
          .from('external_job_salaries')
          .update({
            job_order_id: firstJob.id,
            employee_id: data.employee_id,
            operation: data.operation,
            number_of_pieces: firstJob.number_of_pieces,
            rate_per_piece: firstJob.rate_per_piece,
            total_amount: finalAmount,
            gross_amount: grossAmount,
            deduction_amount: totalDeductions,
            payment_date: data.payment_date,
            payment_mode: data.payment_mode,
            payment_status: data.payment_status,
            notes: data.notes,
            calculation_details: calculationDetails,
          })
          .eq('id', editingSalary.id);
        
        if (error) throw error;
        toast.success("Salary entry updated successfully");
      } else {
        // Create entries for each job
        const entries = allJobs.map(job => ({
          job_order_id: job.is_other ? selectedJobs[0]?.id || allJobs.find(j => !j.is_other)?.id : job.id,
          employee_id: data.employee_id,
          operation: data.operation,
          number_of_pieces: job.number_of_pieces,
          rate_per_piece: job.rate_per_piece,
          total_amount: allJobs.length === 1 ? finalAmount : job.number_of_pieces * job.rate_per_piece,
          gross_amount: job.number_of_pieces * job.rate_per_piece,
          deduction_amount: allJobs.length === 1 ? totalDeductions : 0,
          payment_date: data.payment_date,
          payment_mode: data.payment_mode,
          payment_status: data.payment_status,
          notes: allJobs.length > 1 
            ? `[Multi-Job Entry] ${job.is_other ? 'Other: ' + job.custom_detail : job.job_id}\n${data.notes || ''}`.trim()
            : data.notes,
          calculation_details: allJobs.length === 1 ? calculationDetails : undefined,
          advance_deductions: allJobs.length === 1 && selectedAdvances.length > 0 
            ? selectedAdvances.map(a => ({ id: a.id, amount: a.amount, employee_name: a.employee?.name, date: a.advance_date }))
            : undefined,
        }));

        // If multi-job with advances, apply deductions to first entry only
        if (allJobs.length > 1 && selectedAdvances.length > 0) {
          const totalJobsGross = entries.reduce((sum, e) => sum + (e.gross_amount || 0), 0);
          entries[0].total_amount = entries[0].gross_amount! - totalDeductions;
          entries[0].deduction_amount = totalDeductions;
          entries[0].advance_deductions = selectedAdvances.map(a => ({ 
            id: a.id, amount: a.amount, employee_name: a.employee?.name, date: a.advance_date 
          }));
          entries[0].calculation_details = calculationDetails;
        }

        const { data: result, error } = await supabase
          .from('external_job_salaries')
          .insert(entries)
          .select();
        
        if (error) throw error;
        
        // Close advances
        if (selectedAdvances.length > 0 && result && result.length > 0) {
          await closeAdvancesMutation.mutateAsync({
            advanceIds: selectedAdvances.map(a => a.id),
            salaryId: result[0].id,
          });
        }
        
        toast.success(`${entries.length} salary ${entries.length === 1 ? 'entry' : 'entries'} created successfully`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['external-job-salaries'] });
      navigate("/admin/external-jobs/salaries");
    } catch (error: any) {
      toast.error(error.message || "Failed to save salary entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEmployees = employees?.filter(e => e.is_active !== false) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/admin/external-jobs/salaries")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {editingSalary ? 'Edit Salary Entry' : 'Add Salary Entry'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {editingSalary ? 'Update salary details' : 'Create a new salary entry with multiple jobs support'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Operation Selection - First as it affects rates */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Operation & Employee</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </Card>

          {/* Jobs Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Jobs</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsJobSelectorOpen(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Job
              </Button>
            </div>

            {selectedJobs.length === 0 && !hasOtherJob ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No jobs added yet</p>
                <p className="text-sm">Click "Add Job" to select jobs for this salary entry</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Style/Product</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="text-right">Pieces</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-sm">
                          {job.job_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{job.is_custom_job ? getCustomJobProductName(job) : job.style_name}</span>
                            {job.is_custom_job && (
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {job.company_name || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={job.number_of_pieces}
                            onChange={(e) => updateJobPieces(job.id, Number(e.target.value))}
                            className="w-20 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={job.rate_per_piece}
                            onChange={(e) => updateJobRate(job.id, Number(e.target.value))}
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(job.number_of_pieces * job.rate_per_piece)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeJob(job.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Other Job Row */}
                    {hasOtherJob && (
                      <TableRow>
                        <TableCell className="font-mono text-sm">OTHER</TableCell>
                        <TableCell>
                          <Input
                            placeholder="Enter custom job detail..."
                            value={otherJobDetail}
                            onChange={(e) => setOtherJobDetail(e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={otherJobPieces}
                            onChange={(e) => setOtherJobPieces(Number(e.target.value))}
                            className="w-20 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={otherJobRate}
                            onChange={(e) => setOtherJobRate(Number(e.target.value))}
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(otherJobTotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setHasOtherJob(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {!hasOtherJob && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setHasOtherJob(true)}
                    className="text-muted-foreground"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add "Other" Entry
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Advance Deductions */}
          {selectedOperation && !editingSalary && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Deduct Advance</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdvanceModalOpen(true)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Select Advances
                </Button>
              </div>

              {selectedAdvances.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No advances selected. Click "Select Advances" to deduct from salary.
                </p>
              ) : (
                <div className="border rounded-lg divide-y">
                  {selectedAdvances.map((advance) => (
                    <div key={advance.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Minus className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-sm font-medium">{advance.employee?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(advance.advance_date), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-destructive">
                          -{formatAmount(advance.amount)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setSelectedAdvances(prev => prev.filter(a => a.id !== advance.id))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Calculation Summary */}
          <Card className="p-6 bg-muted/50">
            <h2 className="text-lg font-semibold mb-4">Calculation Summary</h2>
            <div className="space-y-3">
              {jobTotals.map((job) => (
                <div key={job.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {job.job_id} ({job.number_of_pieces} × ₹{job.rate_per_piece})
                  </span>
                  <span>{formatAmount(job.total)}</span>
                </div>
              ))}
              {hasOtherJob && otherJobPieces > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Other ({otherJobPieces} × ₹{otherJobRate})
                  </span>
                  <span>{formatAmount(otherJobTotal)}</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">Gross Amount</span>
                <span className="text-lg font-semibold">{formatAmount(grossAmount)}</span>
              </div>

              {selectedAdvances.length > 0 && (
                <>
                  <div className="flex justify-between items-center text-destructive">
                    <span>Total Deductions</span>
                    <span className="font-semibold">-{formatAmount(totalDeductions)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold">Final Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatAmount(finalAmount)}
                    </span>
                  </div>
                </>
              )}
              
              {selectedAdvances.length === 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">{formatAmount(grossAmount)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="mt-4">
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
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin/external-jobs/salaries")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSalary ? 'Update' : 'Create'} Salary Entry
            </Button>
          </div>
        </form>
      </Form>

      {/* Job Selector Dialog */}
      <Dialog open={isJobSelectorOpen} onOpenChange={setIsJobSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Job Order</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job ID, style, company, or pieces..."
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto mt-4 border rounded-lg">
            {jobOrdersLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading jobs...
              </div>
            ) : filteredJobOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No jobs found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Style/Product</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Pieces</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobOrders.map((job) => (
                    <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{job.job_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{job.is_custom_job ? getCustomJobProductName(job) : job.style_name}</span>
                          {job.is_custom_job && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {(job as any).company?.company_name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {job.number_of_pieces}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addJob(job)}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setHasOtherJob(true);
                setIsJobSelectorOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add "Other" (Custom Entry)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advance Deduction Modal */}
      <AdvanceDeductionModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        operation={selectedOperation}
        onSelect={setSelectedAdvances}
        selectedAdvances={selectedAdvances}
      />
    </div>
  );
};

export default AddSalaryEntry;
