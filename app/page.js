import Hero from "./components/Hero";
import Features from "./components/Features";
import FinanceSection from "./components/FinanceSection";

export const metadata = {
  title: "Best Drive Motors | Quality Used Cars & Finance in Auckland",
  description: "Discover quality used cars at Best Drive Motors in Auckland. We offer flexible vehicle finance options, easy approval process, and reliable second-hand vehicles in New Zealand.",
  keywords: "used cars Auckland, second hand cars, car dealership Auckland, vehicle finance, cheap cars Auckland",
  openGraph: {
    title: "Best Drive Motors | Quality Used Cars in Auckland",
    description: "Quality used vehicles with flexible finance options in Auckland, New Zealand",
    url: "https://bestdrivemotors.co.nz",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <FinanceSection />
    </>
  );
}
