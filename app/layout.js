import { Geist, Geist_Mono, Be_Vietnam_Pro, Noto_Sans } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
import { buildLocalBusinessSchema } from "@/lib/seo/metadata";

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
  title: {
    default: "Best Drive Motors | Used Vehicles in South Auckland",
    template: "%s | Best Drive Motors",
  },
  description: "Browse available used vehicles and explore finance assistance at Best Drive Motors in South Auckland, New Zealand.",
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
    title: "Best Drive Motors | Used Vehicles in South Auckland",
    description: "Browse available vehicles and explore finance assistance in South Auckland.",
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
    title: "Best Drive Motors | Used Vehicles in South Auckland",
    description: "Browse available vehicles and explore finance assistance in South Auckland.",
  },
  alternates: {
    canonical: "https://bestdrivemotors.co.nz",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildLocalBusinessSchema()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} ${notoSans.variable} antialiased`}
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
