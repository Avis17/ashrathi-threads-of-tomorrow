import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJobStyles } from '@/hooks/useJobStyles';
import StyleCard from './StyleCard';
import StyleForm from './StyleForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StylesManager = () => {
  const navigate = useNavigate();
  const { data: styles, isLoading } = useJobStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<any>(null);

  const filteredStyles = styles?.filter((style) => {
    const matchesSearch = 
      style.style_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.style_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.pattern_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      style.garment_type?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter && style.is_active;
  });

  const handleView = (style: any) => {
    navigate(`/admin/job-management/style/${style.id}`);
  };

  const handleEdit = (style: any) => {
    setEditingStyle(style);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStyle(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="men">Men</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Style
        </Button>
      </div>

      {/* Styles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles?.map((style) => (
            <StyleCard 
              key={style.id} 
              style={style}
              onView={handleView}
              onEdit={handleEdit} 
            />
          ))}
        </div>
      )}

      {filteredStyles?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No styles found</p>
        </div>
      )}

      {/* Style Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <StyleForm 
            style={editingStyle} 
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StylesManager;
