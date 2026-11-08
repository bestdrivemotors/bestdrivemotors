export const metadata = {
  title: "Privacy Act Statement",
  description: "Read the Best Drive Motors Privacy Act Statement for personal information collected through the finance application.",
  alternates: { canonical: "/our-privacy-policy" },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | Best Drive Motors",
    description: "Privacy Act Statement and information protection policy",
    url: "https://bestdrivemotors.co.nz/our-privacy-policy",
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
