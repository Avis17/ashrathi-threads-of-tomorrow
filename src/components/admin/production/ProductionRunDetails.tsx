import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProductionRunDetails, useAddProductionRunMaterial, useAddProductionRunCost, useUpdateProductionRun } from "@/hooks/useProductionRuns";
import { usePurchaseBatches } from "@/hooks/usePurchaseBatches";
import { format } from "date-fns";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const COST_STAGES = ['cutting', 'stitching', 'inspection', 'packing', 'transport', 'misc'];
const COST_CATEGORIES = ['material', 'labor', 'overhead'];

export const ProductionRunDetails = ({ runId, onClose }: { runId: string; onClose: () => void }) => {
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [actualQuantity, setActualQuantity] = useState("");
  
  const { data, isLoading } = useProductionRunDetails(runId);
  const { data: purchaseBatches } = usePurchaseBatches();
  const addMaterialMutation = useAddProductionRunMaterial();
  const addCostMutation = useAddProductionRunCost();
  const updateRunMutation = useUpdateProductionRun();

  const [materialForm, setMaterialForm] = useState({
    purchase_batch_item_id: "",
    quantity_used_kg: 0,
    wastage_kg: 0,
    cost_at_time: 0,
  });

  const [costForm, setCostForm] = useState({
    cost_stage: "cutting",
    cost_category: "labor",
    amount: 0,
    description: "",
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  const { run, materials, costs } = data;

  const handleAddMaterial = async () => {
    await addMaterialMutation.mutateAsync({
      production_run_id: runId,
      ...materialForm,
    });
    setMaterialForm({
      purchase_batch_item_id: "",
      quantity_used_kg: 0,
      wastage_kg: 0,
      cost_at_time: 0,
    });
    setShowMaterialForm(false);
  };

  const handleAddCost = async () => {
    await addCostMutation.mutateAsync({
      production_run_id: runId,
      ...costForm,
    });
    setCostForm({
      cost_stage: "cutting",
      cost_category: "labor",
      amount: 0,
      description: "",
    });
    setShowCostForm(false);
  };

  const handleUpdateActual = async () => {
    if (actualQuantity) {
      await updateRunMutation.mutateAsync({
        id: runId,
        updates: { actual_quantity: parseInt(actualQuantity) },
      });
      setActualQuantity("");
    }
  };

  const costBreakdownData = [
    { name: 'Material', value: run.total_material_cost },
    { name: 'Labor', value: run.total_labor_cost },
    { name: 'Overhead', value: run.total_overhead_cost },
  ].filter(item => item.value > 0);

  const stageCostData = COST_STAGES.map(stage => ({
    stage: stage.charAt(0).toUpperCase() + stage.slice(1),
    amount: costs.filter(c => c.cost_stage === stage).reduce((sum, c) => sum + c.amount, 0),
  })).filter(item => item.amount > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{run.run_code}</h2>
          <p className="text-muted-foreground">
            {run.products?.name} ({run.products?.product_code})
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={run.status === "completed" ? "default" : run.status === "in_progress" ? "secondary" : "outline"}>
            {run.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Target Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{run.target_quantity}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actual Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{run.actual_quantity}</p>
              {run.status !== "completed" && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Update actual"
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                  />
                  <Button size="sm" onClick={handleUpdateActual}>Set</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">₹{run.total_cost.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost per Piece</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{run.cost_per_piece.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {costBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No cost data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage-wise Costs</CardTitle>
          </CardHeader>
          <CardContent>
            {stageCostData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No stage costs yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Materials Used</CardTitle>
            <Button size="sm" onClick={() => setShowMaterialForm(!showMaterialForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showMaterialForm && (
            <div className="border p-4 rounded-lg space-y-4">
              <h4 className="font-semibold">Add Material Usage</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Material Color from Purchase Batch</label>
                  <Select
                    value={materialForm.purchase_batch_item_id}
                    onValueChange={(value) => setMaterialForm({ ...materialForm, purchase_batch_item_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseBatches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_code} - Remaining stock
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity Used (kg)</label>
                  <Input
                    type="number"
                    value={materialForm.quantity_used_kg || ""}
                    onChange={(e) => setMaterialForm({ ...materialForm, quantity_used_kg: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Wastage (kg)</label>
                  <Input
                    type="number"
                    value={materialForm.wastage_kg || ""}
                    onChange={(e) => setMaterialForm({ ...materialForm, wastage_kg: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cost at Time (₹/kg)</label>
                  <Input
                    type="number"
                    value={materialForm.cost_at_time || ""}
                    onChange={(e) => setMaterialForm({ ...materialForm, cost_at_time: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMaterial}>Add Material</Button>
                <Button variant="outline" onClick={() => setShowMaterialForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Purchase Batch</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Wastage (kg)</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.purchase_batch_items?.raw_materials?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{material.purchase_batch_items?.color}</Badge>
                  </TableCell>
                  <TableCell>{material.purchase_batch_items?.purchase_batches?.batch_code}</TableCell>
                  <TableCell>{material.quantity_used_kg} kg</TableCell>
                  <TableCell>{material.wastage_kg} kg</TableCell>
                  <TableCell>₹{(material.quantity_used_kg * material.cost_at_time).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Costs</CardTitle>
            <Button size="sm" onClick={() => setShowCostForm(!showCostForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Cost
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCostForm && (
            <div className="border p-4 rounded-lg space-y-4">
              <h4 className="font-semibold">Record Production Cost</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stage</label>
                  <Select
                    value={costForm.cost_stage}
                    onValueChange={(value) => setCostForm({ ...costForm, cost_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage.charAt(0).toUpperCase() + stage.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={costForm.cost_category}
                    onValueChange={(value) => setCostForm({ ...costForm, cost_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input
                    type="number"
                    value={costForm.amount || ""}
                    onChange={(e) => setCostForm({ ...costForm, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={costForm.description}
                    onChange={(e) => setCostForm({ ...costForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCost}>Add Cost</Button>
                <Button variant="outline" onClick={() => setShowCostForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>{format(new Date(cost.recorded_at), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <Badge>{cost.cost_stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cost.cost_category}</Badge>
                  </TableCell>
                  <TableCell>₹{cost.amount.toFixed(2)}</TableCell>
                  <TableCell>{cost.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {run.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{run.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
