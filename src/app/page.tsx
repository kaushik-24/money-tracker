"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowRight,
  Building2,
  ArrowLeftRight,
  ChartPie,
  Trophy,
  TrendingUp,
  Tags,
} from "lucide-react";
import { HeroModel } from "@/components/HeroModel";
import { cn } from "@/lib/utils";

const STYLE_ID = "landing-animations";

const ANIMATION_STYLES = `
@keyframes li-intro {
  0% { opacity: 0; transform: translate3d(0, 40px, 0); filter: blur(8px); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
}
@keyframes li-orbit {
  0% { stroke-dashoffset: 0; transform: rotate(0deg); }
  100% { stroke-dashoffset: -64; transform: rotate(360deg); }
}
@keyframes li-grid {
  0%, 100% { transform: rotate(-3deg); opacity: 0.6; }
  50% { transform: rotate(3deg); opacity: 1; }
}
@keyframes li-pulse {
  0%, 100% { stroke-dasharray: 0 200; opacity: 0.2; }
  45%, 60% { stroke-dasharray: 200 0; opacity: 1; }
}
@keyframes li-glow {
  0%, 100% { opacity: 0.35; transform: translate3d(0,0,0); }
  50% { opacity: 0.7; transform: translate3d(0,-6px,0); }
}
@keyframes li-drift {
  0%, 100% { transform: translate3d(0,0,0); }
  50% { transform: translate3d(0,-10px,0); }
}
@keyframes li-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
`;

const features = [
  {
    icon: Building2,
    title: "ACCOUNTS",
    desc: "Checking, savings, credit cards, investments — all in one command center.",
  },
  {
    icon: ArrowLeftRight,
    title: "TRANSACTIONS",
    desc: "Every dollar tracked. Every category mapped. No surprises.",
  },
  {
    icon: ChartPie,
    title: "BUDGETS",
    desc: "Set limits. Track spend. Know exactly where your money goes.",
  },
  {
    icon: Trophy,
    title: "GOALS",
    desc: "Save for what matters. Watch your progress in real-time.",
  },
  {
    icon: TrendingUp,
    title: "INVESTMENTS",
    desc: "Monitor your portfolio. Growth at a glance.",
  },
  {
    icon: Tags,
    title: "CATEGORIES",
    desc: "Organize your financial life your way.",
  },
];



