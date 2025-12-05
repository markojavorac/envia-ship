import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadStepProps {
  onImagesSelected: (files: File[]) => void;
  onContinue: () => void;
}

export function ImageUploadStep({ onImagesSelected, onContinue }: ImageUploadStepProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, 5 - selectedFiles.length);
    const validFiles: File[] = [];

    // Validate files
    for (const file of newFiles) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    const updatedFiles = [...selectedFiles, ...validFiles];
    const updatedPreviews = [...previewUrls, ...newPreviewUrls];

    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
    onImagesSelected(updatedFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
    onImagesSelected(newFiles);
  };

  const handleContinue = () => {
    if (selectedFiles.length > 0) {
      onContinue();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-md p-8 transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          selectedFiles.length >= 5 && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => selectedFiles.length < 5 && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={selectedFiles.length >= 5}
        />

        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center mb-3">
            <Upload className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-lg font-bold text-foreground mb-1">Upload Product Photos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to select {selectedFiles.length > 0 && `(${selectedFiles.length}/5 uploaded)`}
          </p>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">For best results, include:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Front view of product</li>
              <li>Side or back views</li>
              <li>Close-up of labels and text</li>
              <li>Product in packaging</li>
              <li>Product next to common object (phone, credit card)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Selected Images ({selectedFiles.length}/5)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {previewUrls.map((url, index) => (
              <Card key={index} className="relative group bg-card border-border rounded-md overflow-hidden">
                <CardContent className="p-0 aspect-square relative">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
                    {index + 1}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add More Button */}
            {selectedFiles.length < 5 && (
              <Card
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer hover:border-primary/50 transition-colors bg-card border-border border-dashed rounded-md"
              >
                <CardContent className="p-0 aspect-square flex flex-col items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Add More</span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleContinue}
          disabled={selectedFiles.length === 0}
          className="bg-primary text-white hover:bg-primary/90 font-semibold"
        >
          Analyze Photos ({selectedFiles.length})
        </Button>
      </div>
    </div>
  );
}
