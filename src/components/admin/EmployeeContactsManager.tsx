import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react";
import { EmployeeContactForm, type EmployeeContactFormData } from "./contacts/EmployeeContactForm";
import { ContactDetailsDialog } from "./contacts/ContactDetailsDialog";
import { DynamicPagination } from "./DynamicPagination";
import { DEPARTMENTS } from "@/lib/departments";

const ITEMS_PER_PAGE = 10;

export const EmployeeContactsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [deletingContact, setDeletingContact] = useState<any>(null);
  const [viewingContact, setViewingContact] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["employee-contacts", searchTerm, departmentFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("employee_contacts")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (departmentFilter && departmentFilter !== "all") {
        query = query.eq("department", departmentFilter);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EmployeeContactFormData) => {
      const insertData: any = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        alternative_contact: data.alternative_contact,
        department: data.department,
        email: data.email || null,
        date_of_joining: data.date_of_joining || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        notes: data.notes || null,
        photo: data.photo || null,
      };
      const { error } = await supabase.from("employee_contacts").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contacts"] });
      toast.success("Employee contact added successfully");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add employee contact");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EmployeeContactFormData }) => {
      const updateData: any = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        alternative_contact: data.alternative_contact,
        department: data.department,
        email: data.email || null,
        date_of_joining: data.date_of_joining || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        notes: data.notes || null,
        photo: data.photo || null,
      };
      const { error } = await supabase
        .from("employee_contacts")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contacts"] });
      toast.success("Employee contact updated successfully");
      setEditingContact(null);
    },
    onError: (error) => {
      toast.error("Failed to update employee contact");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_contacts")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contacts"] });
      toast.success("Employee contact deleted successfully");
      setDeletingContact(null);
    },
    onError: (error) => {
      toast.error("Failed to delete employee contact");
      console.error(error);
    },
  });

  const totalPages = Math.ceil((contacts?.count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">General Contacts</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
            </DialogHeader>
            <EmployeeContactForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={(value) => {
          setDepartmentFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No contacts found
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts?.data.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.department}</TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingContact(contact)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingContact(contact)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={contacts?.count || 0}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              onPageSizeChange={() => {}}
            />
          )}
        </>
      )}

      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee Contact</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <EmployeeContactForm
              onSubmit={(data) => updateMutation.mutate({ id: editingContact.id, data })}
              initialData={editingContact}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the employee contact for {deletingContact?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingContact && deleteMutation.mutate(deletingContact.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ContactDetailsDialog
        contact={viewingContact}
        open={!!viewingContact}
        onOpenChange={() => setViewingContact(null)}
      />
    </div>
  );
};
