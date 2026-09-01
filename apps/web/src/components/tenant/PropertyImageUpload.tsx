'use client';
import { filterValidFiles, checkImageCount, validateImageDimensions } from './image-utils';
import { ExistingImageCard } from './ExistingImageCard';
import { NewImageCard } from './NewImageCard';
import { UploadSlot } from './UploadSlot';

interface ExistingImage {
  id: string;
  url: string;
}

interface Props {
  existingImages: ExistingImage[];
  files: File[];
  setFiles: (files: File[]) => void;
  deletedImages: string[];
  mainImageId: string | null;
  setMainImageId: (id: string | null) => void;
  mainImageIndex: number | null;
  setMainImageIndex: (index: number | null) => void;
  loading: boolean;
}

export function PropertyImageUpload({
  existingImages,
  files,
  setFiles,
  deletedImages,
  setDeletedImages,
  mainImageId,
  setMainImageId,
  mainImageIndex,
  setMainImageIndex,
  loading,
}: Props) {
  const canAddMore = existingImages.length - deletedImages.length + files.length < 10;

  return (
    <div>
      <ImageUploadHeader />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 mb-2">
        <ExistingImagesSection
          existingImages={existingImages}
          deletedImages={deletedImages}
          mainImageId={mainImageId}
          setMainImageId={setMainImageId}
          setMainImageIndex={setMainImageIndex}
          onDelete={(imgId) =>
            handleDeleteExisting(
              imgId,
              deletedImages,
              setDeletedImages,
              setMainImageId,
              mainImageId,
            )
          }
        />
        <NewImagesSection
          files={files}
          mainImageIndex={mainImageIndex}
          setMainImageIndex={setMainImageIndex}
          setMainImageId={setMainImageId}
          onDelete={(i) => handleDeleteNew(i, files, setFiles, mainImageIndex, setMainImageIndex)}
        />
        {canAddMore && (
          <UploadSlot
            onFilesSelected={(f) =>
              void handleFilesSelected(
                f,
                existingImages,
                deletedImages,
                files,
                setFiles,
                setDeletedImages,
              )
            }
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function ImageUploadHeader() {
  return (
    <>
      <label className="block text-sm mb-1 font-medium">Foto Properti</label>
      <p className="text-xs text-muted-foreground mb-3">
        Format: JPG/PNG · Ukuran: 50KB – 5MB per foto · Resolusi minimal: 800×600px · Orientasi
        landscape direkomendasikan · Maks. 10 foto
      </p>
    </>
  );
}

function ExistingImagesSection({
  existingImages,
  deletedImages,
  mainImageId,
  setMainImageId,
  setMainImageIndex,
  onDelete,
}: {
  existingImages: ExistingImage[];
  deletedImages: string[];
  mainImageId: string | null;
  setMainImageId: (id: string | null) => void;
  setMainImageIndex: (i: number | null) => void;
  onDelete: (id: string) => void;
}) {
  return existingImages
    .filter((img) => !deletedImages.includes(img.id))
    .map((img) => (
      <ExistingImageCard
        key={img.id}
        img={img}
        isMain={mainImageId === img.id}
        onSetMain={() => {
          setMainImageId(img.id);
          setMainImageIndex(null);
        }}
        onDelete={() => onDelete(img.id)}
      />
    ));
}

function NewImagesSection({
  files,
  mainImageIndex,
  setMainImageIndex,
  setMainImageId,
  onDelete,
}: {
  files: File[];
  mainImageIndex: number | null;
  setMainImageIndex: (i: number | null) => void;
  setMainImageId: (id: string | null) => void;
  onDelete: (i: number) => void;
}) {
  return files.map((file, i) => (
    <NewImageCard
      key={i}
      file={file}
      isMain={mainImageIndex === i}
      onSetMain={() => {
        setMainImageIndex(i);
        setMainImageId(null);
      }}
      onDelete={() => onDelete(i)}
    />
  ));
}

function handleDeleteExisting(
  imgId: string,
  deletedImages: string[],
  setDeletedImages: (ids: string[]) => void,
  setMainImageId: (id: string | null) => void,
  mainImageId: string | null,
) {
  setDeletedImages([...deletedImages, imgId]);
  if (mainImageId === imgId) setMainImageId(null);
}

function handleDeleteNew(
  index: number,
  files: File[],
  setFiles: (files: File[]) => void,
  mainImageIndex: number | null,
  setMainImageIndex: (i: number | null) => void,
) {
  const newFiles = files.filter((_, idx) => idx !== index);
  setFiles(newFiles);
  if (mainImageIndex === index) {
    setMainImageIndex(null);
  } else if (mainImageIndex !== null && mainImageIndex > index) {
    setMainImageIndex(mainImageIndex - 1);
  }
}

async function handleFilesSelected(
  newFiles: File[],
  existingImages: ExistingImage[],
  deletedImages: string[],
  files: File[],
  setFiles: (files: File[]) => void,
) {
  const validFiles = filterValidFiles(newFiles);
  if (validFiles.length === 0) return;
  const dimensionResults = await Promise.all(
    validFiles.map((file) => validateImageDimensions(file)),
  );
  const validatedFiles = validFiles.filter((_, i) => dimensionResults[i]);
  if (validatedFiles.length === 0) return;
  if (
    !checkImageCount(
      existingImages.length,
      deletedImages.length,
      files.length,
      validatedFiles.length,
    )
  )
    return;
  setFiles([...files, ...validatedFiles]);
}
