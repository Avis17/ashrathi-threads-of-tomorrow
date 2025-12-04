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
});

type RateCardFormData = z.infer<typeof rateCardSchema>;

const AddRateCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: existingCard } = useExternalJobRateCard(id || "");
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
    },
  });

  useEffect(() => {
    if (existingCard) {
      form.setValue("style_name", existingCard.style_name);
      form.setValue("category", existingCard.category);
      form.setValue("rate_per_piece", existingCard.rate_per_piece || 0);
      form.setValue("accessories_cost", existingCard.accessories_cost);
      form.setValue("delivery_charge", existingCard.delivery_charge);
      setGeneratedStyleId(existingCard.style_id);

      const operations = existingCard.operations_data as any[];
      const ops: string[] = [];
      const cats: Record<string, CategoryItem[]> = {};
      const comms: Record<string, number> = {};

      operations.forEach((op: any) => {
        ops.push(op.operation_name);
        cats[op.operation_name] = op.categories;
        comms[op.operation_name] = op.commission_percent || 0;
      });

      setSelectedOperations(ops);
      setOperationCategories(cats);
      setOperationCommissions(comms);
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

    const increment = "001";
    return `FF-RC-${categoryCode}-${styleCode}-${increment}`;
  };

  useEffect(() => {
    const styleName = form.watch("style_name");
    const category = form.watch("category");
    const customName = form.watch("custom_style_name");

    if (!isEditing && styleName && category) {
      const newId = generateStyleId(styleName, category, customName);
      setGeneratedStyleId(newId);
    }
  }, [form.watch("style_name"), form.watch("category"), form.watch("custom_style_name"), isEditing]);

  const toggleOperation = (operation: string) => {
    if (selectedOperations.includes(operation)) {
      setSelectedOperations(selectedOperations.filter((op) => op !== operation));
      const newCategories = { ...operationCategories };
      delete newCategories[operation];
      setOperationCategories(newCategories);
      const newCommissions = { ...operationCommissions };
      delete newCommissions[operation];
      setOperationCommissions(newCommissions);
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
    }
  };

  const addCategory = (operation: string) => {
    setOperationCategories({
      ...operationCategories,
      [operation]: [
        ...(operationCategories[operation] || []),
        { name: "", rate: 0, customName: "", jobName: "", customJobName: "" },
      ],
    });
  };

  const updateCategory = (
    operation: string,
    index: number,
    field: "name" | "rate" | "customName" | "jobName" | "customJobName",
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
      }
    } else if (field === "customJobName") {
      newCategories[operation][index].customJobName = value as string;
    }
    setOperationCategories(newCategories);
  };

  const updateCommission = (operation: string, value: number) => {
    setOperationCommissions({
      ...operationCommissions,
      [operation]: value,
    });
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
        total: number 
      }
    > = {};
    let totalOperationsCost = 0;
    let totalCommission = 0;

    selectedOperations.forEach((op) => {
      const cats = operationCategories[op] || [];
      const commissionPercent = operationCommissions[op] || 0;

      let categoriesTotal = 0;
      const categoryList: Array<{ name: string; rate: number }> = [];

      cats.forEach((cat) => {
        categoriesTotal += cat.rate || 0;
        categoryList.push({ name: cat.name, rate: cat.rate || 0 });
      });

      const commissionAmount = (categoriesTotal * commissionPercent) / 100;
      const opTotal = categoriesTotal + commissionAmount;

      operationBreakdown[op] = {
        categories: categoryList,
        categoriesTotal,
        commissionPercent,
        commissionAmount,
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

  const handleAddTask = async (categoryJobName: string) => {
    if (!categoryJobName.trim()) {
      toast.error("Please enter a job name");
      return;
    }
    await createTask.mutateAsync({ 
      taskName: categoryJobName, 
      productId: selectedProduct || undefined 
    });
  };

  const onSubmit = async (data: RateCardFormData) => {
    const operations = selectedOperations.map((op) => ({
      operation_name: op,
      commission_percent: operationCommissions[op] || 0,
      categories: (operationCategories[op] || []).map((cat) => ({
        job_name: cat.jobName === "Other" && cat.customJobName ? cat.customJobName : cat.jobName,
        name: cat.name === "Other" && cat.customName ? cat.customName : cat.name,
        rate: cat.rate,
        customName: cat.customName,
      })),
    }));

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
                           <div className="flex gap-2">
                             {/* Job Dropdown */}
                             <Select
                               value={category.jobName}
                               onValueChange={(value) =>
                                 updateCategory(operation, index, "jobName", value)
                               }
                             >
                               <SelectTrigger className="flex-1">
                                 <SelectValue placeholder="Select job" />
                               </SelectTrigger>
                               <SelectContent>
                                 {tasks?.map((task) => (
                                   <SelectItem key={task.id} value={task.task_name}>
                                     {task.task_name}
                                   </SelectItem>
                                 ))}
                                 <SelectItem value="Other">Other</SelectItem>
                               </SelectContent>
                             </Select>
                             
                             {/* Category Dropdown */}
                             <Select
                               value={category.name}
                               onValueChange={(value) =>
                                 updateCategory(operation, index, "name", value)
                               }
                             >
                               <SelectTrigger className="flex-1">
                                 <SelectValue placeholder="Select category" />
                               </SelectTrigger>
                               <SelectContent>
                                 {getCategories(operation).map((cat) => (
                                   <SelectItem key={cat} value={cat}>
                                     {cat}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
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
                             <div className="flex gap-2 items-center ml-0">
                               <Input
                                 placeholder="Enter custom job name"
                                 value={category.customJobName || ""}
                                 onChange={(e) =>
                                   updateCategory(operation, index, "customJobName", e.target.value)
                                 }
                                 className="flex-1"
                               />
                               <Button
                                 type="button"
                                 variant="outline"
                                 size="icon"
                                 onClick={() => {
                                   const customJob = category.customJobName?.trim();
                                   if (customJob) {
                                     handleAddTask(customJob);
                                   } else {
                                     toast.error("Please enter a job name");
                                   }
                                 }}
                               >
                                 <Plus className="h-4 w-4" />
                               </Button>
                             </div>
                           )}
                           
                           {/* Custom Category Name Input */}
                           {category.name === "Other" && (
                             <div className="flex gap-2 items-center ml-0">
                               <Input
                                 placeholder="Enter custom category name"
                                 value={category.customName || ""}
                                 onChange={(e) =>
                                   updateCategory(operation, index, "customName", e.target.value)
                                 }
                                 className="flex-1"
                               />
                               <Button
                                 type="button"
                                 variant="outline"
                                 size="icon"
                                 onClick={() => {
                                   const customName = category.customName?.trim();
                                   if (customName) {
                                     const result = addCustomCategory(operation, customName);
                                     if (result.success) {
                                       toast.success(result.message);
                                     } else {
                                       toast.error(result.message);
                                     }
                                   } else {
                                     toast.error("Please enter a category name");
                                   }
                                 }}
                                 title="Add to category list"
                               >
                                 <Check className="h-4 w-4" />
                               </Button>
                             </div>
                           )}
                         </div>
                      ))}
                      
                      <div className="flex gap-2 items-center">
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
