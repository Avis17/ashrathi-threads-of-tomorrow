import { Shirt, Edit, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JobStyle } from '@/hooks/useJobStyles';

interface StyleCardProps {
  style: JobStyle;
  onEdit: (style: JobStyle) => void;
}

const StyleCard = ({ style, onEdit }: StyleCardProps) => {
  const totalRate = 
    style.rate_cutting +
    style.rate_stitching_singer +
    style.rate_stitching_power_table +
    style.rate_ironing +
    style.rate_checking +
    style.rate_packing;

  return (
    <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-primary overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {style.style_image_url ? (
          <img 
            src={style.style_image_url} 
            alt={style.style_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {style.garment_type && (
            <Badge className="bg-primary/90 backdrop-blur-sm">
              {style.garment_type}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg text-foreground line-clamp-1">
              {style.style_name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono bg-muted px-2 py-0.5 rounded">
              {style.style_code}
            </span>
            <span>•</span>
            <span>Pattern: {style.pattern_number}</span>
          </div>
        </div>

        {style.category && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {style.category}
            </Badge>
            {style.fabric_type && (
              <Badge variant="outline" className="text-xs">
                {style.fabric_type}
              </Badge>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Rate:</span>
            <span className="font-bold text-lg text-primary">
              ₹{totalRate.toFixed(2)}/pc
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(style)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            onClick={() => onEdit(style)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCard;
