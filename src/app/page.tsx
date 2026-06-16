import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { Expertise } from "@/components/sections/expertise";
import { Testimonials } from "@/components/sections/testimonials";
import { Process } from "@/components/sections/process";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Stats />
      <Expertise />
      <Testimonials />
      <Process />
      <FAQ />
      <Contact />
    </>
  );
}
