export default function VehicleSpecifications({ specs, features = [] }) {
  return (
    <>
      <section className="mt-8 border-y border-zinc-300">
        <h2 className="py-3 text-sm font-bold uppercase tracking-wide">Specifications</h2>
        <dl className="grid grid-cols-1 border-t border-zinc-200 text-sm min-[420px]:grid-cols-2">
          {specs.map(([label, value]) => (
            <div key={label} className="min-w-0 border-b border-zinc-200 py-3 pr-3">
              <dt className="text-xs font-medium text-zinc-500">{label}</dt>
              <dd className="mt-1 break-words font-semibold capitalize [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {features.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Features</h2>
          <ul className="grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.id} className="min-w-0 break-words border-l-2 border-red-700 pl-2 [overflow-wrap:anywhere]">
                {feature.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}