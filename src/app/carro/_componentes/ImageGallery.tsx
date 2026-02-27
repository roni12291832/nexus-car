"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: (File | string)[] | string; // 👈 aceita string do banco também
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  // 🔒 Normaliza as imagens para SEMPRE ser array
  const parsedImages = useMemo<(File | string)[]>(() => {
    if (Array.isArray(images)) return images;

    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getImageSrc = (image: File | string) => {
    if (typeof image === "string") return image;
    return URL.createObjectURL(image);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? parsedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === parsedImages.length - 1 ? 0 : prev + 1
    );
  };

  if (parsedImages.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[16/9] bg-muted rounded-2xl flex items-center justify-center",
          className
        )}
      >
        <span className="text-muted-foreground">Sem imagens</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main Image */}
      <div
        className="relative h-[45vh] md:h-[500px] w-full overflow-hidden rounded-2xl bg-[#0f1117] flex items-center justify-center cursor-pointer group"
        onClick={() => setIsFullscreen(true)}
      >
        <img
          src={getImageSrc(parsedImages[currentIndex])}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-all duration-500 hover:scale-[1.02]"
          key={currentIndex}
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">Toque para expandir</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent pointer-events-none" />

        {/* Navigation Buttons */}
        {parsedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {currentIndex + 1} / {parsedImages.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {parsedImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {parsedImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-300",
                index === currentIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={getImageSrc(image)}
                alt={`${alt} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen max-h-[100vh] p-0 m-0 bg-black border-none rounded-none flex flex-col pt-10">
          <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={getImageSrc(parsedImages[currentIndex])}
              alt={`${alt} - Fullscreen ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
            {parsedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 rounded-full shadow-lg w-12 h-12"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 rounded-full shadow-lg w-12 h-12"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            <div className="absolute top-4 right-6 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {parsedImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
