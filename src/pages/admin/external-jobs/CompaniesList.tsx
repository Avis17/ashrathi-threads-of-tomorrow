import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Phone, Mail, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExternalJobCompanies } from "@/hooks/useExternalJobOrders";
import { useState } from "react";

const CompaniesList = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useExternalJobCompanies();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/external-jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registered Companies</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all registered job work companies
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/admin/external-jobs/register-company")}
          className="gap-2"
        >
          <Building2 className="h-4 w-4" />
          Register New Company
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search companies by name, contact person, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No companies found matching your search" : "No companies registered yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{company.company_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {company.address.slice(0, 40)}{company.address.length > 40 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{company.contact_person}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {company.contact_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.email ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {company.email}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={company.is_active ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                      {company.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/external-jobs/company/${company.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {filteredCompanies.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
