export default function Features() {
  const features = [
    {
      icon: 'verified',
      title: 'Quality Assured',
      description: 'Multi-point inspections on all vehicles.',
    },
    {
      icon: 'account_balance_wallet',
      title: 'Easy Finance',
      description: 'Competitive rates and fast approvals.',
    },
    {
      icon: 'handshake',
      title: 'Trusted Service',
      description: 'Locally owned and operated team.',
    },
  ];

  return (
    <section className="bg-background-dark py-10 border-y border-border-grey">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl transition-colors bg-card-dark cursor-pointer"
            >
              <div className="flex size-12 md:size-14 items-center justify-center rounded-full bg-card-dark border border-primary text-primary group-hover:text-primary group-hover:border-primary transition-all flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{feature.title}</h3>
                <p className="text-sm text-white mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
