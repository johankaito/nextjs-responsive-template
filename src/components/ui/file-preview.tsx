"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isImageFile, FILE_TYPE_NAMES } from "@/config/fileRestrictions";

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  className?: string;
  showActions?: boolean;
  onDelete?: () => void;
}

export function FilePreview({ 
  file, 
  className = "", 
  showActions = true,
  onDelete 
}: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = isImageFile(file.type);
  const isPDF = file.type === 'application/pdf';
  const fileTypeName = FILE_TYPE_NAMES[file.type] || 'File';

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const renderPreview = () => {
    if (isImage && file.url && !imageError) {
      return (
        <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
          {isLoading && (
            <Skeleton className="absolute inset-0" />
          )}
          <Image
            src={file.url}
            alt={file.name}
            fill
            className="object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );
    }

    if (isPDF && file.url) {
      return (
        <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
          <iframe
            src={`${file.url}#view=FitH`}
            className="w-full h-full"
            title={file.name}
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <Skeleton className="absolute inset-0" />
          )}
        </div>
      );
    }

    // Default file icon for other types
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-md h-48">
        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
        <span className="text-sm font-medium text-center">{file.name}</span>
        <span className="text-xs text-muted-foreground">{fileTypeName}</span>
      </div>
    );
  };

  return (
    <>
      <Card className={`overflow-hidden ${className}`}>
        <div className="relative">
          {renderPreview()}
          
          {showActions && (
            <div className="absolute bottom-2 right-2 flex gap-2">
              {(isImage || isPDF) && file.url && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowFullPreview(true)}
                  className="shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              
              {file.url && (
                <Button
                  size="sm"
                  variant="secondary"
                  asChild
                  className="shadow-sm"
                >
                  <a href={file.url} download={file.name}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
              
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="shadow-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {fileTypeName} • {formatFileSize(file.size)}
          </p>
        </div>
      </Card>

      {/* Full Preview Modal */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-full min-h-[400px] overflow-auto">
            {isImage && file.url && !imageError ? (
              <div className="relative w-full h-full">
                <Image
                  src={file.url}
                  alt={file.name}
                  width={1200}
                  height={800}
                  className="object-contain w-full h-auto"
                />
              </div>
            ) : isPDF && file.url ? (
              <iframe
                src={`${file.url}#view=FitH`}
                className="w-full h-[70vh]"
                title={file.name}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Skeleton loader for file previews
export function FilePreviewSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-3 border-t space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}

// Helper function (duplicate from fileRestrictions.ts for convenience)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 