import Hero from "./components/Hero";
import Features from "./components/Features";
import FinanceSection from "./components/FinanceSection";
import FeaturedCarousel from "./components/FeaturedCarousel";
import AnswerFaq from "./components/AnswerFaq";
import { featuredVehicles, getPublicInventory } from "@/lib/inventory/snapshot";

export const revalidate = 300;

export const metadata = {
  title: "Used Vehicles in South Auckland",
  description: "Browse available used vehicles and explore finance assistance at Best Drive Motors in South Auckland, New Zealand.",
  openGraph: {
    title: "Best Drive Motors | Used Vehicles in South Auckland",
    description: "Browse available vehicles and explore finance assistance in South Auckland.",
    url: "https://bestdrivemotors.co.nz",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export default async function Home() {
  const vehicles = featuredVehicles(await getPublicInventory());
  return (
    <>
      <Hero />
      <FeaturedCarousel vehicles={vehicles} />
      <Features />
      <FinanceSection />
      <AnswerFaq
        title="Quick answers"
        items={[
          { question: 'Where is Best Drive Motors?', answer: 'Best Drive Motors serves South Auckland, New Zealand.' },
          { question: 'How can I contact the dealership?', answer: 'Call Best Drive Motors on 022 435 3449.' },
          { question: 'Can I apply for vehicle finance?', answer: 'Yes. Use the online finance application to get started. An application does not guarantee approval.' },
        ]}
      />
    </>
  );
}
