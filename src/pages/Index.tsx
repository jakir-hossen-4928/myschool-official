import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-600 to-sky-600 to-green-500 to-yellow-500 to-orange-500 to-red-500">
      <Navbar />
      <main className="w-full overflow-hidden">
        <Hero />
        <Stats />
        <About />
        <Gallery />
        <Contact />
      </main>
    </div>
  );
};

export default Index;