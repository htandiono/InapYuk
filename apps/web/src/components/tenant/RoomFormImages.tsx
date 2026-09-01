import { Star, Trash2, ImageIcon } from 'lucide-react';
import { removeNewFile } from './useRoomForm';
import { RoomFormState, RoomFormInitData } from './RoomFormSchema';

export function RoomFormImages({
  state,
  previews,
  onChange,
}: {
  state: RoomFormState;
  previews: RoomFormInitData['images'];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { deleted, images, ref } = state;
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Foto Kamar (1 - 5 Foto)</label>
      <p className="text-xs text-muted-foreground mb-3">
        Format: JPG/PNG · Ukuran: 50KB – 5MB per foto
      </p>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
          {previews?.map(
            (img) =>
              !deleted.includes(img.id) && <PreviewItem key={img.id} img={img} state={state} />,
          )}
          {images.map((file: File, i: number) => (
            <NewFileItem key={i} file={file} idx={i} state={state} />
          ))}
          <UploadPlaceholder state={state} previews={previews} />
        </div>
        <input
          type="file"
          ref={ref}
          className="hidden"
          accept="image/jpeg,image/png"
          multiple
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function PreviewItem({ img, state }: { img: { id: string; url: string }; state: RoomFormState }) {
  const { mainId, setMainId, setMainIdx, deleted, setDeleted } = state;
  const setMain = () => {
    setMainId(img.id);
    setMainIdx(null);
  };
  const del = () => {
    setDeleted([...deleted, img.id]);
    if (mainId === img.id) setMainId(null);
  };
  return (
    <div
      className={`relative aspect-square bg-muted rounded-lg border overflow-hidden group ${mainId === img.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt="Preview"
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {mainId !== img.id && (
          <button type="button" onClick={setMain} className="bg-white/90 p-1.5 rounded-full">
            <Star className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={del}
          className="bg-destructive/90 text-white p-1.5 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {mainId === img.id && (
        <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md">
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
      )}
    </div>
  );
}

function NewFileItem({ file, idx, state }: { file: File; idx: number; state: RoomFormState }) {
  const { mainIdx, setMainIdx, setMainId } = state;
  const objUrl = URL.createObjectURL(file);
  const setMain = () => {
    setMainIdx(idx);
    setMainId(null);
  };
  return (
    <div
      className={`relative aspect-square bg-muted rounded-lg border overflow-hidden group ${mainIdx === idx ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={objUrl}
        alt="New Preview"
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onLoad={() => URL.revokeObjectURL(objUrl)}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {mainIdx !== idx && (
          <button type="button" onClick={setMain} className="bg-white/90 p-1.5 rounded-full">
            <Star className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => removeNewFile(idx, state)}
          className="bg-destructive/90 text-white p-1.5 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {mainIdx === idx && (
        <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md">
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
      )}
    </div>
  );
}

function UploadPlaceholder({
  state,
  previews,
}: {
  state: RoomFormState;
  previews: RoomFormInitData['images'];
}) {
  const { deleted, images, ref, form } = state;
  const count = (previews?.length ?? 0) - deleted.length + images.length;
  if (count >= 5) return null;
  return (
    <div
      onClick={() => !form.formState.isSubmitting && ref.current?.click()}
      className={`relative aspect-square bg-muted rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
      <span className="text-xs text-muted-foreground font-medium">Tambah Foto</span>
    </div>
  );
}