function useOnScreen(
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.1
): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function FeatureCard({
  icon,
  title,
  desc,
  index,
  show,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  index: number;
  show: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const onMouseLeave = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.removeProperty("--spot-x");
    card.style.removeProperty("--spot-y");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative overflow-hidden border border-white/10 rounded-xl p-5 md:p-6 transition-all duration-500 ease-out group",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        "hover:border-accent-green/40 hover:-translate-y-0.5"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(160px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(0,255,135,0.1), transparent 60%)",
        }}
      />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="text-base md:text-lg font-bold text-white mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Landing() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroVisible = useOnScreen(heroRef, 0.05);

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresVisible = useOnScreen(featuresRef, 0.1);
  const [featuresIdx, setFeaturesIdx] = useState(-1);

  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ANIMATION_STYLES;
    document.head.appendChild(style);
    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (session) router.push("/dashboard");
  }, [session, status, router]);

  useEffect(() => {
    if (!featuresVisible || featuresIdx >= features.length - 1) return;
    const t = setTimeout(() => setFeaturesIdx((i) => i + 1), 120);
    return () => clearTimeout(t);
  }, [featuresVisible, featuresIdx]);

  if (status === "loading" || session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-[family-name:var(--font-space-grotesk)] relative overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
        <div
          className={cn(
            "w-full transition-all duration-300 ease-out",
            isScrolled
              ? "max-w-4xl mt-2 md:mt-3 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-4 md:px-6"
              : "max-w-6xl mt-0 px-0"
          )}
        >
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-3 group"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 border border-accent-green/60 group-hover:border-accent-green transition-colors flex items-center justify-center">
                <Wallet
                  size={16}
                  className="md:w-[18px] md:h-[18px] text-accent-green"
                />
              </div>
              <span className="text-[13px] md:text-sm font-bold tracking-tight">
                MONEY TRACKER
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/login"
                className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-[11px] font-bold text-[#003320] bg-accent-green px-4 py-2.5 md:px-5 md:py-2.5 hover:brightness-110 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center pt-28 pb-16 md:pt-36 md:pb-20"
        >
          {/* Background layers */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: [
                "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(0,255,135,0.12), transparent 65%)",
                "radial-gradient(ellipse 60% 50% at 90% 100%, rgba(61,126,255,0.08), transparent 60%)",
                "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,255,135,0.03), transparent 50%)",
              ].join(","),
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.06) 0.7px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="pointer-events-none absolute -z-10 top-1/4 left-[8%] w-72 h-72 rounded-full border border-accent-green/10"
            style={{ animation: "li-glow 7s ease-in-out infinite" }}
          />
          <div
            className="pointer-events-none absolute -z-10 bottom-1/4 right-[5%] w-56 h-56 rounded-full border border-accent-blue/10"
            style={{ animation: "li-drift 10s ease-in-out infinite" }}
          />

          <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
            <div
              className={cn(
                "transition-all duration-[1s] ease-out",
                heroVisible
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-10 blur-sm"
              )}
            >
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
                <div className="flex-1 w-full">
                  <div className="mb-4 md:mb-5">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green border border-accent-green/30 px-3 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                      v1.0 &mdash; Now available
                    </span>
                  </div>
                  <h1 className="text-[44px] sm:text-[56px] md:text-[72px] lg:text-[84px] font-bold leading-[0.9] -tracking-[0.04em] mt-3 md:mt-4">
                    <span className="text-white">MONEY</span>
                    <br />
                    <span
                      className="text-accent-green"
                      style={{
                        textShadow:
                          "0 0 7px #00FF87, 0 0 10px #00FF87, 0 0 21px #00FF87, 0 0 42px rgba(0,255,135,0.3)",
                      }}
                    >
                      TRACKER
                    </span>
                  </h1>
                  <p className="text-[14px] sm:text-base text-white/50 mt-5 max-w-[480px] leading-relaxed font-medium">
                    A personal finance dashboard that puts you in control. Track
                    accounts, transactions, budgets, goals, and investments
                    &mdash; all in one place. No ads. No AI. Just your data,
                    your way.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 text-sm font-bold tracking-[0.06em] bg-accent-green text-[#003320] hover:brightness-110 transition-all"
                    >
                      Get Started{" "}
                      <ArrowRight size={14} className="ml-2" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 text-sm font-bold tracking-[0.06em] text-white/80 border border-white/20 hover:bg-white/5 hover:text-white hover:border-white/40 transition-all"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center motion-safe:animate-[li-float_6s_ease-in-out_infinite]">
                  <HeroModel />
                </div>
              </div>

              {/* Dashboard preview */}
              <div
                className={cn(
                  "mt-12 md:mt-16 transition-all duration-[1s] delay-[400ms] ease-out",
                  heroVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                )}
              >
                <div className="border border-white/10 rounded-2xl p-4 md:p-6 bg-[#0D0D0D]">
                  <div className="flex items-center gap-2 mb-4 md:mb-5">
                    <span className="w-2 h-2 rounded-full bg-accent-green" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                      Dashboard preview
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg">
                    <img
                      src="/images/dashboard-preview.webp"
                      alt="Money Tracker dashboard overview"
                      className="w-[1100px] max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          ref={featuresRef}
          className="relative py-20 md:py-28 overflow-hidden"
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,255,135,0.06), transparent 60%)",
            }}
          />
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div
              className={cn(
                "transition-all duration-700 ease-out",
                featuresVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <div className="flex items-center gap-3 mb-10 md:mb-14">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                  Everything you need to own your money
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {features.map((f, i) => (
                  <FeatureCard
                    key={f.title}
                    icon={
                      <f.icon size={18} className="text-accent-green" />
                    }
                    title={f.title}
                    desc={f.desc}
                    index={i}
                    show={featuresIdx >= i}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-3 md:gap-0 justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet size={14} className="text-accent-green" />
            <span className="text-xs font-bold tracking-tight">
              Money Tracker
            </span>
          </div>
          <p className="text-[10px] text-white/30">
            &copy; {new Date().getFullYear()} &mdash; Personal finance tracker
          </p>
        </div>
      </footer>
    </div>
  );
}
