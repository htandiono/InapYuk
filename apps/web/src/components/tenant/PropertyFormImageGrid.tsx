import { Plus, Star, Trash2 } from 'lucide-react';

export type ImageItem = { id: string; url: string };

interface GridProps {
  existingImages: ImageItem[]; files: File[]; mainImageId: string | null; mainImageIndex: number | null;
  totalSlots: number; loading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; removeNewFile: (index: number) => void;
  onSetMainImageExisting: (id: string) => void; onSetMainImageNew: (index: number) => void;
  onDeleteExisting: (id: string) => void;
}

function GridHeader() {
  return (
    <>
      <label className="block text-sm mb-1 font-medium">Foto Properti</label>
      <p className="text-xs text-muted-foreground mb-3">Format: JPG/PNG · 50KB–5MB · Min. 800×600px · Maks. 10 foto</p>
    </>
  );
}

export function PropertyFormImageGrid(props: GridProps) {
  return (
    <div>
      <GridHeader />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 mb-2">
        {props.existingImages.map((img) => <ExistingImageCell key={img.id} img={img} mainImageId={props.mainImageId} onSetMain={props.onSetMainImageExisting} onDelete={props.onDeleteExisting} />)}
        {props.files.map((file, i) => <NewFileCell key={i} file={file} index={i} isMain={props.mainImageIndex === i} removeNewFile={props.removeNewFile} onSetMain={props.onSetMainImageNew} />)}
        {props.totalSlots < 10 && <UploadButton loading={props.loading} onChange={props.handleFileChange} />}
      </div>
    </div>
  );
}

function ExistingHoverActions({ id, mainImageId, onSetMain, onDelete }: { id: string; mainImageId: string | null; onSetMain: (id: string) => void; onDelete: (id: string) => void; }) {
  return (
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      {mainImageId !== id && <button type="button" onClick={() => onSetMain(id)} className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors" title="Jadikan Utama"><Star className="w-4 h-4" /></button>}
      <button type="button" onClick={() => onDelete(id)} className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function ExistingImageCell({ img, mainImageId, onSetMain, onDelete }: { img: ImageItem; mainImageId: string | null; onSetMain: (id: string) => void; onDelete: (id: string) => void; }) {
  return (
    <div className={`relative aspect-square border rounded-lg overflow-hidden group ${mainImageId === img.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.url} alt="prop" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      <ExistingHoverActions id={img.id} mainImageId={mainImageId} onSetMain={onSetMain} onDelete={onDelete} />
      {mainImageId === img.id && <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md" title="Foto Utama"><Star className="w-3.5 h-3.5 fill-current" /></div>}
    </div>
  );
}

function NewHoverActions({ index, isMain, onSetMain, removeNewFile }: { index: number; isMain: boolean; onSetMain: (index: number) => void; removeNewFile: (index: number) => void; }) {
  return (
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      {!isMain && <button type="button" onClick={() => onSetMain(index)} className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors" title="Jadikan Utama"><Star className="w-4 h-4" /></button>}
      <button type="button" onClick={() => removeNewFile(index)} className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function NewFileCell({ file, index, isMain, removeNewFile, onSetMain }: { file: File; index: number; isMain: boolean; removeNewFile: (index: number) => void; onSetMain: (index: number) => void; }) {
  const objectUrl = URL.createObjectURL(file);
  return (
    <div className={`relative aspect-square border rounded-lg overflow-hidden group ${isMain ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={objectUrl} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" onLoad={() => URL.revokeObjectURL(objectUrl)} />
      <NewHoverActions index={index} isMain={isMain} onSetMain={onSetMain} removeNewFile={removeNewFile} />
      {isMain && <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md" title="Foto Utama"><Star className="w-3.5 h-3.5 fill-current" /></div>}
    </div>
  );
}

function UploadButton({ loading, onChange }: { loading: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) {
  return (
    <label className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors text-muted-foreground group">
      <div className="bg-muted group-hover:bg-primary/10 p-2 rounded-full mb-1 transition-colors"><Plus className="w-5 h-5 group-hover:text-primary transition-colors" /></div>
      <span className="text-[10px] font-medium uppercase tracking-wider group-hover:text-primary transition-colors">Tambah</span>
      <input type="file" multiple accept="image/jpeg,image/png" className="hidden" onChange={onChange} disabled={loading} />
    </label>
  );
}
