import { revalidatePath, revalidateTag } from 'next/cache';

export function revalidateInventory(slug) {
  revalidateTag('inventory', { expire: 0 });
  revalidatePath('/');
  revalidatePath('/vehicles');
  revalidatePath('/search');
  if (slug) revalidatePath(`/vehicles/${slug}`);
}