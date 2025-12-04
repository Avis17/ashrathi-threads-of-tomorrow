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
  rate: number; // Now in rupees, not percentage
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
  delivery_date: z.string().min(1, "Delivery date is required"),
  rate_per_piece: z.number().min(0, "Rate per piece is required"),
  accessories_cost: z.number().min(0).optional(),
  delivery_charge: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

const AddJob = () => {
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
  
  const { data: tasks } = useExternalJobTasks(selectedProduct || undefined);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      rate_card_id: "",
      company_id: "",
      style_name: "",
      number_of_pieces: 0,
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
    // Handle "None" selection - clear all fields
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

  const updateCategory = (operation: string, index: number, field: "name" | "rate" | "customName" | "jobName" | "customJobName" | "customJobDescription", value: string | number) => {
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

  const getOperationAdjustment = (operation: string) => {
    const calculated = getOperationCalculatedTotal(operation);
    const roundOff = operationRoundOffs[operation];
    if (roundOff === null || roundOff === undefined) return 0;
    return roundOff - calculated;
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

    // Calculate operations with rupee-based categories
    const operationBreakdown: Record<string, { 
      categories: Array<{name: string, rate: number}>, 
      categoriesTotal: number,
      commissionPercent: number,
      commissionAmount: number,
      calculatedTotal: number,
      roundOff: number | null,
      adjustment: number,
      total: number 
    }> = {};
    let totalOperationsCost = 0;
    let totalCommission = 0;

    selectedOperations.forEach((op) => {
      const cats = operationCategories[op] || [];
      const commissionPercent = operationCommissions[op] || 0;
      const roundOff = operationRoundOffs[op];
      
      // Sum up all category rates (in rupees)
      let categoriesTotal = 0;
      const categoryList: Array<{name: string, rate: number}> = [];
      
      cats.forEach((cat) => {
        categoriesTotal += (cat.rate || 0);
        categoryList.push({ name: cat.name, rate: cat.rate || 0 });
      });
      
      // Calculate commission as percentage of categories total
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

    // Auto-calculate company profit
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
    clientRatePerPiece,
    total, 
    operationBreakdown, 
    totalOperationsCost,
    totalCommission,
    companyProfitPerPiece,
    companyProfitPercent
  } = calculateTotals();

  const handleAddProduct = async () => {
    if (!customProductName.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    await createProduct.mutateAsync(customProductName);
    setCustomProductName("");
  };

  const handleAddTask = async (categoryJobName: string, description?: string) => {
    if (!categoryJobName.trim()) {
      toast.error("Please enter a job name");
      return;
    }
    await createTask.mutateAsync({ 
      taskName: categoryJobName, 
      productId: selectedProduct || undefined,
      description: description || undefined
    });
  };

  const onSubmit = async (data: JobFormData) => {
    const operations = selectedOperations.map((op) => {
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

    await createJob.mutateAsync({
      jobOrder: {
        job_id: generateJobId(),
        company_id: data.company_id,
        style_name: data.style_name,
        number_of_pieces: data.number_of_pieces,
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

    navigate("/admin/external-jobs");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/external-jobs")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Job Order</h1>
          <p className="text-muted-foreground mt-1">
            Create a new job order with operations and pricing
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Rate Card (Optional)</h3>
            <FormField
              control={form.control}
              name="rate_card_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Card</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRateCardSelect(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rate card to pre-fill details" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (Manual Entry)</SelectItem>
                      {rateCards?.map((rateCard) => (
                        <SelectItem key={rateCard.id} value={rateCard.id}>
                          {rateCard.style_id} - {rateCard.style_name} ({rateCard.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Style Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter style name" />
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Enter client rate per piece"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      The amount company receives per piece from client
                    </p>
                  </FormItem>
                )}
              />

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
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="Enter number of pieces"
                      />
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
                    <FormLabel>Delivery Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter any additional notes for this job order..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Operations & Categories</h3>
            
            {/* Product Selection */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <FormLabel className="text-base font-semibold mb-2 block">Product Selection</FormLabel>
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product_name} {product.category && `(${product.category})`}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {selectedProduct === "other" && (
                  <>
                    <Input
                      placeholder="Enter custom product name"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddProduct}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {OPERATIONS.map((operation) => (
                <div key={operation} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOperations.includes(operation)}
                      onCheckedChange={() => toggleOperation(operation)}
                    />
                    <span className="font-medium">{operation}</span>
                  </div>

                  {selectedOperations.includes(operation) && (
                    <div className="ml-6 space-y-3">
                      {operationCategories[operation]?.map((category, index) => (
                         <div key={index} className="space-y-2">
                           <div className="flex gap-2 items-start">
                             {/* Single Job Selection with detailed display */}
                             <div className="flex-1">
                               <Select
                                 value={category.jobName}
                                 onValueChange={(value) => {
                                   updateCategory(operation, index, "jobName", value);
                                   // Also set the name field to match for data consistency
                                   updateCategory(operation, index, "name", value);
                                 }}
                               >
                                 <SelectTrigger className="w-full">
                                   <SelectValue placeholder="Select job/task">
                                     {category.jobName && category.jobName !== "Other" && (
                                       <div className="flex flex-col items-start">
                                         <span className="font-medium">{category.jobName}</span>
                                         <span className="text-xs text-muted-foreground">{operation}</span>
                                       </div>
                                     )}
                                     {category.jobName === "Other" && (
                                       <span>Other (Custom)</span>
                                     )}
                                   </SelectValue>
                                 </SelectTrigger>
                                 <SelectContent>
                                                   {tasks?.map((task) => (
                                                     <SelectItem key={task.id} value={task.task_name}>
                                                       <div className="flex flex-col">
                                                         <span className="font-medium">{task.task_name}</span>
                                                         <span className="text-xs text-muted-foreground italic">
                                                           {task.description || "No description available"}
                                                         </span>
                                                       </div>
                                                     </SelectItem>
                                                   ))}
                                                   {/* Also show operation-specific categories */}
                                                   {getCategories(operation).filter(cat => cat !== "Other").map((cat) => (
                                                     <SelectItem key={cat} value={cat}>
                                                       <div className="flex flex-col">
                                                         <span className="font-medium">{cat}</span>
                                                         <span className="text-xs text-muted-foreground italic">Standard {operation.toLowerCase()} category</span>
                                                       </div>
                                                     </SelectItem>
                                                   ))}
                                   <SelectItem value="Other">
                                     <div className="flex flex-col">
                                       <span className="font-medium">Other</span>
                                       <span className="text-xs text-muted-foreground">Add custom job/task</span>
                                     </div>
                                   </SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                             
                             <Input
                               type="number"
                               step="0.01"
                               placeholder="Rate ₹"
                               value={category.rate}
                               onChange={(e) => updateCategory(operation, index, "rate", parseFloat(e.target.value) || 0)}
                               className="w-28"
                             />
                             <Button
                               type="button"
                               variant="ghost"
                               size="icon"
                               onClick={() => removeCategory(operation, index)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                           
                           {/* Custom Job Name Input */}
                           {category.jobName === "Other" && (
                             <div className="space-y-2 ml-0 p-3 bg-muted/30 rounded-lg">
                               <Input
                                 placeholder="Enter job/task name (e.g., Gusset Pouch)"
                                 value={category.customJobName || ""}
                                 onChange={(e) => updateCategory(operation, index, "customJobName", e.target.value)}
                               />
                               <Input
                                 placeholder="Describe purpose (e.g., Joining sleeve and body, Stitching side seam)"
                                 value={category.customJobDescription || ""}
                                 onChange={(e) => updateCategory(operation, index, "customJobDescription", e.target.value)}
                                 className="text-sm"
                               />
                               <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   const customJob = category.customJobName?.trim();
                                   const desc = category.customJobDescription?.trim();
                                   if (customJob) {
                                     handleAddTask(customJob, desc);
                                   } else {
                                     toast.error("Please enter a job name");
                                   }
                                 }}
                                 className="gap-1"
                               >
                                 <Plus className="h-3 w-3" />
                                 Add to task list
                               </Button>
                             </div>
                           )}
                         </div>
                      ))}
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCategory(operation)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Category
                        </Button>
                        
                        {/* Commission Field */}
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-sm text-muted-foreground">Commission:</span>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            value={operationCommissions[operation] || ""}
                            onChange={(e) => updateCommission(operation, parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>

                      {/* Round-off Section */}
                      {(operationCategories[operation]?.length > 0) && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Calculated:</span>
                              <span className="text-sm font-bold">₹{getOperationCalculatedTotal(operation).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Round off to:</span>
                              <Input
                                type="number"
                                step="0.5"
                                placeholder={getOperationCalculatedTotal(operation).toFixed(2)}
                                value={operationRoundOffs[operation] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateRoundOff(operation, val === "" ? null : parseFloat(val));
                                }}
                                className="w-24"
                              />
                            </div>
                            {operationRoundOffs[operation] !== null && operationRoundOffs[operation] !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Adjustment:</span>
                                <span className={`text-sm font-bold ${getOperationAdjustment(operation) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {getOperationAdjustment(operation) >= 0 ? '+' : ''}₹{getOperationAdjustment(operation).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Final:</span>
                              <span className="text-base font-bold text-blue-600">₹{getOperationFinalTotal(operation).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Costs (Total)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessories_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessories Cost (Total)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0"
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
                    <FormLabel>Delivery Charge (Total)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Cost Summary
            </h3>
            
            <div className="space-y-6">
              {/* Client Rate */}
              <div className="flex justify-between text-lg font-bold bg-blue-500/10 p-3 rounded-lg">
                <span>Client Rate per Piece:</span>
                <span className="text-blue-600">₹{clientRatePerPiece.toFixed(2)}</span>
              </div>

              {/* Operations Breakdown */}
              {Object.entries(operationBreakdown).map(([op, breakdown]) => (
                <div key={op} className="bg-white/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-primary">{op}</h4>
                  {breakdown.categories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4">
                      <span className="text-muted-foreground">{cat.name || "Unnamed"}</span>
                      <span className="font-medium">₹{cat.rate.toFixed(2)}</span>
                    </div>
                  ))}
                  {breakdown.commissionPercent > 0 && (
                    <div className="flex justify-between text-sm ml-4 text-orange-600">
                      <span className="font-medium">Commission ({breakdown.commissionPercent}%)</span>
                      <span className="font-semibold">₹{breakdown.commissionAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>{op} Total:</span>
                    <span>₹{breakdown.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              {/* Total Operations */}
              <div className="flex justify-between text-base font-semibold border-t-2 pt-3">
                <span>Total Operations Cost (per piece):</span>
                <span className="text-red-600">₹{totalOperationsCost.toFixed(2)}</span>
              </div>

              {/* Total Commission */}
              {totalCommission > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Total Commission Included:</span>
                  <span className="font-medium">₹{totalCommission.toFixed(2)}</span>
                </div>
              )}

              {/* Company Profit (Auto-calculated) */}
              <div className={`flex justify-between text-lg font-bold p-3 rounded-lg ${companyProfitPerPiece >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <span>Company Profit (per piece):</span>
                <span className={companyProfitPerPiece >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{companyProfitPerPiece.toFixed(2)} ({companyProfitPercent.toFixed(1)}%)
                </span>
              </div>

              {/* Quantity & Subtotal */}
              <div className="space-y-2 text-sm border-t-2 pt-3">
                <div className="flex justify-between">
                  <span>Number of Pieces:</span>
                  <span className="font-medium">{form.watch("number_of_pieces") || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal (Rate × Pieces):</span>
                  <span className="font-medium">₹{(clientRatePerPiece * (form.watch("number_of_pieces") || 0)).toFixed(2)}</span>
                </div>
              </div>

              {/* Additional Costs */}
              {(form.watch("accessories_cost") > 0 || form.watch("delivery_charge") > 0) && (
                <div className="space-y-2 text-sm border-t pt-3">
                  {form.watch("accessories_cost") > 0 && (
                    <div className="flex justify-between">
                      <span>Accessories Cost:</span>
                      <span className="font-medium">₹{form.watch("accessories_cost").toFixed(2)}</span>
                    </div>
                  )}
                  {form.watch("delivery_charge") > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span className="font-medium">₹{form.watch("delivery_charge").toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between text-2xl font-bold border-t-4 border-primary pt-4">
                <span>Total Amount:</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/external-jobs")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? "Creating..." : "Create Job Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddJob;
