"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { SidebarGroup, SidebarItem } from "@/lib/types";
import {
  FiCheckSquare,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";

const NAV_GROUPS: SidebarGroup[] = [
  {
    title: "Navegacao",
    items: [
      {
        title: "Visao geral",
        href: "/",
        icon: FiGrid,
      },
      {
        title: "Tarefas",
        href: "/tarefas",
        icon: FiCheckSquare,
      },
    ],
  },
];

function SidebarLink({
  item,
  isCollapsed,
  isActive,
}: {
  item: SidebarItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {Icon && (
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
      <span className={isCollapsed ? "block md:hidden" : "inline"}>
        {item.title}
      </span>
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activePath = useMemo(() => pathname || "/", [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 text-slate-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside
          data-collapsed={isCollapsed}
          className={`border-b border-slate-200 bg-white/80 p-4 backdrop-blur md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r ${
            isCollapsed ? "md:w-20" : "md:w-64"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                TC
              </span>
              <div className={isCollapsed ? "block md:hidden" : "block"}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Tarefas
                </p>
                <p className="text-sm font-semibold text-slate-900">Casa</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:flex"
              aria-label="Alternar sidebar"
            >
              {isCollapsed ? (
                <FiChevronRight className="h-4 w-4" />
              ) : (
                <FiChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="mt-8 grid gap-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="grid gap-3">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 ${
                    isCollapsed ? "block md:hidden" : "block"
                  }`}
                >
                  {group.title}
                </p>
                <div className="grid gap-2">
                  {group.items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      isCollapsed={isCollapsed}
                      isActive={activePath === item.href}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-6 py-10 md:px-10">{children}</main>
      </div>
    </div>
  );
}
