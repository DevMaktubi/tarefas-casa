'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { SummaryResponse } from '@/lib/types';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function OverviewPage() {
  const [summaryPeriod, setSummaryPeriod] = useState<'weekly' | 'monthly'>(
    'weekly'
  );
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  async function fetchSummary(period: 'weekly' | 'monthly') {
    setSummaryLoading(true);
    try {
      const response = await fetch(`/api/summary?period=${period}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao carregar resumo.');
      }
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary(summaryPeriod);
  }, [summaryPeriod]);

  const participantColors: Record<string, string> = {
    Breno: '#2563eb',
    Clara: '#ec4899',
  };

  const donutHasData = (summary?.total ?? 0) > 0;
  const donutSeries = donutHasData
    ? summary?.participants.map((p) => p.count) ?? []
    : [1];
  const donutLabels = donutHasData
    ? summary?.participants.map((p) => p.name) ?? []
    : ['Sem dados'];
  const donutColors = donutHasData
    ? summary?.participants.map(
        (p) => participantColors[p.name] || '#94a3b8'
      ) ?? []
    : ['#d4d4d8'];

  const donutOptions = {
    labels: donutLabels,
    colors: donutColors,
    legend: { position: 'bottom' as const },
    tooltip: {
      custom: ({ seriesIndex }: { seriesIndex: number }) => {
        if (!summary) return '';
        if (!donutHasData) {
          return '<div class="px-3 py-2">Sem dados no periodo</div>';
        }
        const participant = summary.participants[seriesIndex];
        if (!participant) return '';
        const tasksHtml = participant.tasks
          .map((task) => `${task.title} (${task.count})`)
          .join('<br/>');
        return `\n          <div class=\"px-3 py-2\">\n            <strong>${participant.name}</strong><br/>\n            ${tasksHtml || 'Sem tarefas'}\n          </div>\n        `;
      },
    },
  };

  const participantSeries =
    summary?.participants.map((participant) => ({
      name: participant.name,
      data:
        summary?.days.map((day) => {
          const entry = day.participants.find(
            (item) => item.id === participant.id
          );
          return entry?.count ?? 0;
        }) ?? [],
    })) ?? [];

  const barSeries = participantSeries.filter((series) =>
    series.data.some((value) => value > 0)
  );

  const barOptions = {
    chart: { toolbar: { show: false }, stacked: false },
    plotOptions: {
      bar: { columnWidth: '55%', borderRadius: 5 },
    },
    grid: { borderColor: '#e4e4e7' },
    colors: barSeries.map(
      (series) => participantColors[series.name] || '#94a3b8'
    ),
    legend: { position: 'bottom' as const },
    xaxis: {
      categories: summary?.days.map((day) => day.label) ?? [],
      labels: { style: { colors: '#71717a' } },
    },
    yaxis: {
      labels: { style: { colors: '#71717a' } },
    },
    tooltip: {
      custom: ({
        dataPointIndex,
        seriesIndex,
      }: {
        dataPointIndex: number;
        seriesIndex: number;
      }) => {
        const day = summary?.days[dataPointIndex];
        if (!day) return '';
        const series = barSeries[seriesIndex];
        if (!series) return '';
        const participant = day.participants.find(
          (item) => item.name === series.name
        );
        const tasksHtml = participant?.tasks
          .map((task) => `${task.title} (${task.count})`)
          .join('<br/>');
        return `\n          <div class=\"px-3 py-2\">\n            <strong>${day.label} - ${series.name}</strong><br/>\n            ${tasksHtml || 'Sem tarefas'}\n          </div>\n        `;
      },
    },
  };

  const streakRanking = [...(summary?.participants ?? [])].sort(
    (a, b) => b.current_streak - a.current_streak
  );

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-5">
        <div>
          <h1 className="text-[40px] font-semibold leading-none text-zinc-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Planeje, priorize e acompanhe a rotina da casa com clareza.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tarefas"
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Abrir tarefas
          </Link>
          <button
            type="button"
            className="rounded-full border border-emerald-700 px-5 py-2 text-sm font-semibold text-emerald-800"
          >
            Visao de dados
          </button>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-900/30 bg-[linear-gradient(145deg,#17633f_0%,#1f8554_100%)] p-5 text-white">
          <p className="text-sm text-emerald-100">Total no periodo</p>
          <p className="mt-1 text-5xl font-semibold leading-none">
            {summary?.total ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Participantes ativos</p>
          <p className="mt-1 text-5xl font-semibold leading-none text-zinc-900">
            {summary?.participants.length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Dias monitorados</p>
          <p className="mt-1 text-5xl font-semibold leading-none text-zinc-900">
            {summaryPeriod === 'weekly' ? 7 : 30}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Maior streak atual</p>
          <p className="mt-1 text-5xl font-semibold leading-none text-zinc-900">
            {streakRanking[0]?.current_streak ?? 0}
          </p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Resumo</h2>
            <p className="text-sm text-zinc-500">
              {summaryPeriod === 'weekly' ? 'Ultimos 7 dias' : 'Ultimos 30 dias'}
            </p>
          </div>
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-1">
            {['weekly', 'monthly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() =>
                  setSummaryPeriod(period as typeof summaryPeriod)
                }
                className={`rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  summaryPeriod === period
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {period === 'weekly' ? 'Semanal' : 'Mensal'}
              </button>
            ))}
          </div>
        </div>

        {summaryLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
            Carregando resumo...
          </div>
        ) : !summary ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
            Nenhum dado disponivel.
          </div>
        ) : (
          <div className="grid gap-4">
            {summaryPeriod !== 'monthly' ? (
              <div className="grid gap-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-base font-semibold text-zinc-900">Donut por participante</p>
                    <div className="mt-3 flex w-full items-center justify-center">
                      <ApexChart
                        type="donut"
                        width="100%"
                        height={280}
                        series={donutSeries}
                        options={donutOptions}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-base font-semibold text-zinc-900">Conclusoes por dia</p>
                    <div className="mt-3 w-full">
                      <ApexChart
                        type="bar"
                        width="100%"
                        height={280}
                        series={barSeries}
                        options={barOptions}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-base font-semibold text-zinc-900">Streak atual por participante</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {streakRanking.map((participant) => (
                      <div
                        key={participant.id}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-zinc-800">
                          {participant.name}
                        </p>
                        <p className="text-3xl font-semibold leading-none text-zinc-900">
                          {participant.current_streak}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          dia(s) seguidos com ao menos 1 tarefa.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-base font-semibold text-zinc-900">Conclusoes por dia</p>
                  <div className="mt-3 w-full">
                    <ApexChart
                      type="bar"
                      width="100%"
                      height={280}
                      series={barSeries}
                      options={barOptions}
                    />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-base font-semibold text-zinc-900">Donut por participante</p>
                    <div className="mt-3 flex w-full items-center justify-center">
                      <ApexChart
                        type="donut"
                        width="100%"
                        height={280}
                        series={donutSeries}
                        options={donutOptions}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-base font-semibold text-zinc-900">Streak atual por participante</p>
                    <div className="mt-3 grid gap-3">
                      {streakRanking.map((participant) => (
                        <div
                          key={participant.id}
                          className="rounded-xl border border-zinc-200 bg-white px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-zinc-800">
                            {participant.name}
                          </p>
                          <p className="text-3xl font-semibold leading-none text-zinc-900">
                            {participant.current_streak}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            dia(s) seguidos com ao menos 1 tarefa.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
