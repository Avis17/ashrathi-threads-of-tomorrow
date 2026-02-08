import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFit, setFilterFit] = useState('all');
  const [filterSetItem, setFilterSetItem] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<any>(null);

  // Extract unique categories and fits from styles
  const uniqueCategories = [...new Set(styles?.map(s => s.category).filter(Boolean))] as string[];
  const uniqueFits = [...new Set(styles?.map(s => s.fit).filter(Boolean))] as string[];

  const filteredStyles = styles?.filter((style) => {
    const matchesSearch = 
      style.style_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.style_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.pattern_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' ||
      style.garment_type?.toLowerCase() === filterType.toLowerCase();
    
    const matchesCategory =
      filterCategory === 'all' ||
      style.category === filterCategory;
    
    const matchesFit =
      filterFit === 'all' ||
      style.fit === filterFit;
    
    const processRateDetails = style.process_rate_details as any;
    const isSetItem = processRateDetails?.is_set_item || false;
    const matchesSetItem =
      filterSetItem === 'all' ||
      (filterSetItem === 'set' && isSetItem) ||
      (filterSetItem === 'single' && !isSetItem);
    
    return matchesSearch && matchesType && matchesCategory && matchesFit && matchesSetItem && style.is_active;
  });

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || filterFit !== 'all' || filterSetItem !== 'all';
  
  const clearAllFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterFit('all');
    setFilterSetItem('all');
  };

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Style
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="men">Men</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterFit} onValueChange={setFilterFit}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Fit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fits</SelectItem>
              {uniqueFits.map(fit => (
                <SelectItem key={fit} value={fit}>{fit}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSetItem} onValueChange={setFilterSetItem}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Set/Single" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="set">Set Items</SelectItem>
              <SelectItem value="single">Single Items</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 px-2">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filterType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Type: {filterType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType('all')} />
              </Badge>
            )}
            {filterCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Category: {filterCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCategory('all')} />
              </Badge>
            )}
            {filterFit !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Fit: {filterFit}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterFit('all')} />
              </Badge>
            )}
            {filterSetItem !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {filterSetItem === 'set' ? 'Set Items' : 'Single Items'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterSetItem('all')} />
              </Badge>
            )}
          </div>
        )}
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
