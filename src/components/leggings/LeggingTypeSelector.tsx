import { LeggingType } from "@/pages/LeggingsSizeChart";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";

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
          <div
            key={type.id}
            className={cn(
              "group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-500",
              "bg-card border hover:shadow-xl",
              isSelected 
                ? "border-accent shadow-lg shadow-accent/10 scale-[1.02]" 
                : "border-border hover:border-accent/50"
            )}
            onClick={() => onSelectType(type)}
          >
            {/* Gradient accent bar */}
            <div className={cn(
              "h-1 w-full bg-gradient-to-r transition-all duration-300",
              type.color,
              isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-100"
            )} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
                  type.color,
                  "shadow-lg",
                  isSelected ? "scale-110" : "group-hover:scale-105"
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                {isSelected && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-xs font-semibold rounded-full animate-fade-in">
                    <Check className="w-3 h-3" />
                    Selected
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className={cn(
                "font-serif text-xl mb-2 transition-colors duration-300 leading-tight",
                isSelected ? "text-accent" : "text-foreground group-hover:text-accent"
              )}>
                {type.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {type.description}
              </p>

              {/* Best For Tag */}
              <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                  Best For
                </p>
                <p className="text-sm font-medium text-foreground">
                  {type.bestFor}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {type.sizes.length} sizes available
                </span>
                <span className={cn(
                  "inline-flex items-center text-sm font-medium transition-all duration-300",
                  isSelected ? "text-accent" : "text-muted-foreground group-hover:text-accent"
                )}>
                  View Chart
                  <ArrowRight className={cn(
                    "ml-1 w-4 h-4 transition-transform duration-300",
                    isSelected ? "translate-x-1" : "group-hover:translate-x-1"
                  )} />
                </span>
              </div>
            </div>

            {/* Hover gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none",
              "group-hover:opacity-100",
              isSelected && "opacity-100"
            )} />
          </div>
        );
      })}
    </div>
  );
}
