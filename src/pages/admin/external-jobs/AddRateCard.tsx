import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  useCreateExternalJobRateCard,
  useUpdateExternalJobRateCard,
  useExternalJobRateCard,
  useExternalJobRateCards,
} from "@/hooks/useExternalJobRateCards";
import { 
  useExternalJobProducts, 
  useCreateExternalJobProduct,
  useExternalJobTasks,
  useCreateExternalJobTask
} from "@/hooks/useExternalJobProducts";
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

const CATEGORIES = ["Men", "Women", "Kids", "Unisex"];
const STYLE_NAMES = [
  "T-Shirt",
  "Polo T-Shirt",
  "Men's Polo Tshirt",
  "Leggings",
  "Track Pants",
  "Shorts",
  "Joggers",
  "Nightwear",
  "Innerwear",
  "Other",
];

const rateCardSchema = z.object({
  style_name: z.string().min(1, "Style name is required"),
  custom_style_name: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  rate_per_piece: z.number().min(0, "Rate per piece is required"),
  accessories_cost: z.number().min(0).optional(),
  delivery_charge: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type RateCardFormData = z.infer<typeof rateCardSchema>;

const AddRateCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: existingCard } = useExternalJobRateCard(id || "");
  const { data: allRateCards } = useExternalJobRateCards();
  const { data: products } = useExternalJobProducts();
  const createRateCard = useCreateExternalJobRateCard();
  const updateRateCard = useUpdateExternalJobRateCard();
  const createProduct = useCreateExternalJobProduct();
  const createTask = useCreateExternalJobTask();
  const { getCategories, addCustomCategory } = useCustomCategories();

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customProductName, setCustomProductName] = useState("");
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [operationCategories, setOperationCategories] = useState<Record<string, CategoryItem[]>>({});
  const [operationCommissions, setOperationCommissions] = useState<Record<string, number>>({});
  const [operationRoundOffs, setOperationRoundOffs] = useState<Record<string, number | null>>({});
  const [generatedStyleId, setGeneratedStyleId] = useState("");
  
  const { data: tasks } = useExternalJobTasks(selectedProduct || undefined);

  const form = useForm<RateCardFormData>({
    resolver: zodResolver(rateCardSchema),
    defaultValues: {
      style_name: "",
      custom_style_name: "",
      category: "",
      rate_per_piece: 0,
      accessories_cost: 0,
      delivery_charge: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (existingCard) {
      form.setValue("style_name", existingCard.style_name);
      form.setValue("category", existingCard.category);
      form.setValue("rate_per_piece", existingCard.rate_per_piece || 0);
      form.setValue("accessories_cost", existingCard.accessories_cost);
      form.setValue("delivery_charge", existingCard.delivery_charge);
      form.setValue("notes", (existingCard as any).notes || "");
      setGeneratedStyleId(existingCard.style_id);

      const operations = existingCard.operations_data as any[];
      const ops: string[] = [];
      const cats: Record<string, CategoryItem[]> = {};
      const comms: Record<string, number> = {};
      const roundOffs: Record<string, number | null> = {};

      operations.forEach((op: any) => {
        ops.push(op.operation_name);
        cats[op.operation_name] = op.categories;
        comms[op.operation_name] = op.commission_percent || 0;
        roundOffs[op.operation_name] = op.round_off ?? null;
      });

      setSelectedOperations(ops);
      setOperationCategories(cats);
      setOperationCommissions(comms);
      setOperationRoundOffs(roundOffs);
    }
  }, [existingCard]);

  const generateStyleId = (styleName: string, category: string, customName?: string) => {
    if (!styleName || !category) return "";

    const categoryCode = category.charAt(0).toUpperCase();
    
    const finalStyleName = styleName === "Other" && customName ? customName : styleName;
    const styleCode = finalStyleName
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 3)
      .toUpperCase();

    // Find the highest existing increment for this prefix
    const prefix = `FF-RC-${categoryCode}-${styleCode}-`;
    let maxIncrement = 0;
    
    if (allRateCards) {
      allRateCards.forEach((card) => {
        if (card.style_id.startsWith(prefix)) {
          const incrementStr = card.style_id.replace(prefix, "");
          const incrementNum = parseInt(incrementStr, 10);
          if (!isNaN(incrementNum) && incrementNum > maxIncrement) {
            maxIncrement = incrementNum;
          }
        }
      });
    }

    const nextIncrement = String(maxIncrement + 1).padStart(3, "0");
    return `${prefix}${nextIncrement}`;
  };

  useEffect(() => {
    const styleName = form.watch("style_name");
    const category = form.watch("category");
    const customName = form.watch("custom_style_name");

    if (!isEditing && styleName && category) {
      const newId = generateStyleId(styleName, category, customName);
      setGeneratedStyleId(newId);
    }
  }, [form.watch("style_name"), form.watch("category"), form.watch("custom_style_name"), isEditing, allRateCards]);

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

  const updateCategory = (
    operation: string,
    index: number,
    field: "name" | "rate" | "customName" | "jobName" | "customJobName" | "customJobDescription",
    value: string | number
  ) => {
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
    const clientRatePerPiece = form.watch("rate_per_piece") || 0;

    const operationBreakdown: Record<
      string,
      { 
        categories: Array<{ name: string; rate: number }>; 
        categoriesTotal: number;
        commissionPercent: number;
        commissionAmount: number;
        calculatedTotal: number;
        roundOff: number | null;
        adjustment: number;
        total: number;
      }
    > = {};
    let totalOperationsCost = 0;
    let totalCommission = 0;

    selectedOperations.forEach((op) => {
      const cats = operationCategories[op] || [];
      const commissionPercent = operationCommissions[op] || 0;
      const roundOff = operationRoundOffs[op];

      let categoriesTotal = 0;
      const categoryList: Array<{ name: string; rate: number }> = [];

      cats.forEach((cat) => {
        categoriesTotal += cat.rate || 0;
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
        total: opTotal,
      };

      totalOperationsCost += opTotal;
      totalCommission += commissionAmount;
    });

    // Auto-calculate company profit
    const companyProfitPerPiece = clientRatePerPiece - totalOperationsCost;
    const companyProfitPercent = clientRatePerPiece > 0 
      ? (companyProfitPerPiece / clientRatePerPiece) * 100 
      : 0;

    return { 
      clientRatePerPiece,
      operationBreakdown, 
      totalOperationsCost,
      totalCommission,
      companyProfitPerPiece,
      companyProfitPercent
    };
  };

  const { 
    clientRatePerPiece,
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

  const onSubmit = async (data: RateCardFormData) => {
    const operations = selectedOperations.map((op) => {
      const breakdown = operationBreakdown[op];
      return {
        operation_name: op,
        commission_percent: operationCommissions[op] || 0,
        round_off: operationRoundOffs[op] ?? null,
        adjustment: breakdown?.adjustment || 0,
        categories: (operationCategories[op] || []).map((cat) => ({
          job_name: cat.jobName === "Other" && cat.customJobName ? cat.customJobName : cat.jobName,
          name: cat.name === "Other" && cat.customName ? cat.customName : cat.name,
          rate: cat.rate,
          customName: cat.customName,
        })),
      };
    });

    const finalStyleName =
      data.style_name === "Other" && data.custom_style_name
        ? data.custom_style_name
        : data.style_name;

    const rateCardData = {
      style_id: generatedStyleId,
      style_name: finalStyleName,
      category: data.category,
      operations_data: operations as any,
      accessories_cost: data.accessories_cost || 0,
      delivery_charge: data.delivery_charge || 0,
      company_profit_type: "amount",
      company_profit_value: companyProfitPerPiece,
      rate_per_piece: data.rate_per_piece,
      notes: data.notes || null,
    };

    if (isEditing && id) {
      await updateRateCard.mutateAsync({ id, data: rateCardData });
    } else {
      await createRateCard.mutateAsync(rateCardData);
    }

    navigate("/admin/external-jobs/rate-cards");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/external-jobs/rate-cards")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Rate Card" : "Add New Rate Card"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a reusable rate card template for job orders
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STYLE_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("style_name") === "Other" && (
                <FormField
                  control={form.control}
                  name="custom_style_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Style Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter custom style name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add any notes or special instructions for this rate card..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormLabel>Generated Style ID</FormLabel>
                <div className="mt-2 p-3 bg-muted rounded-md font-mono text-lg font-semibold">
                  {generatedStyleId || "Select category and style name to generate ID"}
                </div>
              </div>
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
                               onChange={(e) =>
                                 updateCategory(
                                   operation,
                                   index,
                                   "rate",
                                   parseFloat(e.target.value) || 0
                                 )
                               }
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
                                 onChange={(e) =>
                                   updateCategory(operation, index, "customJobName", e.target.value)
                                 }
                               />
                               <Input
                                 placeholder="Describe purpose (e.g., Joining sleeve and body, Stitching side seam)"
                                 value={category.customJobDescription || ""}
                                 onChange={(e) =>
                                   updateCategory(operation, index, "customJobDescription", e.target.value)
                                 }
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
            <h3 className="text-xl font-bold mb-6">Cost Summary</h3>
            <div className="space-y-4">
              {/* Client Rate */}
              <div className="flex justify-between text-lg font-bold bg-blue-500/10 p-3 rounded-lg">
                <span>Client Rate per Piece:</span>
                <span className="text-blue-600">₹{clientRatePerPiece.toFixed(2)}</span>
              </div>

              {Object.keys(operationBreakdown).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(operationBreakdown).map(([op, data]) => (
                    <div key={op} className="p-4 bg-background rounded-lg">
                      <div className="font-semibold text-sm text-muted-foreground mb-2">
                        {op}
                      </div>
                      <div className="space-y-1 text-sm">
                        {data.categories.map((cat, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{cat.name || "Unnamed"}</span>
                            <span>₹{cat.rate.toFixed(2)}</span>
                          </div>
                        ))}
                        {data.commissionPercent > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Commission ({data.commissionPercent}%)</span>
                            <span>₹{data.commissionAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total</span>
                          <span>₹{data.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t-2 border-primary/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Operations Cost:</span>
                  <span className="font-medium text-red-600">₹{totalOperationsCost.toFixed(2)}</span>
                </div>
                
                {totalCommission > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Total Commission Included:</span>
                    <span className="font-medium">₹{totalCommission.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Company Profit (Auto-calculated) */}
                <div className={`flex justify-between text-lg font-bold p-3 rounded-lg mt-3 ${companyProfitPerPiece >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <span>Company Profit (per piece):</span>
                  <span className={companyProfitPerPiece >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ₹{companyProfitPerPiece.toFixed(2)} ({companyProfitPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              {isEditing ? "Update Rate Card" : "Create Rate Card"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/admin/external-jobs/rate-cards")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddRateCard;
