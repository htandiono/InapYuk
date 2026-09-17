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

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_SIZE = 1024 * 1024;

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function validateFile(file: File, inputRef: React.RefObject<HTMLInputElement | null>): boolean {
  if (file.size > MAX_SIZE) { alert('Ukuran file maksimal 1MB'); if (inputRef.current) inputRef.current.value = ''; return false; }
  if (!ALLOWED_TYPES.includes(file.type)) { alert('Format file tidak didukung'); if (inputRef.current) inputRef.current.value = ''; return false; }
  return true;
}

function AvatarButtons({ disabled, onCamera, onRemove, hasPreview }: { disabled?: boolean; onCamera: () => void; onRemove: () => void; hasPreview: boolean }) {
  return (
    <div className="absolute -bottom-2 -right-2 flex space-x-1">
      <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm" disabled={disabled} onClick={onCamera}>
        <Camera className="h-4 w-4" />
      </Button>
      {hasPreview && (
        <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-sm" disabled={disabled} onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function AvatarUploadView({ name, displayUrl, initials, fileInputRef, handleFileChange, handleRemove, disabled, preview }: { name: string; displayUrl: string | null; initials: string; fileInputRef: React.RefObject<HTMLInputElement | null>; handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleRemove: () => void; disabled?: boolean; preview: string | null }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          {displayUrl ? <AvatarImage src={displayUrl} alt={name} className="object-cover" /> : <AvatarFallback className="text-2xl">{initials || 'U'}</AvatarFallback>}
        </Avatar>
        <AvatarButtons disabled={disabled} onCamera={() => fileInputRef.current?.click()} onRemove={handleRemove} hasPreview={!!preview} />
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, image/gif" className="hidden" />
      <p className="text-xs text-muted-foreground">Format JPEG, PNG, GIF. Maks. 1MB.</p>
    </div>
  );
}

export function AvatarUpload({ currentUrl, name, onFileSelect, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = getInitials(name);
  const displayUrl = preview ?? currentUrl ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, fileInputRef)) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => { setPreview(null); onFileSelect(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return <AvatarUploadView name={name} displayUrl={displayUrl} initials={initials} fileInputRef={fileInputRef} handleFileChange={handleFileChange} handleRemove={handleRemove} disabled={disabled} preview={preview} />;
}
