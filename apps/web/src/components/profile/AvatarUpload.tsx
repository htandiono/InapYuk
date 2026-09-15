'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface AvatarUploadProps {
  currentUrl?: string | null;
  name: string;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function AvatarUpload({ currentUrl, name, onFileSelect, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const displayUrl = preview || currentUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Ukuran file maksimal 1MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt={name} className="object-cover" />
          ) : (
            <AvatarFallback className="text-2xl">{initials || 'U'}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
          </Button>
          {preview && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              disabled={disabled}
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/gif"
        className="hidden"
      />
      <p className="text-xs text-muted-foreground">
        Format JPEG, PNG, GIF. Maks. 1MB.
      </p>
    </div>
  );
}
