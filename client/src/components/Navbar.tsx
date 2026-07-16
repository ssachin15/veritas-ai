import { Button } from "./ui/button";

export default function Navbar() {
  const navLinks = ["How It Works"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5 font-sora">
      {/* Left: Logo */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="text-foreground text-xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
      >
        VERITAS
      </a>

      {/* Center: Links */}
      <div className="hidden md:flex gap-8">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Right: CTA button */}
      <a href="#analyze" className="hidden md:inline-flex">
        <Button
          variant="navCta"
          size="lg"
        >
          Analyze Video
        </Button>
      </a>
    </nav>
  );
}
