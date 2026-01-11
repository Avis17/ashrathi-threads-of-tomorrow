import { useState, useMemo } from 'react';
import { 
  MessageCircle, Copy, Check, Plus, Pencil, Trash2, 
  Search, Filter, ExternalLink, Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  useBuyerFollowups, 
  useCreateFollowup, 
  useUpdateFollowup, 
  useDeleteFollowup,
  FOLLOWUP_CATEGORIES,
  BuyerFollowupMessage,
  CreateFollowupData
} from '@/hooks/useBuyerFollowups';

const ITEMS_PER_PAGE = 6;

export default function BuyerFollowups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<BuyerFollowupMessage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateFollowupData>({
    title: '',
    message: '',
    category: 'general',
    is_active: true,
  });

  // Hooks
  const { data: messages = [], isLoading } = useBuyerFollowups({
    category: categoryFilter,
    searchTerm,
  });
  const createMutation = useCreateFollowup();
  const updateMutation = useUpdateFollowup();
  const deleteMutation = useDeleteFollowup();

  // Pagination
  const totalPages = Math.ceil(messages.length / ITEMS_PER_PAGE);
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return messages.slice(start, start + ITEMS_PER_PAGE);
  }, [messages, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Copy to clipboard
  const handleCopy = async (message: BuyerFollowupMessage) => {
    try {
      await navigator.clipboard.writeText(message.message);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Open WhatsApp
  const handleWhatsApp = (message: BuyerFollowupMessage) => {
    const encodedMessage = encodeURIComponent(message.message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  // Form handlers
  const openAddForm = () => {
    setFormData({ title: '', message: '', category: 'general', is_active: true });
    setEditingMessage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (msg: BuyerFollowupMessage) => {
    setFormData({
      title: msg.title,
      message: msg.message,
      category: msg.category,
      is_active: msg.is_active,
    });
    setEditingMessage(msg);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) return;

    if (editingMessage) {
      await updateMutation.mutateAsync({ id: editingMessage.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    return FOLLOWUP_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      introduction: 'bg-blue-100 text-blue-800',
      follow_up: 'bg-purple-100 text-purple-800',
      inquiry: 'bg-amber-100 text-amber-800',
      samples: 'bg-pink-100 text-pink-800',
      negotiation: 'bg-orange-100 text-orange-800',
      catalog: 'bg-cyan-100 text-cyan-800',
      order: 'bg-green-100 text-green-800',
      production: 'bg-indigo-100 text-indigo-800',
      shipping: 'bg-teal-100 text-teal-800',
      payment: 'bg-red-100 text-red-800',
      marketing: 'bg-rose-100 text-rose-800',
      thanks: 'bg-emerald-100 text-emerald-800',
      reengagement: 'bg-violet-100 text-violet-800',
      quality: 'bg-lime-100 text-lime-800',
      custom: 'bg-fuchsia-100 text-fuchsia-800',
      greetings: 'bg-sky-100 text-sky-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold">Buyer Follow-ups</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Ready-to-use WhatsApp message templates for buyer communication
          </p>
        </div>
        <Button onClick={openAddForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Get started by adding your first message template'}
            </p>
            <Button onClick={openAddForm} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedMessages.map((msg) => (
              <Card key={msg.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {msg.title}
                    </CardTitle>
                    <Badge className={`shrink-0 text-xs ${getCategoryColor(msg.category)}`}>
                      {getCategoryLabel(msg.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3 max-h-[150px] overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                      {msg.message}
                    </pre>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleCopy(msg)}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsApp(msg)}
                    >
                      <Send className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                  
                  {/* Edit/Delete buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditForm(msg)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 gap-1 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirmId(msg.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMessage ? 'Edit Message Template' : 'Add New Message Template'}
            </DialogTitle>
            <DialogDescription>
              Create a message template that you can quickly copy or share via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction Message"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter your message template..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.title || !formData.message || createMutation.isPending || updateMutation.isPending}
            >
              {editingMessage ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message template will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
