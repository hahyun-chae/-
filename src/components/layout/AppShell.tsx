"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppState } from "@/store/app-store";
import { LoadingBlock } from "../ui/common";

const NAV = [
  { href: "/ingredients", label: "재료 시세", icon: "M4 19V9m6 10V5m6 14v-7m4 7H2" },
  { href: "/today", label: "오늘 판단", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/menus", label: "메뉴", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/settings", label: "설정", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-2-1.2L14.5 2h-5l-.4 2.6a7.6 7.6 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 002 1.2l.4 2.6h5l.4-2.6a7.6 7.6 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  return pathname.startsWith(href);
}

export function Logo() {
  return (
    <Link href="/ingredients" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-ink text-sm font-semibold text-white">₩</span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">원가핏</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const app = useAppState();
  const isOnboarding = pathname.startsWith("/onboarding");
  const ready = app !== null && app.onboarded;

  // 어느 화면으로 들어와도 온보딩 전이면 온보딩으로 보낸다
  useEffect(() => {
    if (app && !app.onboarded && !isOnboarding) router.replace("/onboarding");
  }, [app, isOnboarding, router]);

  if (isOnboarding) {
    return <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6">{children}</main>;
  }

  return (
    <div className="lg:flex">
      {/* 데스크톱 사이드바 */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-control bg-white px-4 py-7 lg:flex">
        <Logo />
        <p className="mt-1 pl-10 text-xs text-slate-500">{app?.settings.name || "우리 가게"}</p>
        <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] ${
                isActive(pathname, n.href) ? "bg-canvas font-semibold text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <NavIcon d={n.icon} />
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs leading-relaxed text-slate-400">
          추천은 판단을 돕기 위한 참고 정보예요. 최종 결정은 사장님이 해 주세요.
        </p>
      </aside>

      {/* 모바일 상단 바 */}
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-control bg-frost/80 px-4 backdrop-blur-xl lg:hidden">
        <Logo />
        <span className="max-w-[45%] truncate text-sm text-slate-500">{app?.settings.name || "우리 가게"}</span>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 sm:px-6 lg:px-12 lg:pt-14 lg:pb-20">{ready ? children : <LoadingBlock />}</main>

      {/* 모바일 하단 탭 */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-control bg-frost/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
              isActive(pathname, n.href) ? "text-ink" : "text-steel"
            }`}
          >
            <NavIcon d={n.icon} />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
