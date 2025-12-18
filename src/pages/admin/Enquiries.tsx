import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Search, 
  MessageSquare, 
  Package, 
  Briefcase, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Filter
} from "lucide-react";

type EnquiryStatus = "pending" | "contacted" | "resolved" | "rejected";

interface BulkOrderRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  product_interest: string;
  quantity: number;
  requirements: string | null;
  status: string | null;
  created_at: string | null;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string | null;
  admin_notes: string | null;
  created_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500 text-white",
  contacted: "bg-blue-500 text-white",
  resolved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  contacted: <Mail className="h-3 w-3" />,
  resolved: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
};

const Enquiries = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<BulkOrderRequest | ContactInquiry | null>(null);
  const [enquiryType, setEnquiryType] = useState<"bulk" | "contact" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch bulk order requests
  const { data: bulkOrders = [], isLoading: loadingBulk, refetch: refetchBulk } = useQuery({
    queryKey: ["bulk-order-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_order_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BulkOrderRequest[];
    },
  });

  // Fetch contact inquiries
  const { data: contactInquiries = [], isLoading: loadingContact, refetch: refetchContact } = useQuery({
    queryKey: ["contact-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactInquiry[];
    },
  });

  // Update bulk order status
  const updateBulkStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bulk_order_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-order-requests"] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Update contact inquiry status
  const updateContactStatus = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ status, admin_notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-inquiries"] });
      toast.success("Enquiry updated successfully");
      setSelectedEnquiry(null);
    },
    onError: () => {
      toast.error("Failed to update enquiry");
    },
  });

  const handleRefresh = () => {
    refetchBulk();
    refetchContact();
    toast.success("Data refreshed");
  };

  const filterEnquiries = <T extends { name: string; email: string; status?: string | null }>(
    items: T[]
  ): T[] => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredBulkOrders = filterEnquiries(bulkOrders);
  const filteredContactInquiries = filterEnquiries(contactInquiries);

  // Separate B2B from regular bulk orders
  const b2bEnquiries = filteredBulkOrders.filter(order => 
    order.product_interest?.includes(" - ") && order.product_interest?.includes(",")
  );
  const regularBulkOrders = filteredBulkOrders.filter(order => 
    !order.product_interest?.includes(" - ") || !order.product_interest?.includes(",")
  );

  const pendingCount = bulkOrders.filter(o => o.status === "pending" || !o.status).length + 
                       contactInquiries.filter(c => c.status === "pending" || !c.status).length;

  const openEnquiryDetails = (enquiry: BulkOrderRequest | ContactInquiry, type: "bulk" | "contact") => {
    setSelectedEnquiry(enquiry);
    setEnquiryType(type);
    setNewStatus(enquiry.status || "pending");
    if (type === "contact") {
      setAdminNotes((enquiry as ContactInquiry).admin_notes || "");
    }
  };

  const handleUpdateEnquiry = () => {
    if (!selectedEnquiry) return;
    
    if (enquiryType === "bulk") {
      updateBulkStatus.mutate({ id: selectedEnquiry.id, status: newStatus });
      setSelectedEnquiry(null);
    } else {
      updateContactStatus.mutate({ 
        id: selectedEnquiry.id, 
        status: newStatus, 
        admin_notes: adminNotes 
      });
    }
  };

  const renderEnquiryCard = (
    enquiry: BulkOrderRequest | ContactInquiry, 
    type: "bulk" | "contact",
    icon: React.ReactNode
  ) => {
    const isBulk = type === "bulk";
    const bulkEnquiry = isBulk ? (enquiry as BulkOrderRequest) : null;
    const contactEnquiry = !isBulk ? (enquiry as ContactInquiry) : null;
    const status = enquiry.status || "pending";

    return (
      <Card 
        key={enquiry.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => openEnquiryDetails(enquiry, type)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{enquiry.name}</h3>
                  <Badge className={`${statusColors[status]} text-xs flex items-center gap-1`}>
                    {statusIcons[status]}
                    {status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{enquiry.email}</p>
                {enquiry.phone && (
                  <p className="text-sm text-muted-foreground">{enquiry.phone}</p>
                )}
                {bulkEnquiry?.company_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3" />
                    {bulkEnquiry.company_name}
                  </p>
                )}
                {bulkEnquiry && (
                  <p className="text-sm mt-2 line-clamp-1">
                    <span className="font-medium">Interest:</span> {bulkEnquiry.product_interest}
                    <span className="mx-2">•</span>
                    <span className="font-medium">Qty:</span> {bulkEnquiry.quantity}
                  </p>
                )}
                {contactEnquiry && (
                  <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                    {contactEnquiry.message}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {enquiry.created_at ? format(new Date(enquiry.created_at), "dd MMM yyyy") : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                {enquiry.created_at ? format(new Date(enquiry.created_at), "hh:mm a") : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isLoading = loadingBulk || loadingContact;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Enquiries Management</h1>
          <p className="text-muted-foreground">
            Manage B2B, bulk order, and contact enquiries
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 text-white px-3 py-1">
              {pendingCount} Pending
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">B2B Enquiries</p>
              <p className="text-2xl font-bold">{b2bEnquiries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bulk Orders</p>
              <p className="text-2xl font-bold">{regularBulkOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Messages</p>
              <p className="text-2xl font-bold">{contactInquiries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({bulkOrders.length + contactInquiries.length})</TabsTrigger>
          <TabsTrigger value="b2b">B2B ({b2bEnquiries.length})</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Orders ({regularBulkOrders.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact ({contactInquiries.length})</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-3">
              {filteredBulkOrders.length === 0 && filteredContactInquiries.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No enquiries found
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredBulkOrders.map((order) => 
                    renderEnquiryCard(
                      order, 
                      "bulk",
                      order.product_interest?.includes(" - ") 
                        ? <Briefcase className="h-5 w-5 text-blue-500" />
                        : <Package className="h-5 w-5 text-green-500" />
                    )
                  )}
                  {filteredContactInquiries.map((inquiry) => 
                    renderEnquiryCard(inquiry, "contact", <MessageSquare className="h-5 w-5 text-purple-500" />)
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="b2b" className="space-y-3">
              {b2bEnquiries.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No B2B enquiries found
                  </CardContent>
                </Card>
              ) : (
                b2bEnquiries.map((order) => 
                  renderEnquiryCard(order, "bulk", <Briefcase className="h-5 w-5 text-blue-500" />)
                )
              )}
            </TabsContent>

            <TabsContent value="bulk" className="space-y-3">
              {regularBulkOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No bulk order requests found
                  </CardContent>
                </Card>
              ) : (
                regularBulkOrders.map((order) => 
                  renderEnquiryCard(order, "bulk", <Package className="h-5 w-5 text-green-500" />)
                )
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-3">
              {filteredContactInquiries.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No contact messages found
                  </CardContent>
                </Card>
              ) : (
                filteredContactInquiries.map((inquiry) => 
                  renderEnquiryCard(inquiry, "contact", <MessageSquare className="h-5 w-5 text-purple-500" />)
                )
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {enquiryType === "bulk" ? (
                (selectedEnquiry as BulkOrderRequest)?.product_interest?.includes(" - ") ? (
                  <>
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    B2B Enquiry Details
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 text-green-500" />
                    Bulk Order Details
                  </>
                )
              ) : (
                <>
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Contact Message Details
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {selectedEnquiry.created_at 
                      ? format(new Date(selectedEnquiry.created_at), "dd MMM yyyy, hh:mm a")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-500 hover:underline block">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  {selectedEnquiry.phone ? (
                    <a href={`tel:${selectedEnquiry.phone}`} className="text-blue-500 hover:underline block">
                      {selectedEnquiry.phone}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>

              {enquiryType === "bulk" && (selectedEnquiry as BulkOrderRequest).company_name && (
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="font-medium">{(selectedEnquiry as BulkOrderRequest).company_name}</p>
                </div>
              )}

              {enquiryType === "bulk" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Product Interest</Label>
                      <p className="font-medium">{(selectedEnquiry as BulkOrderRequest).product_interest}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <p className="font-medium">{(selectedEnquiry as BulkOrderRequest).quantity} pcs</p>
                    </div>
                  </div>
                  {(selectedEnquiry as BulkOrderRequest).requirements && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Requirements</Label>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1">
                        {(selectedEnquiry as BulkOrderRequest).requirements}
                      </p>
                    </div>
                  )}
                </>
              )}

              {enquiryType === "contact" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <p className="text-sm bg-muted p-3 rounded-md mt-1 whitespace-pre-wrap">
                    {(selectedEnquiry as ContactInquiry).message}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {enquiryType === "contact" && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleUpdateEnquiry} className="flex-1">
                    Update Enquiry
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiries;