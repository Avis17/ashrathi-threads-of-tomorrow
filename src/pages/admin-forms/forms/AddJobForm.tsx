import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useExternalJobCompanies, useCreateExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { useExternalJobRateCards } from "@/hooks/useExternalJobRateCards";
import { 
  useExternalJobProducts, 
  useCreateExternalJobProduct,
  useExternalJobTasks,
  useCreateExternalJobTask
} from "@/hooks/useExternalJobProducts";
import { format } from "date-fns";
import { OPERATIONS } from "@/lib/jobOrderCategories";
import { useCustomCategories } from "@/hooks/useCustomCategories";

type CategoryItem = { 
  name: string; 
  rate: number;
  customName?: string;
  jobName?: string;
  customJobName?: string;
  customJobDescription?: string;
};

const jobSchema = z.object({
  rate_card_id: z.string().optional(),
  company_id: z.string().min(1, "Company is required"),
  style_name: z.string().min(1, "Style name is required"),
  number_of_pieces: z.number().min(1, "Number of pieces must be at least 1"),
  order_date: z.string().min(1, "Order date is required"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  rate_per_piece: z.number().min(0, "Rate per piece is required"),
  accessories_cost: z.number().min(0).optional(),
  delivery_charge: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function AddJobForm() {
  const navigate = useNavigate();
  const { data: companies } = useExternalJobCompanies();
  const { data: rateCards } = useExternalJobRateCards();
  const { data: products } = useExternalJobProducts();
  const createJob = useCreateExternalJobOrder();
  const createProduct = useCreateExternalJobProduct();
  const createTask = useCreateExternalJobTask();
  const { getCategories, addCustomCategory } = useCustomCategories();

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customProductName, setCustomProductName] = useState("");
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [operationCategories, setOperationCategories] = useState<Record<string, CategoryItem[]>>({});
  const [operationCommissions, setOperationCommissions] = useState<Record<string, number>>({});
  const [operationRoundOffs, setOperationRoundOffs] = useState<Record<string, number | null>>({});
  
  const [specialCaseMode, setSpecialCaseMode] = useState(false);
  const [directOperationRates, setDirectOperationRates] = useState<Record<string, number>>({});
  
  const { data: tasks } = useExternalJobTasks(selectedProduct || undefined);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      rate_card_id: "",
      company_id: "",
      style_name: "",
      number_of_pieces: 0,
      order_date: format(new Date(), 'yyyy-MM-dd'),
      delivery_date: "",
      rate_per_piece: 0,
      accessories_cost: 0,
      delivery_charge: 0,
      notes: "",
    },
  });

  const generateJobId = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FFJ-${date}-${random}`;
  };

  const handleRateCardSelect = (rateCardId: string) => {
    if (rateCardId === "none" || !rateCardId) {
      form.setValue("style_name", "");
      form.setValue("rate_per_piece", 0);
      form.setValue("accessories_cost", 0);
      form.setValue("delivery_charge", 0);
      setSelectedOperations([]);
      setOperationCategories({});
      setOperationCommissions({});
      setOperationRoundOffs({});
      return;
    }

    const rateCard = rateCards?.find((rc) => rc.id === rateCardId);
    if (!rateCard) return;

    form.setValue("style_name", rateCard.style_name);
    form.setValue("rate_per_piece", rateCard.rate_per_piece || 0);
    form.setValue("accessories_cost", rateCard.accessories_cost);
    form.setValue("delivery_charge", rateCard.delivery_charge);

    const operations = rateCard.operations_data as any[];
    const ops: string[] = [];
    const cats: Record<string, CategoryItem[]> = {};
    const comms: Record<string, number> = {};
    const roundOffs: Record<string, number | null> = {};

    operations.forEach((op: any) => {
      ops.push(op.operation_name);
      const allCategories = getCategories(op.operation_name);
      const mappedCategories = op.categories.map((cat: any) => {
        const isCustom = !allCategories.includes(cat.name);
        return {
          name: isCustom ? "Other" : cat.name,
          rate: cat.rate,
          customName: isCustom ? cat.name : (cat.customName || ""),
          jobName: cat.job_name || cat.jobName || "",
          customJobName: cat.customJobName || "",
        };
      });
      cats[op.operation_name] = mappedCategories;
      comms[op.operation_name] = op.commission_percent || 0;
      roundOffs[op.operation_name] = op.round_off ?? null;
    });

    setSelectedOperations(ops);
    setOperationCategories(cats);
    setOperationCommissions(comms);
    setOperationRoundOffs(roundOffs);
  };

  const toggleOperation = (operation: string) => {
    if (selectedOperations.includes(operation)) {
      setSelectedOperations(selectedOperations.filter((op) => op !== operation));
      const newCategories = { ...operationCategories };
      delete newCategories[operation];
      setOperationCategories(newCategories);
      const newCommissions = { ...operationCommissions };
      delete newCommissions[operation];
      setOperationCommissions(newCommissions);
      const newRoundOffs = { ...operationRoundOffs };
      delete newRoundOffs[operation];
      setOperationRoundOffs(newRoundOffs);
    } else {
      setSelectedOperations([...selectedOperations, operation]);
      setOperationCategories({
        ...operationCategories,
        [operation]: [],
      });
      setOperationCommissions({
        ...operationCommissions,
        [operation]: 0,
      });
      setOperationRoundOffs({
        ...operationRoundOffs,
        [operation]: null,
      });
    }
  };

  const addCategory = (operation: string) => {
    setOperationCategories({
      ...operationCategories,
      [operation]: [
        ...(operationCategories[operation] || []),
        { name: "", rate: 0, customName: "", jobName: "", customJobName: "", customJobDescription: "" },
      ],
    });
  };

  const updateCategory = (operation: string, index: number, field: string, value: string | number) => {
    const newCategories = { ...operationCategories };
    if (field === "name") {
      newCategories[operation][index].name = value as string;
      if (value !== "Other") {
        newCategories[operation][index].customName = "";
      }
    } else if (field === "rate") {
      newCategories[operation][index].rate = value as number;
    } else if (field === "customName") {
      newCategories[operation][index].customName = value as string;
    } else if (field === "jobName") {
      newCategories[operation][index].jobName = value as string;
      if (value !== "Other") {
        newCategories[operation][index].customJobName = "";
        newCategories[operation][index].customJobDescription = "";
      }
    } else if (field === "customJobName") {
      newCategories[operation][index].customJobName = value as string;
    } else if (field === "customJobDescription") {
      newCategories[operation][index].customJobDescription = value as string;
    }
    setOperationCategories(newCategories);
  };

  const updateCommission = (operation: string, value: number) => {
    setOperationCommissions({
      ...operationCommissions,
      [operation]: value,
    });
  };

  const updateRoundOff = (operation: string, value: number | null) => {
    setOperationRoundOffs({
      ...operationRoundOffs,
      [operation]: value,
    });
  };

  const getOperationCalculatedTotal = (operation: string) => {
    const cats = operationCategories[operation] || [];
    const commissionPercent = operationCommissions[operation] || 0;
    let categoriesTotal = cats.reduce((sum, cat) => sum + (cat.rate || 0), 0);
    const commissionAmount = (categoriesTotal * commissionPercent) / 100;
    return categoriesTotal + commissionAmount;
  };

  const getOperationFinalTotal = (operation: string) => {
    const roundOff = operationRoundOffs[operation];
    if (roundOff !== null && roundOff !== undefined) {
      return roundOff;
    }
    return getOperationCalculatedTotal(operation);
  };

  const removeCategory = (operation: string, index: number) => {
    const newCategories = { ...operationCategories };
    newCategories[operation].splice(index, 1);
    setOperationCategories(newCategories);
  };

  const calculateTotals = () => {
    const pieces = form.watch("number_of_pieces") || 0;
    const clientRatePerPiece = form.watch("rate_per_piece") || 0;
    const accessories = form.watch("accessories_cost") || 0;
    const delivery = form.watch("delivery_charge") || 0;

    const operationBreakdown: Record<string, any> = {};
    let totalOperationsCost = 0;
    let totalCommission = 0;

    if (specialCaseMode) {
      selectedOperations.forEach((op) => {
        const directRate = directOperationRates[op] || 0;
        const commissionPercent = operationCommissions[op] || 0;
        const commissionAmount = (directRate * commissionPercent) / 100;
        const opTotal = directRate + commissionAmount;
        
        operationBreakdown[op] = {
          categories: [{ name: 'Direct Rate', rate: directRate }],
          categoriesTotal: directRate,
          commissionPercent,
          commissionAmount,
          calculatedTotal: opTotal,
          roundOff: null,
          adjustment: 0,
          total: opTotal
        };
        
        totalOperationsCost += opTotal;
        totalCommission += commissionAmount;
      });
    } else {
      selectedOperations.forEach((op) => {
        const cats = operationCategories[op] || [];
        const commissionPercent = operationCommissions[op] || 0;
        const roundOff = operationRoundOffs[op];
        
        let categoriesTotal = 0;
        const categoryList: Array<{name: string, rate: number}> = [];
        
        cats.forEach((cat) => {
          categoriesTotal += (cat.rate || 0);
          categoryList.push({ name: cat.name, rate: cat.rate || 0 });
        });
        
        const commissionAmount = (categoriesTotal * commissionPercent) / 100;
        const calculatedTotal = categoriesTotal + commissionAmount;
        const adjustment = (roundOff !== null && roundOff !== undefined) ? roundOff - calculatedTotal : 0;
        const opTotal = (roundOff !== null && roundOff !== undefined) ? roundOff : calculatedTotal;
        
        operationBreakdown[op] = {
          categories: categoryList,
          categoriesTotal,
          commissionPercent,
          commissionAmount,
          calculatedTotal,
          roundOff: roundOff ?? null,
          adjustment,
          total: opTotal
        };
        
        totalOperationsCost += opTotal;
        totalCommission += commissionAmount;
      });
    }

    const companyProfitPerPiece = clientRatePerPiece - totalOperationsCost;
    const companyProfitPercent = clientRatePerPiece > 0 
      ? (companyProfitPerPiece / clientRatePerPiece) * 100 
      : 0;

    const subtotal = clientRatePerPiece * pieces;
    const total = subtotal + accessories + delivery;

    return { 
      clientRatePerPiece,
      total, 
      operationBreakdown, 
      totalOperationsCost,
      totalCommission,
      companyProfitPerPiece,
      companyProfitPercent
    };
  };

  const { 
    total, 
    operationBreakdown, 
    totalOperationsCost,
    companyProfitPerPiece,
    companyProfitPercent
  } = calculateTotals();

  const onSubmit = async (data: JobFormData) => {
    let operations;
    
    if (specialCaseMode) {
      operations = selectedOperations.map((op) => {
        return {
          operation_name: op,
          commission_percent: operationCommissions[op] || 0,
          round_off: null,
          adjustment: 0,
          categories: [{
            job_name: 'Direct Entry',
            category_name: 'Special Case Rate',
            rate: directOperationRates[op] || 0,
          }],
        };
      });
    } else {
      operations = selectedOperations.map((op) => {
        const breakdown = operationBreakdown[op];
        return {
          operation_name: op,
          commission_percent: operationCommissions[op] || 0,
          round_off: operationRoundOffs[op] ?? null,
          adjustment: breakdown?.adjustment || 0,
          categories: (operationCategories[op] || []).map((cat) => ({
            job_name: cat.jobName === "Other" && cat.customJobName ? cat.customJobName : cat.jobName,
            category_name: cat.name === "Other" && cat.customName ? cat.customName : cat.name,
            rate: cat.rate,
          })),
        };
      });
    }

    await createJob.mutateAsync({
      jobOrder: {
        job_id: generateJobId(),
        company_id: data.company_id,
        style_name: data.style_name,
        number_of_pieces: data.number_of_pieces,
        order_date: data.order_date,
        delivery_date: data.delivery_date,
        accessories_cost: data.accessories_cost || 0,
        delivery_charge: data.delivery_charge || 0,
        company_profit_type: "amount",
        company_profit_value: companyProfitPerPiece,
        rate_per_piece: data.rate_per_piece,
        total_amount: total,
        notes: data.notes || null,
      },
      operations,
    });

    toast.success("Job order created successfully!");
    navigate("/admin-forms");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-white">Add New Job Order</h1>
            <p className="text-slate-300 mt-1">
              Create a new job order with operations and pricing
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rate Card Selection */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-white">Select Rate Card (Optional)</h3>
              <FormField
                control={form.control}
                name="rate_card_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Rate Card</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleRateCardSelect(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a rate card to pre-fill details" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {rateCards?.map((rc) => (
                          <SelectItem key={rc.id} value={rc.id}>
                            {rc.style_name} ({rc.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Basic Details */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-white">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Company *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.company_name}
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
                  name="style_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Style Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 7/8 High Waist Legging" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number_of_pieces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Number of Pieces *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white"
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
                      <FormLabel className="text-slate-200">Rate Per Piece (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Order Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white/10 border-white/20 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Delivery Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white/10 border-white/20 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessories_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Accessories Cost (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_charge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Delivery Charge (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white"
                        />
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
                  <FormItem className="mt-4">
                    <FormLabel className="text-slate-200">Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Special Case Mode */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Checkbox
                  id="special-case"
                  checked={specialCaseMode}
                  onCheckedChange={(checked) => setSpecialCaseMode(!!checked)}
                />
                <label htmlFor="special-case" className="text-white font-medium cursor-pointer">
                  Special Case Mode (Direct Rate Entry)
                </label>
              </div>

              {specialCaseMode && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">Enter direct rates for operations:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {["Stitching (Singer)", "Stitching (Power Table)", "Cutting", "Checking", "Ironing", "Packing"].map((op) => (
                      <div key={op} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedOperations.includes(op)}
                            onCheckedChange={() => toggleOperation(op)}
                          />
                          <span className="text-white text-sm">{op}</span>
                        </div>
                        {selectedOperations.includes(op) && (
                          <div className="flex gap-2 ml-6">
                            <Input
                              type="number"
                              placeholder="Rate"
                              value={directOperationRates[op] || ""}
                              onChange={(e) => setDirectOperationRates({ ...directOperationRates, [op]: Number(e.target.value) })}
                              className="bg-white/10 border-white/20 text-white w-24"
                            />
                            <Input
                              type="number"
                              placeholder="Comm %"
                              value={operationCommissions[op] || ""}
                              onChange={(e) => updateCommission(op, Number(e.target.value))}
                              className="bg-white/10 border-white/20 text-white w-24"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Summary */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-white">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Operations Cost</p>
                  <p className="text-white text-xl font-bold">₹{totalOperationsCost.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Company Profit/Piece</p>
                  <p className={`text-xl font-bold ${companyProfitPerPiece >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{companyProfitPerPiece.toFixed(2)} ({companyProfitPercent.toFixed(1)}%)
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Pieces</p>
                  <p className="text-white text-xl font-bold">{form.watch("number_of_pieces")}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Amount</p>
                  <p className="text-white text-xl font-bold">₹{total.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin-forms")}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createJob.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {createJob.isPending ? "Creating..." : "Create Job Order"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
