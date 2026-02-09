'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import type { SidebarGroup, SidebarItem } from '@/lib/types';
import {
  FiBell,
  FiCheckSquare,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiMail,
  FiSearch,
} from 'react-icons/fi';

const NAV_GROUPS: SidebarGroup[] = [
  {
    title: 'MENU',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: FiGrid,
      },
      {
        title: 'Tasks',
        href: '/tarefas',
        icon: FiCheckSquare,
      },
    ],
  },
  {
    title: 'GENERAL',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: FiGrid,
      },
      {
        title: 'Tasks',
        href: '/tarefas',
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
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? 'bg-emerald-50 text-emerald-800'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
      }`}
    >
      {Icon && (
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            isActive
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
              : 'border-zinc-200 bg-white text-zinc-500 group-hover:border-zinc-300'
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
      <span className={isCollapsed ? 'hidden md:inline' : 'inline'}>
        {item.title}
      </span>
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activePath = useMemo(() => pathname || '/', [pathname]);

  return (
    <div className="min-h-screen bg-[#e9ebec] p-3 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1360px] rounded-[28px] border border-white/90 bg-[#f4f5f4] p-3 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] md:min-h-[calc(100vh-3rem)] md:p-4">
        <aside
          className={`hidden rounded-2xl border border-zinc-200 bg-[#f8f8f7] p-4 md:flex md:flex-col ${
            isCollapsed ? 'md:w-[90px]' : 'md:w-[245px]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-sm font-semibold text-emerald-700">
                TC
              </span>
              {!isCollapsed && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                    Donezo
                  </p>
                  <p className="text-sm font-semibold text-zinc-800">Casa</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
              aria-label="Alternar sidebar"
            >
              {isCollapsed ? (
                <FiChevronRight className="h-4 w-4" />
              ) : (
                <FiChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="mt-8 grid gap-7">
            {NAV_GROUPS.map((group, idx) => (
              <div key={`${group.title}-${idx}`} className="grid gap-2.5">
                {!isCollapsed && (
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    {group.title}
                  </p>
                )}
                <div className="grid gap-1.5">
                  {group.items.map((item) => (
                    <SidebarLink
                      key={`${item.href}-${group.title}`}
                      item={item}
                      isCollapsed={isCollapsed}
                      isActive={activePath === item.href}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-[radial-gradient(circle_at_10%_10%,#1f7a57_0%,#0f5a3b_45%,#0e1b18_100%)] p-4 text-white">
            {!isCollapsed && (
              <>
                <p className="text-sm font-semibold">Casa em dia</p>
                <p className="mt-1 text-xs text-emerald-100/80">
                  Foco nas tarefas e no ritmo semanal.
                </p>
              </>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-[#f8f8f7] p-3 md:p-4">
          <header className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 md:px-4">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <FiSearch className="h-4 w-4 text-zinc-400" />
              <input
                aria-label="Buscar tarefa"
                placeholder="Search task"
                className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
              />
              <span className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                F
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500"
                aria-label="Mensagens"
              >
                <FiMail className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500"
                aria-label="Notificacoes"
              >
                <FiBell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  TC
                </span>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-zinc-800">Casa</p>
                  <p className="text-[11px] text-zinc-500">tarefas-casa</p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-auto px-1 py-1 md:px-2">{children}</main>
        </div>
      </div>
    </div>
  );
}
