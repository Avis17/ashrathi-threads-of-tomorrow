import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BranchForm, type BranchFormData } from "./branches/BranchForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Branch = {
  id: string;
  building_name: string;
  owner_name: string;
  monthly_rent: number | null;
  building_size: number;
  address: string;
  owner_number: string;
  is_main_building: boolean;
  is_outlet: boolean;
  is_manufacturing_unit: boolean;
  facilities: string[];
  building_type: string;
  electricity_sanctioned: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export const BranchesManager = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("is_main_building", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Branch[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const { error } = await supabase.from("branches").insert({
        building_name: data.building_name,
        owner_name: data.owner_name,
        monthly_rent: parseFloat(data.monthly_rent),
        building_size: parseFloat(data.building_size),
        address: data.address,
        owner_number: data.owner_number,
        is_main_building: data.is_main_building,
        is_outlet: data.is_outlet,
        is_manufacturing_unit: data.is_manufacturing_unit,
        facilities: data.facilities,
        building_type: data.building_type,
        electricity_sanctioned: data.electricity_sanctioned || null,
        notes: data.notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch added successfully");
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BranchFormData }) => {
      const { error } = await supabase
        .from("branches")
        .update({
          building_name: data.building_name,
          owner_name: data.owner_name,
          monthly_rent: parseFloat(data.monthly_rent),
          building_size: parseFloat(data.building_size),
          address: data.address,
          owner_number: data.owner_number,
          is_main_building: data.is_main_building,
          is_outlet: data.is_outlet,
          is_manufacturing_unit: data.is_manufacturing_unit,
          facilities: data.facilities,
          building_type: data.building_type,
          electricity_sanctioned: data.electricity_sanctioned || null,
          notes: data.notes || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch updated successfully");
      setIsEditDialogOpen(false);
      setSelectedBranch(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedBranch(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage your buildings and locations</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>
            View and manage all your business locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading branches...</div>
          ) : branches && branches.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {branch.building_name}
                          {branch.is_main_building && (
                            <Badge variant="default" className="ml-2">Main</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {branch.is_outlet && (
                            <Badge variant="secondary">Outlet</Badge>
                          )}
                          {branch.is_manufacturing_unit && (
                            <Badge variant="outline">Manufacturing</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{branch.building_size} sq ft</TableCell>
                      <TableCell>₹{(branch.monthly_rent || 0).toLocaleString()}/mo</TableCell>
                      <TableCell>{branch.owner_name}</TableCell>
                      <TableCell>
                        <Badge variant={branch.is_active ? "default" : "secondary"}>
                          {branch.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(branch)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(branch)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No branches found. Add your first branch to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>Fill in the details to add a new branch</DialogDescription>
          </DialogHeader>
          <BranchForm
            onSubmit={(data) => addMutation.mutate(data)}
            isLoading={addMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update the branch details</DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <BranchForm
              onSubmit={(data) =>
                updateMutation.mutate({ id: selectedBranch.id, data })
              }
              initialData={{
                building_name: selectedBranch.building_name,
                owner_name: selectedBranch.owner_name,
                monthly_rent: selectedBranch.monthly_rent.toString(),
                building_size: selectedBranch.building_size.toString(),
                address: selectedBranch.address,
                owner_number: selectedBranch.owner_number,
                is_main_building: selectedBranch.is_main_building,
                is_outlet: selectedBranch.is_outlet,
                is_manufacturing_unit: selectedBranch.is_manufacturing_unit,
                facilities: selectedBranch.facilities || [],
                building_type: selectedBranch.building_type,
                electricity_sanctioned: selectedBranch.electricity_sanctioned || "",
                notes: selectedBranch.notes || "",
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Branch Details</DialogTitle>
          </DialogHeader>
          {selectedBranch && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Building Name</Label>
                  <p className="font-semibold">{selectedBranch.building_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Building Type</Label>
                  <p className="font-semibold">{selectedBranch.building_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Owner Name</Label>
                  <p className="font-semibold">{selectedBranch.owner_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Owner Contact</Label>
                  <p className="font-semibold">{selectedBranch.owner_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Monthly Rent</Label>
                  <p className="font-semibold">₹{(selectedBranch.monthly_rent || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Building Size</Label>
                  <p className="font-semibold">{selectedBranch.building_size} sq ft</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Electricity Sanctioned</Label>
                  <p className="font-semibold">{selectedBranch.electricity_sanctioned || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-semibold">{selectedBranch.address}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Configuration</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBranch.is_main_building && (
                    <Badge variant="default">Main Building</Badge>
                  )}
                  {selectedBranch.is_outlet && (
                    <Badge variant="secondary">Outlet</Badge>
                  )}
                  {selectedBranch.is_manufacturing_unit && (
                    <Badge variant="outline">Manufacturing Unit</Badge>
                  )}
                </div>
              </div>

              {selectedBranch.facilities && selectedBranch.facilities.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Facilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBranch.facilities.map((facility) => (
                      <Badge key={facility} variant="outline">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedBranch.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{selectedBranch.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the branch "{selectedBranch?.building_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBranch && deleteMutation.mutate(selectedBranch.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BranchesManager;
