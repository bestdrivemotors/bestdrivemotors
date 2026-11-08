'use client';

import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import VehicleCard from './VehicleCard';

export default function FeaturedCarousel({ vehicles }) {
  const rail = useRef(null);
  if (!vehicles.length) return null;

  function move(direction) {
    rail.current?.scrollBy({ left: direction * rail.current.clientWidth * 0.85, behavior: 'smooth' });
  }

  return (
    <section className="bg-zinc-100 px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-zinc-300 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Featured stock</p>
            <h2 className="mt-1 text-2xl font-black">Find your next drive</h2>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous featured vehicles" className="inline-flex size-10 items-center justify-center border border-zinc-300 bg-white hover:bg-zinc-50" onClick={() => move(-1)} type="button"><FiChevronLeft aria-hidden="true" /></button>
            <button aria-label="Next featured vehicles" className="inline-flex size-10 items-center justify-center border border-zinc-300 bg-white hover:bg-zinc-50" onClick={() => move(1)} type="button"><FiChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        <div ref={rail} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3">
          {vehicles.map((vehicle) => <div key={vehicle.id} className="w-[min(86vw,340px)] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"><VehicleCard vehicle={vehicle} /></div>)}
        </div>
      </div>
    </section>
  );
}