import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  useCreateExternalJobRateCard,
  useUpdateExternalJobRateCard,
  useExternalJobRateCard,
} from "@/hooks/useExternalJobRateCards";
import { OPERATIONS, JOB_ORDER_CATEGORIES } from "@/lib/jobOrderCategories";

type CategoryItem = {
  name: string;
  rate: number;
  customName?: string;
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
  accessories_cost: z.number().min(0).optional(),
  delivery_charge: z.number().min(0).optional(),
  company_profit_type: z.enum(["amount", "percent"]).optional(),
  company_profit_value: z.number().min(0).optional(),
  adjustment: z.number().optional(),
});

type RateCardFormData = z.infer<typeof rateCardSchema>;

const AddRateCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: existingCard } = useExternalJobRateCard(id || "");
  const createRateCard = useCreateExternalJobRateCard();
  const updateRateCard = useUpdateExternalJobRateCard();

  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [operationCategories, setOperationCategories] = useState<Record<string, CategoryItem[]>>({});
  const [generatedStyleId, setGeneratedStyleId] = useState("");

  const form = useForm<RateCardFormData>({
    resolver: zodResolver(rateCardSchema),
    defaultValues: {
      style_name: "",
      custom_style_name: "",
      category: "",
      accessories_cost: 0,
      delivery_charge: 0,
      company_profit_type: "amount",
      company_profit_value: 0,
      adjustment: 0,
    },
  });

  useEffect(() => {
    if (existingCard) {
      form.setValue("style_name", existingCard.style_name);
      form.setValue("category", existingCard.category);
      form.setValue("accessories_cost", existingCard.accessories_cost);
      form.setValue("delivery_charge", existingCard.delivery_charge);
      form.setValue("company_profit_type", existingCard.company_profit_type as "amount" | "percent");
      form.setValue("company_profit_value", existingCard.company_profit_value || 0);
      form.setValue("adjustment", (existingCard as any).adjustment || 0);
      setGeneratedStyleId(existingCard.style_id);

      const operations = existingCard.operations_data as any[];
      const ops: string[] = [];
      const cats: Record<string, CategoryItem[]> = {};

      operations.forEach((op: any) => {
        ops.push(op.operation_name);
        cats[op.operation_name] = op.categories;
      });

      setSelectedOperations(ops);
      setOperationCategories(cats);
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

  const updateCategory = (
    operation: string,
    index: number,
    field: "name" | "rate" | "customName",
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
    }
    setOperationCategories(newCategories);
  };

  const removeCategory = (operation: string, index: number) => {
    const newCategories = { ...operationCategories };
    newCategories[operation].splice(index, 1);
    setOperationCategories(newCategories);
  };

  const calculateTotals = () => {
    const accessories = form.watch("accessories_cost") || 0;
    const delivery = form.watch("delivery_charge") || 0;
    const profitType = form.watch("company_profit_type");
    const profitValue = form.watch("company_profit_value") || 0;
    const adjustment = form.watch("adjustment") || 0;

    const operationBreakdown: Record<
      string,
      { categories: Array<{ name: string; rate: number; percentage: number }>; total: number; commission: number }
    > = {};
    let totalOperationsCost = 0;

    selectedOperations.forEach((op) => {
      const cats = operationCategories[op] || [];

      let opBaseTotal = 0;
      const regularCats: Array<{ name: string; rate: number; percentage: number }> = [];
      let commissionPercentage = 0;

      cats.forEach((cat) => {
        if (cat.name === "Contract Commission") {
          commissionPercentage = cat.rate || 0;
        } else {
          opBaseTotal += cat.rate || 0;
          regularCats.push({ name: cat.name, rate: cat.rate || 0, percentage: cat.rate || 0 });
        }
      });

      const commissionAmount = (opBaseTotal * commissionPercentage) / 100;
      const opTotal = opBaseTotal + commissionAmount;

      operationBreakdown[op] = {
        categories: regularCats,
        total: opTotal,
        commission: commissionAmount,
      };

      totalOperationsCost += opTotal;
    });

    let profitPerPiece = 0;
    if (profitType === "percent") {
      profitPerPiece = (totalOperationsCost * profitValue) / 100;
    } else {
      profitPerPiece = profitValue;
    }

    const ratePerPiece = totalOperationsCost + profitPerPiece + adjustment;

    return { ratePerPiece, operationBreakdown, totalOperationsCost };
  };

  const { ratePerPiece, operationBreakdown, totalOperationsCost } = calculateTotals();

  const onSubmit = async (data: RateCardFormData) => {
    const operations = selectedOperations.map((op) => ({
      operation_name: op,
      categories: (operationCategories[op] || []).map((cat) => ({
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
      company_profit_type: data.company_profit_type,
      company_profit_value: data.company_profit_value || 0,
      adjustment: data.adjustment || 0,
      rate_per_piece: ratePerPiece,
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
                              onValueChange={(value) =>
                                updateCategory(operation, index, "name", value)
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {JOB_ORDER_CATEGORIES[
                                  operation as keyof typeof JOB_ORDER_CATEGORIES
                                ]?.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder={
                                category.name === "Contract Commission"
                                  ? "Commission %"
                                  : "Rate %"
                              }
                              value={category.rate}
                              onChange={(e) =>
                                updateCategory(
                                  operation,
                                  index,
                                  "rate",
                                  parseFloat(e.target.value) || 0
                                )
                              }
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
                              onChange={(e) =>
                                updateCategory(operation, index, "customName", e.target.value)
                              }
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

              <FormField
                control={form.control}
                name="adjustment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjustment (+/-)</FormLabel>
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
                            <span>
                              {cat.name} ({cat.percentage}%)
                            </span>
                            <span>₹{cat.rate.toFixed(2)}</span>
                          </div>
                        ))}
                        {data.commission > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Contract Commission</span>
                            <span>₹{data.commission.toFixed(2)}</span>
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
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Rate per Piece:</span>
                  <span className="font-bold text-primary">₹{ratePerPiece.toFixed(2)}</span>
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
