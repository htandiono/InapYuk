'use client';
import { Plus } from 'lucide-react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  loading: boolean;
}

export function UploadSlot({ onFilesSelected, loading }: Props) {
  return (
    <label className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors text-muted-foreground group">
      <UploadIconSlot />
      <UploadLabel />
      <FileInput onFilesSelected={onFilesSelected} disabled={loading} />
    </label>
  );
}

function UploadIconSlot() {
  return (
    <div className="bg-muted group-hover:bg-primary/10 p-2 rounded-full mb-1 transition-colors">
      <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
    </div>
  );
}

function UploadLabel() {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wider group-hover:text-primary transition-colors">
      Tambah
    </span>
  );
}

function FileInput({
  onFilesSelected,
  disabled,
}: {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}) {
  return (
    <input
      type="file"
      multiple
      accept="image/jpeg,image/png"
      className="hidden"
      onChange={(e) => {
        if (e.target.files) {
          onFilesSelected(Array.from(e.target.files));
          e.target.value = '';
        }
      }}
      disabled={disabled}
    />
  );
}
