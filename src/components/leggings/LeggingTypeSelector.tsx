import { LeggingType } from "@/pages/LeggingsSizeChart";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LeggingTypeSelectorProps {
  types: LeggingType[];
  selectedType: LeggingType | null;
  onSelectType: (type: LeggingType) => void;
}

export default function LeggingTypeSelector({
  types,
  selectedType,
  onSelectType,
}: LeggingTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType?.id === type.id;

        return (
          <Card
            key={type.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group overflow-hidden",
              isSelected && "ring-2 ring-primary shadow-xl scale-105"
            )}
            onClick={() => onSelectType(type)}
          >
            <div className={cn("h-2 bg-gradient-to-r", type.color)} />
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
                  type.color,
                  "group-hover:scale-110"
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 leading-tight">
                    {type.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Best For:
                </p>
                <p className="text-sm font-semibold">
                  {type.bestFor}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {type.sizes.length} sizes available
                </span>
                {isSelected && (
                  <span className="text-primary font-semibold animate-fade-in">
                    ✓ Selected
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
