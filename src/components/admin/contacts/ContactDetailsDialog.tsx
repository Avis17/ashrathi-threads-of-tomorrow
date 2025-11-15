import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Calendar, DollarSign, FileText, User } from "lucide-react";

interface ContactDetailsDialogProps {
  contact: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactDetailsDialog = ({ contact, open, onOpenChange }: ContactDetailsDialogProps) => {
  if (!contact) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>General Contact Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Photo and Name */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarImage src={contact.photo || ""} alt={contact.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h2 className="text-2xl font-bold">{contact.name}</h2>
                  <Badge variant="secondary" className="text-sm">
                    {contact.department}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Primary Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Alternative Contact</p>
                    <p className="font-medium">{contact.alternative_contact}</p>
                  </div>
                </div>

                {contact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{contact.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{contact.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Employment Details</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{contact.department}</p>
                  </div>
                </div>

                {contact.date_of_joining && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Date of Joining</p>
                      <p className="font-medium">{formatDate(contact.date_of_joining)}</p>
                    </div>
                  </div>
                )}

                {contact.salary && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{formatCurrency(contact.salary)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {contact.notes && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Info */}
          <div className="text-xs text-muted-foreground text-center">
            Added on {formatDate(contact.created_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
