'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MdArrowBack, MdArrowForward, MdClose, MdOpenInFull } from 'react-icons/md';
import { getGallerySwipeDirection, orderGalleryImages } from '@/lib/vehicles/gallery';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

export default function VehicleGallery({ images, title }) {
  const galleryImages = orderGalleryImages(images);
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const dialogRef = useRef(null);
  const touchStartRef = useRef(null);
  const activeImage = galleryImages[activeIndex];

  useEffect(() => {
    trackPublicAnalyticsEvent('vehicle_detail_view', { page_path: pathname }, pathname);
  }, [pathname]);

  function showImage(index) {
    setDirection(index < activeIndex ? 'previous' : 'next');
    setActiveIndex(index);
  }

  function showPrevious() {
    showImage((activeIndex - 1 + galleryImages.length) % galleryImages.length);
  }

  function showNext() {
    showImage((activeIndex + 1) % galleryImages.length);
  }

  function closeViewer() {
    dialogRef.current?.close();
  }

  function handleViewerKeyDown(event) {
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft' && galleryImages.length > 1) showPrevious();
    if (event.key === 'ArrowRight' && galleryImages.length > 1) showNext();
  }

  function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const swipe = getGallerySwipeDirection(touchStartRef.current, { x: touch.clientX, y: touch.clientY });
    touchStartRef.current = null;
    if (swipe === 'next' && galleryImages.length > 1) showNext();
    if (swipe === 'previous' && galleryImages.length > 1) showPrevious();
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 [perspective:1200px]" onTouchEnd={handleTouchEnd} onTouchStart={handleTouchStart}>
        {activeImage?.url ? (
          <>
            <Image
              key={activeImage.id}
              alt={`${title}, photo ${activeIndex + 1} of ${galleryImages.length}`}
              className={`object-cover vehicle-gallery-enter-${direction}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              src={activeImage.url}
            />
            {galleryImages.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center bg-black/70 text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={showPrevious}
                  title="Previous photo"
                  type="button"
                >
                  <MdArrowBack aria-hidden="true" className="text-xl" />
                </button>
                <button
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center bg-black/70 text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={showNext}
                  title="Next photo"
                  type="button"
                >
                  <MdArrowForward aria-hidden="true" className="text-xl" />
                </button>
              </>
            )}
            <button
              aria-label={`View ${title} photo full screen`}
              className="absolute bottom-3 right-3 flex size-11 items-center justify-center bg-black/70 text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => dialogRef.current?.showModal()}
              title="View full screen"
              type="button"
            >
              <MdOpenInFull aria-hidden="true" className="text-xl" />
            </button>
            <span aria-live="polite" className="absolute bottom-3 left-3 bg-black/70 px-3 py-2 text-xs font-semibold text-white">
              {activeIndex + 1} / {galleryImages.length}
            </span>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-neutral-500">
            Photos coming soon
          </div>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div aria-label="Choose a vehicle photo" className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2" role="group">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`relative aspect-[4/3] w-20 shrink-0 snap-start overflow-hidden border-2 bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-24 ${index === activeIndex ? 'border-primary' : 'border-transparent'}`}
              onClick={() => showImage(index)}
              type="button"
            >
              {image.thumbUrl || image.url ? (
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="96px"
                  src={image.thumbUrl || image.url}
                />
              ) : null}
            </button>
          ))}
        </div>
      )}

      <dialog
        aria-label={`${title} photo viewer`}
        className="m-auto h-dvh max-h-none w-screen max-w-none border-0 bg-neutral-950 p-0 text-white backdrop:bg-black/90"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeViewer();
        }}
        onKeyDown={handleViewerKeyDown}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        ref={dialogRef}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          {activeImage?.url && (
            <Image
              alt={`${title}, photo ${activeIndex + 1} of ${galleryImages.length}`}
              className="object-contain"
              fill
              sizes="100vw"
              src={activeImage.url}
            />
          )}
          <div className="absolute inset-x-0 top-0 z-10 flex min-h-16 items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 sm:px-8">
            <p className="min-w-0 truncate text-sm font-semibold sm:text-base">
              {title} <span className="text-white/65">· {activeIndex + 1} / {galleryImages.length}</span>
            </p>
            <button
              aria-label="Close photo viewer"
              className="flex size-11 shrink-0 items-center justify-center bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              onClick={closeViewer}
              title="Close photo viewer"
              type="button"
            >
              <MdClose aria-hidden="true" className="text-2xl" />
            </button>
          </div>
          {galleryImages.length > 1 && (
            <>
              <button
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center bg-black/70 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:left-8"
                onClick={showPrevious}
                title="Previous photo"
                type="button"
              >
                <MdArrowBack aria-hidden="true" className="text-xl" />
              </button>
              <button
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center bg-black/70 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-8"
                onClick={showNext}
                title="Next photo"
                type="button"
              >
                <MdArrowForward aria-hidden="true" className="text-xl" />
              </button>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}