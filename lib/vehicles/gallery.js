export function orderGalleryImages(images = []) {
  const ordered = [...images].sort(
    (first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0),
  );
  const coverIndex = ordered.findIndex((image) => image.isCover);

  if (coverIndex <= 0) return ordered;

  return [
    ordered[coverIndex],
    ...ordered.slice(0, coverIndex),
    ...ordered.slice(coverIndex + 1),
  ];
}

export function getGallerySwipeDirection(start, end, threshold = 48) {
  if (!start || !end) return null;

  const horizontalDistance = end.x - start.x;
  const verticalDistance = end.y - start.y;
  if (Math.abs(horizontalDistance) < threshold || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) {
    return null;
  }

  return horizontalDistance < 0 ? 'next' : 'previous';
}