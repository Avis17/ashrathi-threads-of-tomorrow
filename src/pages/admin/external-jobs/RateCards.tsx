import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useExternalJobRateCards, useDeleteExternalJobRateCard } from "@/hooks/useExternalJobRateCards";

const RateCards = () => {
  const navigate = useNavigate();
  const { data: rateCards, isLoading } = useExternalJobRateCards();
  const deleteRateCard = useDeleteExternalJobRateCard();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredRateCards = rateCards?.filter(
    (card) =>
      card.style_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.style_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRateCard.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading rate cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Cards</h1>
          <p className="text-muted-foreground mt-1">
            Manage reusable rate card templates for job orders
          </p>
        </div>
        <Button onClick={() => navigate("/admin/external-jobs/add-rate-card")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Rate Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by style name, ID, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRateCards && filteredRateCards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Style ID</TableHead>
                  <TableHead>Style Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Rate/Piece</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRateCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono text-sm">{card.style_id}</TableCell>
                    <TableCell className="font-medium">{card.style_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{card.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{card.rate_per_piece.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={card.is_active ? "default" : "secondary"}>
                        {card.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/external-jobs/edit-rate-card/${card.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No rate cards found matching your search." : "No rate cards created yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the rate card. It won't be deleted permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RateCards;
