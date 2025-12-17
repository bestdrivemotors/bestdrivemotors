import { Geist, Geist_Mono, Be_Vietnam_Pro, Noto_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-display",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-body",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Best Drive Motors | Quality Used Cars in Auckland",
  description: "Find your perfect car at Best Drive Motors. Quality used vehicles with flexible finance options in Auckland. Easy approval process and reliable service.",
  keywords: "used cars Auckland, car finance Auckland, car loans NZ, vehicle finance New Zealand, second hand cars, auto loans",
  icons: {
    icon: "/best-drive-motor-title-logo.svg",
  },
  metadataBase: new URL("https://bestdrivemotors.co.nz"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://bestdrivemotors.co.nz",
    siteName: "Best Drive Motors",
    title: "Best Drive Motors | Quality Used Cars in Auckland",
    description: "Find your perfect car at Best Drive Motors. Quality used vehicles with flexible finance options in Auckland.",
    images: [
      {
        url: "/best-deal-motors-logo.png",
        width: 1200,
        height: 630,
        alt: "Best Drive Motors Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Drive Motors | Quality Used Cars in Auckland",
    description: "Find your perfect car at Best Drive Motors. Quality used vehicles with flexible finance options.",
  },
  alternates: {
    canonical: "https://bestdrivemotors.co.nz",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Schema.org structured data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Best Drive Motors",
              "url": "https://bestdrivemotors.co.nz",
              "logo": "https://bestdrivemotors.co.nz/best-deal-motors-logo.png",
              "description": "Quality used cars with flexible finance options in Auckland, New Zealand",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Auckland",
                "addressRegion": "Auckland",
                "addressCountry": "NZ"
              },
              "sameAs": [
                "https://www.facebook.com/bestdrivemotors",
                "https://www.instagram.com/bestdrivemotors"
              ]
            }),
          }}
        />
        {/* Schema.org structured data for LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Best Drive Motors",
              "image": "https://bestdrivemotors.co.nz/best-deal-motors-logo.png",
              "description": "Quality used cars with flexible finance options",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Auckland",
                "addressRegion": "Auckland",
                "postalCode": "2104",
                "addressCountry": "NZ"
              },
              "areaServed": {
                "@type": "City",
                "name": "Auckland"
              },
              "serviceType": ["Car Sales", "Vehicle Finance", "Auto Loans"]
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} ${notoSans.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
