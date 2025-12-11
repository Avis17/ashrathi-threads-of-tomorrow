import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { MaterialForm } from "./MaterialForm";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const MaterialsManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: materials, isLoading } = useMaterials();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Materials Management</h2>
          <p className="text-muted-foreground">
            Manage all raw materials and their costs
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Material
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Unit</th>
                <th className="text-right p-2">Cost/Unit</th>
                <th className="text-right p-2">Available Stock</th>
                <th className="text-right p-2">Reorder Level</th>
                <th className="text-center p-2">Status</th>
                <th className="text-center p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials?.map((material) => (
                <tr key={material.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{material.name}</div>
                      {material.description && (
                        <div className="text-sm text-muted-foreground">
                          {material.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2">{material.unit}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(material.current_cost_per_unit)}
                  </td>
                  <td className="p-2 text-right">{material.available_stock}</td>
                  <td className="p-2 text-right">{material.reorder_level}</td>
                  <td className="p-2 text-center">
                    {material.is_active ? (
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-400 text-white">Inactive</Badge>
                    )}
                    {material.available_stock <= material.reorder_level && (
                      <Badge className="bg-red-500 text-white ml-2">
                        Low Stock
                      </Badge>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(material.id);
                        setIsFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <MaterialForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingId(null);
        }}
        editingId={editingId}
      />
    </div>
  );
};
