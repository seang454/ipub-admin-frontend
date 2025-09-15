"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export default function NavbarGuest() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation("common");
  const { data } = useSession();

  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLang, setCurrentLang] = useState<"en" | "kh">("en");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedDarkMode = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDarkMode = savedDarkMode
      ? savedDarkMode === "true"
      : prefersDark;
    setIsDarkMode(initialDarkMode);
    document.documentElement.classList.toggle("dark", initialDarkMode);

    if (i18n?.language) setCurrentLang(i18n.language as "en" | "kh");
  }, [i18n]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  const toggleLanguage = async () => {
    if (!mounted || !i18n?.changeLanguage) return;
    const newLang = currentLang === "en" ? "kh" : "en";
    try {
      await i18n.changeLanguage(newLang);
      setCurrentLang(newLang);
    } catch (err) {
      console.error("Failed to change language", err);
    }
  };

  if (!mounted) return null;

  const navLinks = [
    { path: "/", name: t("home") },
    { path: "/browse", name: t("browse") },
    { path: "/about", name: t("about") },
    { path: "/contact", name: t("contact") },
  ];

  return (
    <nav className="fixed top-14 left-0 w-full z-40 border-b bg-background border-border py-2 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="inline-block">
          <Image
            src="/logo/Docohub.png"
            alt="DocuHub Logo"
            width={120}
            height={40}
            className="transition-all"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.path}
              className={`transition ${
                pathname === link.path
                  ? "text-accent font-semibold"
                  : "text-foreground hover:text-accent"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-muted transition"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-secondary" />
            ) : (
              <Moon className="h-5 w-5 text-secondary" />
            )}
          </button>

          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={toggleLanguage}
          >
            <Image
              src={currentLang === "en" ? "/flag-UK.svg" : "/flag-Cam.svg"}
              alt="flag"
              width={45}
              height={25}
              className="rounded-[8px]"
            />
            <span className="text-foreground font-medium">
              {currentLang.toUpperCase()}
            </span>
          </div>
          {!data?.access_token ? (
            <Button
              asChild
              className="bg-accent text-white hover:bg-accent/90 font-semibold"
            >
              <button onClick={() => signIn("keycloak")}>{t("signup")}</button>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-accent text-white hover:bg-accent/90 font-semibold"
            >
              <button onClick={() => signOut()}>{t("Sign Out")}</button>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg border border-border text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span className="block w-5 h-0.5 bg-foreground mb-1" />
          <span className="block w-5 h-0.5 bg-foreground mb-1" />
          <span className="block w-5 h-0.5 bg-foreground" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 flex flex-col gap-3">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.path}
                className={`transition ${
                  pathname === link.path
                    ? "text-accent font-semibold"
                    : "text-foreground hover:text-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-muted transition"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-secondary" />
                ) : (
                  <Moon className="h-5 w-5 text-secondary" />
                )}
              </button>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={toggleLanguage}
              >
                <Image
                  src={currentLang === "en" ? "/flag-UK.svg" : "/flag-Cam.svg"}
                  alt="flag"
                  width={32}
                  height={20}
                  className="rounded-[6px]"
                />
                <span className="text-foreground font-medium">
                  {currentLang.toUpperCase()}
                </span>
              </div>
              {data?.access_token ? (
                <Button
                  asChild
                  className="bg-accent text-white hover:bg-accent/90 font-semibold"
                >
                  <button onClick={() => signOut()}>{t("Sign Out")}</button>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-accent text-white hover:bg-accent/90 font-semibold"
                >
                  <button onClick={() => signIn("keycloak")}>
                    {t("signup")}
                  </button>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
