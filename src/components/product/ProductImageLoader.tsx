import { Sparkles } from "lucide-react";

export const ProductImageLoader = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-muted/95 backdrop-blur-sm flex items-center justify-center z-10">
      {/* Animated clothing icon */}
      <div className="relative">
        {/* Main clothing hanger animation */}
        <div className="flex flex-col items-center space-y-4">
          {/* Hanger hook */}
          <div className="w-1 h-6 bg-gradient-to-b from-primary/80 to-primary rounded-full animate-pulse" />
          
          {/* Hanger bar */}
          <div className="relative">
            <div className="w-24 h-2 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full" />
            
            {/* T-shirt */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-[swing_1.5s_ease-in-out_infinite]">
              {/* T-shirt body */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                {/* Main body */}
                <path
                  d="M20 25 L15 35 L15 75 L65 75 L65 35 L60 25 L55 30 L50 25 L40 25 L30 25 L25 30 L20 25Z"
                  fill="url(#shimmer)"
                  className="animate-pulse"
                />
                {/* Sleeves */}
                <path
                  d="M15 35 L5 40 L5 50 L15 48 Z"
                  fill="url(#shimmer)"
                  opacity="0.9"
                />
                <path
                  d="M65 35 L75 40 L75 50 L65 48 Z"
                  fill="url(#shimmer)"
                  opacity="0.9"
                />
                
                <defs>
                  <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
                      <animate
                        attributeName="stop-opacity"
                        values="0.8;1;0.8"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1">
                      <animate
                        attributeName="stop-opacity"
                        values="1;0.6;1"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
                      <animate
                        attributeName="stop-opacity"
                        values="0.8;1;0.8"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Sparkles animation */}
        <div className="absolute -top-2 -right-2 animate-[spin_3s_linear_infinite]">
          <Sparkles className="w-5 h-5 text-primary/60" />
        </div>
        <div className="absolute -bottom-2 -left-2 animate-[spin_4s_linear_infinite_reverse]">
          <Sparkles className="w-4 h-4 text-primary/40" />
        </div>
        <div className="absolute top-8 -right-4 animate-[bounce_2s_ease-in-out_infinite]">
          <Sparkles className="w-3 h-3 text-primary/50" />
        </div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading
          </span>
        </div>
      </div>

      <style>{`
        @keyframes swing {
          0%, 100% { transform: translateX(-50%) rotate(-3deg); }
          50% { transform: translateX(-50%) rotate(3deg); }
        }
      `}</style>
    </div>
  );
};
