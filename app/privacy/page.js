'use client';

export default function PrivacyPage() {

  return (
    <>
      <main className="flex flex-col items-center px-4 py-8 md:py-12 md:px-12 lg:px-20 bg-background-dark min-h-screen">
        <div className="w-full max-w-[900px]">
          {/* Header Section */}
          <div className="mb-12 flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <span className="material-symbols-outlined text-sm">privacy_tip</span>
                Legal & Privacy
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-black lg:text-5xl">
                Privacy Act Statement
              </h1>
              <p className="mt-4 text-base md:text-lg text-text-muted font-light">
                Please read and accept our Privacy Act Statement before proceeding with your finance application.
              </p>
            </div>
          </div>

          {/* Privacy Statement Content */}
          <div className="bg-background-dark">
            {/* Section 1: The Privacy Act 2020 */}
            <section>
              {/* <h2 className="text-2xl font-bold text-black mb-6">
                Privacy Act Statement
              </h2> */}
              <div className="space-y-4 text-text-muted leading-relaxed">
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
                    <span>Attending to the financing, whether directly or indirectly, of my/our contract(s) and enforcing Best Drive Motors's rights thereunder;</span>
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
