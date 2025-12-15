"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
        <img
          src={getImageSrc(parsedImages[currentIndex])}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500 animate-scale-in"
          key={currentIndex}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent pointer-events-none" />

        {/* Navigation Buttons */}
        {parsedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
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
    </div>
  );
}
