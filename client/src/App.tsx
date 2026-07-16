import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import AnalyzeSection from "./components/AnalyzeSection";

export default function App() {
  return (
    <div className="bg-hero-bg min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <AnalyzeSection />
    </div>
  );
}
