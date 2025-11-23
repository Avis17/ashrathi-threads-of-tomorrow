import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { useExternalJobCompanies, useCreateExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { format } from "date-fns";
import { OPERATIONS, JOB_ORDER_CATEGORIES } from "@/lib/jobOrderCategories";

type CategoryItem = { 
  name: string; 
  rate: number;
  customName?: string;
};

const jobSchema = z.object({
  company_id: z.string().min(1, "Company is required"),
  style_name: z.string().min(1, "Style name is required"),
  number_of_pieces: z.number().min(1, "Number of pieces must be at least 1"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  accessories_cost: z.number().min(0).optional(),
  delivery_charge: z.number().min(0).optional(),
  company_profit_type: z.enum(["amount", "percent"]).optional(),
  company_profit_value: z.number().min(0).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

const AddJob = () => {
  const navigate = useNavigate();
  const { data: companies } = useExternalJobCompanies();
  const createJob = useCreateExternalJobOrder();

  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [operationCategories, setOperationCategories] = useState<Record<string, CategoryItem[]>>({});

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company_id: "",
      style_name: "",
      number_of_pieces: 0,
      delivery_date: "",
      accessories_cost: 0,
      delivery_charge: 0,
      company_profit_type: "amount",
      company_profit_value: 0,
    },
  });

  const generateJobId = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FFJ-${date}-${random}`;
  };

  const toggleOperation = (operation: string) => {
    if (selectedOperations.includes(operation)) {
      setSelectedOperations(selectedOperations.filter((op) => op !== operation));
      const newCategories = { ...operationCategories };
      delete newCategories[operation];
      setOperationCategories(newCategories);
    } else {
      setSelectedOperations([...selectedOperations, operation]);
      setOperationCategories({
        ...operationCategories,
        [operation]: [],
      });
    }
  };

  const addCategory = (operation: string) => {
    setOperationCategories({
      ...operationCategories,
      [operation]: [
        ...(operationCategories[operation] || []),
        { name: "", rate: 0, customName: "" },
      ],
    });
  };

  const updateCategory = (operation: string, index: number, field: "name" | "rate" | "customName", value: string | number) => {
    const newCategories = { ...operationCategories };
    if (field === "name") {
      newCategories[operation][index].name = value as string;
      // Reset custom name if switching away from "Other"
      if (value !== "Other") {
        newCategories[operation][index].customName = "";
      }
    } else if (field === "rate") {
      newCategories[operation][index].rate = value as number;
    } else if (field === "customName") {
      newCategories[operation][index].customName = value as string;
    }
    setOperationCategories(newCategories);
  };

  const removeCategory = (operation: string, index: number) => {
    const newCategories = { ...operationCategories };
    newCategories[operation].splice(index, 1);
    setOperationCategories(newCategories);
  };

  const calculateTotals = () => {
    const pieces = form.watch("number_of_pieces") || 0;
    const accessories = form.watch("accessories_cost") || 0;
    const delivery = form.watch("delivery_charge") || 0;
    const profitType = form.watch("company_profit_type");
    const profitValue = form.watch("company_profit_value") || 0;

    // Calculate operations with percentage-based categories
    const operationBreakdown: Record<string, { categories: Array<{name: string, rate: number, percentage: number}>, total: number, commission: number }> = {};
    let totalOperationsCost = 0;

    selectedOperations.forEach((op) => {
      const cats = operationCategories[op] || [];
      
      // First sum up all non-commission categories
      let opBaseTotal = 0;
      const regularCats: Array<{name: string, rate: number, percentage: number}> = [];
      let commissionPercentage = 0;
      
      cats.forEach((cat) => {
        if (cat.name === "Contract Commission") {
          commissionPercentage = cat.rate || 0;
        } else {
          opBaseTotal += (cat.rate || 0);
          regularCats.push({ name: cat.name, rate: cat.rate || 0, percentage: cat.rate || 0 });
        }
      });
      
      // Calculate commission as percentage of base total
      const commissionAmount = (opBaseTotal * commissionPercentage) / 100;
      const opTotal = opBaseTotal + commissionAmount;
      
      operationBreakdown[op] = {
        categories: regularCats,
        total: opTotal,
        commission: commissionAmount
      };
      
      totalOperationsCost += opTotal;
    });

    // Calculate profit per piece
    let profitPerPiece = 0;
    if (profitType === "percent") {
      profitPerPiece = (totalOperationsCost * profitValue) / 100;
    } else {
      profitPerPiece = profitValue;
    }

    const ratePerPiece = totalOperationsCost + profitPerPiece;
    const subtotal = ratePerPiece * pieces;
    const total = subtotal + accessories + delivery;

    return { ratePerPiece, total, operationBreakdown, totalOperationsCost };
  };

  const { ratePerPiece, total, operationBreakdown, totalOperationsCost } = calculateTotals();

  const onSubmit = async (data: JobFormData) => {
    const operations = selectedOperations.map((op) => ({
      operation_name: op,
      categories: (operationCategories[op] || []).map((cat) => ({
        category_name: cat.name === "Other" && cat.customName ? cat.customName : cat.name,
        rate: cat.rate,
      })),
    }));

    await createJob.mutateAsync({
      jobOrder: {
        job_id: generateJobId(),
        company_id: data.company_id,
        style_name: data.style_name,
        number_of_pieces: data.number_of_pieces,
        delivery_date: data.delivery_date,
        accessories_cost: data.accessories_cost || 0,
        delivery_charge: data.delivery_charge || 0,
        company_profit_type: data.company_profit_type,
        company_profit_value: data.company_profit_value || 0,
        rate_per_piece: ratePerPiece,
        total_amount: total,
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
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Operations & Categories</h3>
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
                    <div className="ml-6 space-y-2">
                      {operationCategories[operation]?.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex gap-2">
                            <Select
                              value={category.name}
                              onValueChange={(value) => updateCategory(operation, index, "name", value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {JOB_ORDER_CATEGORIES[operation as keyof typeof JOB_ORDER_CATEGORIES]?.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder={category.name === "Contract Commission" ? "Commission %" : "Rate %"}
                              value={category.rate}
                              onChange={(e) => updateCategory(operation, index, "rate", parseFloat(e.target.value) || 0)}
                              className="w-32"
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
                          {category.name === "Other" && (
                            <Input
                              placeholder="Enter custom category name"
                              value={category.customName || ""}
                              onChange={(e) => updateCategory(operation, index, "customName", e.target.value)}
                              className="ml-0"
                            />
                          )}
                        </div>
                      ))}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessories_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessories Cost</FormLabel>
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
                    <FormLabel>Delivery Charge</FormLabel>
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
                name="company_profit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Profit Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="amount">Amount (₹)</SelectItem>
                        <SelectItem value="percent">Percent (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_profit_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Profit Value</FormLabel>
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
              {/* Operations Breakdown */}
              {Object.entries(operationBreakdown).map(([op, breakdown]) => (
                <div key={op} className="bg-white/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-primary">{op}</h4>
                  {breakdown.categories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4">
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-medium">{cat.percentage}% = ₹{cat.rate.toFixed(2)}</span>
                    </div>
                  ))}
                  {breakdown.commission > 0 && (
                    <div className="flex justify-between text-sm ml-4 text-orange-600">
                      <span className="font-medium">Contract Commission</span>
                      <span className="font-semibold">₹{breakdown.commission.toFixed(2)}</span>
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
                <span>Operations Total (per piece):</span>
                <span className="text-primary">₹{totalOperationsCost.toFixed(2)}</span>
              </div>

              {/* Company Profit */}
              {form.watch("company_profit_value") > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Company Profit ({form.watch("company_profit_type") === "percent" ? `${form.watch("company_profit_value")}%` : "Fixed"}):</span>
                  <span className="font-medium">₹{(ratePerPiece - totalOperationsCost).toFixed(2)}</span>
                </div>
              )}

              {/* Rate Per Piece */}
              <div className="flex justify-between text-lg font-bold bg-primary/10 p-3 rounded-lg">
                <span>Rate per Piece:</span>
                <span className="text-primary">₹{ratePerPiece.toFixed(2)}</span>
              </div>

              {/* Quantity & Subtotal */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Number of Pieces:</span>
                  <span className="font-medium">{form.watch("number_of_pieces") || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{(ratePerPiece * (form.watch("number_of_pieces") || 0)).toFixed(2)}</span>
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