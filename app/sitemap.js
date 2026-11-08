import { getPublicInventory } from '@/lib/inventory/snapshot';
import { buildSitemapEntries } from '@/lib/seo/metadata';

export const revalidate = 300;

export default async function sitemap() {
  const vehicles = await getPublicInventory();
  return buildSitemapEntries(vehicles);
}