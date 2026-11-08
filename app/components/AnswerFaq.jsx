'use client';

import { serializeJsonLd } from '@/lib/seo/metadata';

export default function AnswerFaq({ title, items }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
  const jsonLd = serializeJsonLd(structuredData);

  return (
    <section className="border-t border-neutral-200 bg-white px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-2xl font-bold text-neutral-950 sm:text-3xl">{title}</h2>
        <div className="mt-5 grid gap-x-12 md:grid-cols-2">
          {items.map(({ question, answer }) => (
            <details key={question} className="group border-b border-neutral-200 py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                <span>{question}</span>
                <span aria-hidden="true" className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-2xl pb-1 pt-3 text-sm leading-6 text-neutral-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </section>
  );
}
