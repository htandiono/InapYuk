'use client';
import Image from 'next/image';

function ThumbnailItem({
  img,
  idx,
  currentIndex,
  setCurrentIndex,
}: {
  img: { url: string };
  idx: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };
  const activeClass =
    idx === currentIndex
      ? 'ring-2 ring-white opacity-100 scale-105'
      : 'opacity-40 hover:opacity-100';
  return (
    <button
      onClick={onClick}
      className={`relative h-16 w-20 md:h-20 md:w-28 shrink-0 rounded-md overflow-hidden transition-all ${activeClass}`}
    >
      <Image
        src={img.url}
        alt={`Thumbnail ${idx + 1}`}
        fill
        className="object-cover"
        sizes="120px"
      />
    </button>
  );
}

export function LightboxThumbnails({
  images,
  currentIndex,
  setCurrentIndex,
}: {
  images: { url: string }[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (images.length <= 1) return null;
  return (
    <div className="absolute bottom-4 left-0 right-0 h-16 md:h-20 px-4 flex justify-center gap-2 overflow-x-auto z-50 scrollbar-hide">
      <div className="flex gap-2 mx-auto">
        {images.map((img, idx) => (
          <ThumbnailItem
            key={idx}
            img={img}
            idx={idx}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        ))}
      </div>
    </div>
  );
}
