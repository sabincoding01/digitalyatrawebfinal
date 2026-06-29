"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Expertise", href: "/#expertise" },
  { name: "Process", href: "/#process" },
  { name: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isAppRoute = pathname.startsWith("/admin") || pathname.startsWith("/portal");
  const shouldBeSolid = isScrolled || !isHome || isAppRoute;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Extract hash from href (handles both "#about" and "/#about")
    const hashIndex = href.indexOf("#");
    const hash = hashIndex !== -1 ? href.substring(hashIndex) : null;

    // If we're on the homepage and there's a hash, scroll directly
    if (hash && isHome) {
      const element = document.querySelector(hash);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
      return;
    }

    // If there's a hash but we're not on the homepage, navigate to home with hash
    if (hash && !isHome) {
      window.location.href = `/${hash}`;
      return;
    }

    // Plain path (e.g. "/", "/blog"), do normal navigation
    window.location.href = href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldBeSolid
          ? "bg-background/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/10 shadow-sm supports-[backdrop-filter]:bg-background/80"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 min-w-0">
          {/* Logo */}
          <Link
            href={isAppRoute ? "/" : "#home"}
            onClick={isAppRoute ? undefined : (e) => scrollToSection(e, "#home")}
            className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0"
          >
            <Image src="/logo.png" alt="Digital Yatra Logo" width={48} height={48} className="h-9 sm:h-12 w-auto object-contain shrink-0" priority />
            <div className="font-bold tracking-widest text-base sm:text-xl flex gap-1 sm:gap-1.5 items-center mt-1 min-w-0">
              <span className="text-[#F7941D] shrink-0">DIGITAL</span>
              <span className={`transition-colors duration-300 shrink-0 ${shouldBeSolid ? "text-primary-950 dark:text-white" : "text-white"}`}>
                YATRA
              </span>
            </div>
          </Link>

          {isAppRoute ? (
            <nav className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="text-sm font-medium text-foreground/80 hover:text-secondary-500 transition-colors whitespace-nowrap"
              >
                Back to Website
              </Link>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full transition-colors hover:bg-foreground/5"
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-primary-900 dark:text-white" />
                  )}
                </button>
              )}
            </nav>
          ) : (
          <>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 min-w-0">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium transition-colors hover:text-secondary-500 ${
                  shouldBeSolid ? "text-foreground/80" : "text-white/90"
                }`}
              >
                {link.name}
              </a>
            ))}
            
            <div className={`flex items-center gap-4 border-l pl-4 ${shouldBeSolid ? "border-foreground/10" : "border-white/20"}`}>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors ${
                    shouldBeSolid ? "hover:bg-foreground/5" : "hover:bg-white/10"
                  }`}
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className={`w-5 h-5 ${shouldBeSolid ? "text-primary-900 dark:text-white" : "text-white"}`} />
                  )}
                </button>
              )}
              <Link
                href="/portal"
                className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-colors hidden lg:block ${
                  shouldBeSolid 
                    ? "border-foreground/20 hover:bg-foreground/5 text-foreground" 
                    : "border-white/30 hover:bg-white/10 text-white"
                }`}
              >
                Student Portal
              </Link>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className="px-5 py-2.5 rounded-full bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium transition-colors"
              >
                Get Started
              </a>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4 shrink-0">
            {mounted && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  shouldBeSolid ? "hover:bg-foreground/5" : "hover:bg-white/10"
                }`}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className={`w-5 h-5 ${shouldBeSolid ? "text-primary-900 dark:text-white" : "text-white"}`} />
                )}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md transition-colors ${
                shouldBeSolid ? "hover:bg-foreground/5" : "hover:bg-white/10"
              }`}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${shouldBeSolid ? "text-foreground" : "text-white"}`} />
              ) : (
                <Menu className={`w-6 h-6 ${shouldBeSolid ? "text-foreground" : "text-white"}`} />
              )}
            </button>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && !isAppRoute && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="block px-4 py-3 text-base font-medium text-foreground hover:bg-foreground/5 hover:text-secondary-500 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-foreground/10 px-4 flex flex-col gap-3">
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full justify-center px-5 py-3 rounded-full border border-foreground/20 hover:bg-foreground/5 text-foreground text-base font-medium transition-colors"
                >
                  Student Portal
                </Link>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "#contact")}
                  className="flex w-full justify-center px-5 py-3 rounded-full bg-secondary-500 hover:bg-secondary-600 text-white text-base font-medium transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
