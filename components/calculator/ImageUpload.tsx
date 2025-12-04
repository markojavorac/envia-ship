"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      // Validate count
      if (files.length + selectedFiles.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Validate size
      const maxBytes = maxSizeMB * 1024 * 1024;
      for (const file of selectedFiles) {
        if (file.size > maxBytes) {
          alert(`Each image must be under ${maxSizeMB}MB`);
          return;
        }
      }

      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      onImagesChange(newFiles);

      // Create previews
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [files, maxImages, maxSizeMB, onImagesChange]
  );

  const removeImage = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        className="border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <p className="font-semibold mb-1">Click to upload package photos</p>
          <p className="text-sm text-muted-foreground">
            Or drag and drop (max {maxImages} images, {maxSizeMB}MB each)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: JPG, PNG, WEBP
          </p>
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
        capture="environment"
      />

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
