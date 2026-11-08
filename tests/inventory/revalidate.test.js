import { describe, expect, it, vi } from 'vitest';

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }));

import { revalidateInventory } from '@/lib/revalidate-inventory';

describe('revalidateInventory', () => {
  it('expires the inventory tag and public routes', () => {
    revalidateInventory('2018-toyota-aqua-bd001');

    expect(revalidateTag).toHaveBeenCalledWith('inventory', { expire: 0 });
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      '/',
      '/vehicles',
      '/search',
      '/vehicles/2018-toyota-aqua-bd001',
    ]);
  });
});