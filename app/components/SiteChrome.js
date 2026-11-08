'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const hasValidGtmId = /^GTM-[A-Z0-9]+$/.test(GTM_ID || '');

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  useEffect(() => {
    if (!isAdmin && hasValidGtmId) {
      trackPublicAnalyticsEvent('page_view', { page_path: pathname }, pathname);
    }
  }, [isAdmin, pathname]);

  return (
    <>
      {!isAdmin && hasValidGtmId && (
        <Script
          id="best-drive-gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      )}
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}