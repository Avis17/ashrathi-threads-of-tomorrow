import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, Maximize } from "lucide-react";

interface ImageZoomDialogProps {
  imageSrc: string;
  imageAlt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoomDialog = ({ imageSrc, imageAlt, isOpen, onClose }: ImageZoomDialogProps) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleClose = () => {
    setZoom(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="relative w-full h-[90vh] bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <div className="bg-white/10 text-white px-4 py-2 rounded-md flex items-center min-w-[80px] justify-center">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>

          {/* Image */}
          <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
            <img
              src={imageSrc}
              alt={imageAlt}
              style={{
                transform: `scale(${zoom})`,
                transition: "transform 0.2s ease-out",
              }}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomDialog;
