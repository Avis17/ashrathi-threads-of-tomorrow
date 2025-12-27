import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExternalJobCompanies, useCreateExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { format } from "date-fns";

const PRODUCTION_CATEGORIES = [
  "Cutting",
  "Stitching(Singer)",
  "Stitching(Powertable)",
  "Checking",
  "Ironing",
  "Packing",
] as const;

type ProductItem = {
  id: string;
  productName: string;
  rate: number;
  quantity: number;
};

type ProductionCost = {
  category: string;
  cost: number;
  commission: number;
};

interface CustomJobFormProps {
  onBack: () => void;
}

export const CustomJobForm = ({ onBack }: CustomJobFormProps) => {
  const navigate = useNavigate();
  const { data: companies } = useExternalJobCompanies();
  const createJob = useCreateExternalJobOrder();

  // Basic details state
  const [companyId, setCompanyId] = useState("");
  const [orderDate, setOrderDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  // Products table state
  const [products, setProducts] = useState<ProductItem[]>([
    { id: crypto.randomUUID(), productName: "", rate: 0, quantity: 1 }
  ]);

  // Production costs state
  const [productionCosts, setProductionCosts] = useState<ProductionCost[]>(
    PRODUCTION_CATEGORIES.map(cat => ({ category: cat, cost: 0, commission: 0 }))
  );

  const generateJobId = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FFJ-${date}-${random}`;
  };

  // Product handlers
  const addProduct = () => {
    setProducts([...products, { id: crypto.randomUUID(), productName: "", rate: 0, quantity: 1 }]);
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string | number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Production cost handlers
  const updateProductionCost = (category: string, field: 'cost' | 'commission', value: number) => {
    setProductionCosts(productionCosts.map(pc => 
      pc.category === category ? { ...pc, [field]: value } : pc
    ));
  };

  // Calculations
  const calculateProductsTotal = () => {
    return products.reduce((sum, p) => sum + (p.rate * p.quantity), 0);
  };

  const calculateTotalQuantity = () => {
    return products.reduce((sum, p) => sum + p.quantity, 0);
  };

  const calculateOperationsCost = () => {
    return productionCosts.reduce((sum, pc) => {
      const costWithCommission = pc.cost + (pc.cost * pc.commission / 100);
      return sum + costWithCommission;
    }, 0);
  };

  const calculateCompanyProfit = () => {
    const productTotal = calculateProductsTotal();
    const operationsCost = calculateOperationsCost();
    const totalQuantity = calculateTotalQuantity();
    // Multiply operations cost by total quantity to get total operations cost
    return productTotal - (operationsCost * totalQuantity);
  };

  const handleSubmit = async () => {
    // Validation
    if (!companyId) {
      toast.error("Please select a company");
      return;
    }
    if (!deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }
    if (products.every(p => !p.productName.trim())) {
      toast.error("Please add at least one product");
      return;
    }

    const totalQuantity = calculateTotalQuantity();
    const productsTotal = calculateProductsTotal();
    const operationsCost = calculateOperationsCost();
    const companyProfit = calculateCompanyProfit();
    const ratePerPiece = totalQuantity > 0 ? productsTotal / totalQuantity : 0;
    
    // Create combined style name from all products
    const styleName = products
      .filter(p => p.productName.trim())
      .map(p => `${p.productName} (${p.quantity}pcs @ ₹${p.rate})`)
      .join(" + ");

    // Create operations from production costs
    const operations = productionCosts
      .filter(pc => pc.cost > 0)
      .map(pc => ({
        operation_name: pc.category,
        commission_percent: pc.commission,
        round_off: null,
        adjustment: 0,
        categories: [{
          category_name: "Custom Job Rate",
          rate: pc.cost,
          job_name: "Custom Entry"
        }]
      }));

    // Prepare custom products data for storage
    const customProductsData = products
      .filter(p => p.productName.trim())
      .map(p => ({
        name: p.productName,
        rate: p.rate,
        quantity: p.quantity,
        total: p.rate * p.quantity
      }));

    try {
      await createJob.mutateAsync({
        jobOrder: {
          job_id: generateJobId(),
          company_id: companyId,
          style_name: "Custom",
          number_of_pieces: totalQuantity,
          order_date: orderDate,
          delivery_date: deliveryDate,
          accessories_cost: 0,
          delivery_charge: 0,
          company_profit_type: "amount",
          company_profit_value: totalQuantity > 0 ? companyProfit / totalQuantity : 0,
          rate_per_piece: ratePerPiece,
          total_amount: productsTotal,
          notes: notes || null,
          is_custom_job: true,
          custom_products_data: customProductsData,
        },
        operations,
      });

      navigate("/admin/external-jobs");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const productsTotal = calculateProductsTotal();
  const totalQuantity = calculateTotalQuantity();
  const operationsCost = calculateOperationsCost();
  const totalOperationsCost = operationsCost * totalQuantity;
  const companyProfit = calculateCompanyProfit();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Basic Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company *</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Order Date *</Label>
            <Input 
              type="date" 
              value={orderDate} 
              onChange={(e) => setOrderDate(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Delivery Date *</Label>
            <Input 
              type="date" 
              value={deliveryDate} 
              onChange={(e) => setDeliveryDate(e.target.value)} 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Product Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Product Details</h3>
          <Button type="button" variant="outline" size="sm" onClick={addProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Product Name</TableHead>
              <TableHead className="w-[20%]">Rate (₹)</TableHead>
              <TableHead className="w-[20%]">Quantity</TableHead>
              <TableHead className="w-[15%] text-right">Total (₹)</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Input
                    placeholder="Enter product name"
                    value={product.productName}
                    onChange={(e) => updateProduct(product.id, 'productName', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.rate}
                    onChange={(e) => updateProduct(product.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{(product.rate * product.quantity).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(product.id)}
                    disabled={products.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-medium">
              <TableCell>Total</TableCell>
              <TableCell></TableCell>
              <TableCell>{totalQuantity} pcs</TableCell>
              <TableCell className="text-right">₹{productsTotal.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Production Costs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Production Costs (Per Piece)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the cost per piece for each production category. These will be multiplied by total quantity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productionCosts.map((pc) => (
            <div key={pc.category} className="border rounded-lg p-4 space-y-3">
              <Label className="font-medium">{pc.category}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Cost (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pc.cost}
                    onChange={(e) => updateProductionCost(pc.category, 'cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Commission (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={pc.commission}
                    onChange={(e) => updateProductionCost(pc.category, 'commission', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              {pc.cost > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total: ₹{(pc.cost + (pc.cost * pc.commission / 100)).toFixed(2)}/pc
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Cost Summary */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Products Total</span>
              <span className="font-medium">₹{productsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="font-medium">{totalQuantity} pieces</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operations Cost/Piece</span>
              <span className="font-medium">₹{operationsCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Operations Cost</span>
              <span className="font-medium">₹{totalOperationsCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border-t pt-3 md:border-t-0 md:pt-0">
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="font-semibold">Company Profit</span>
                <span className={`text-xl font-bold ${companyProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  ₹{companyProfit.toFixed(2)}
                </span>
              </div>
              {totalQuantity > 0 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  ₹{(companyProfit / totalQuantity).toFixed(2)} per piece
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createJob.isPending}
        >
          {createJob.isPending ? "Creating..." : "Create Custom Job Order"}
        </Button>
      </div>
    </div>
  );
};
