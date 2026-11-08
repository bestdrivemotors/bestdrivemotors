'use client';

import { MdPrivacyTip } from 'react-icons/md';

export default function PrivacyPage() {

  return (
    <>
      <main className="min-h-screen bg-white px-5 py-10 text-zinc-950 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto w-full max-w-3xl">
          {/* Header Section */}
          <div className="mb-12 flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-primary font-bold uppercase text-xs">
                <MdPrivacyTip className="text-sm" />
                Legal & Privacy
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                Privacy Act Statement
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
                Please read and accept our Privacy Act Statement before proceeding with your finance application.
              </p>
            </div>
          </div>

          {/* Privacy Statement Content */}
          <div>
            {/* Section 1: The Privacy Act 2020 */}
            <section>
              {/* <h2 className="text-2xl font-bold text-black mb-6">
                Privacy Act Statement
              </h2> */}
              <div className="space-y-5 border-l-2 border-zinc-200 pl-5 text-sm leading-7 text-zinc-700 sm:pl-7 sm:text-base">
                <p>
                  I/we authorise Best Drive Motors<span className="text-primary">*</span> to collect, retain and use the personal information about me/us, for the purposes of:
                </p>
                <ul className="space-y-2 ml-4 border-l-2 border-primary/30 pl-4">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <span>Assessing my/our credit worthiness;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <span>Attending to the financing, whether directly or indirectly, of my/our contract(s) and enforcing Best Drive Motors&apos;s rights thereunder;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <span>Marketing and/or informing me/us about the goods and services provided by Best Drive Motors</span>
                  </li>
                </ul>

                <p className="pt-4">
                  I/we authorise Best Drive Motors to collect from credit reporting agencies, credit providers, my/our employer(s), accountant(s), relatives, or other person(s) such personal, financial and commercial information about me/us for the said purposes.
                </p>

                <p className="pt-4">
                  I/we authorise Best Drive Motors to provide this information:
                </p>
                <ul className="space-y-2 ml-4 border-l-2 border-primary/30 pl-4">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <span>To any person for the foregoing purposes;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <span>To any employees and agents of Best Drive Motors and/or any other person, in any ordinary course of business, for any of the foregoing purposes;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <span>To credit agencies for the purpose of maintaining proper or effective records.</span>
                  </li>
                </ul>

                <p className="pt-4">
                  I/we acknowledge that if I/we do not provide all or any part of the information requested on this application form, my/our application for finance may be declined. I/we further acknowledge that pursuant to the Privacy Act 2020, I/we have a right of access to information collected by Best Drive Motors about me/us and to request that this information be corrected. The information will be held at the office of Best Drive Motors in Auckland or the registered offices of any party nominated by Best Drive Motors.
                </p>

                <p className="pt-4 text-sm text-primary/80">
                  <span className="font-bold">*</span>Best Drive Motors and other associated third parties
                </p>

              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
