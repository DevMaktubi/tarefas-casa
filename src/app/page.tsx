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
      const response = await fetch(`/api/summary?period=${period}`);
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
    : ['#e2e8f0'];

  const donutOptions = {
    labels: donutLabels,
    colors: donutColors,
    legend: { position: 'bottom' as const },
    tooltip: {
      custom: ({ seriesIndex }: { seriesIndex: number }) => {
        if (!summary) return '';
        if (!donutHasData) {
          return '<div class=\"px-3 py-2\">Sem dados no periodo</div>';
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
      bar: { columnWidth: '55%' },
    },
    colors: barSeries.map(
      (series) => participantColors[series.name] || '#94a3b8'
    ),
    legend: { position: 'bottom' as const },
    xaxis: {
      categories: summary?.days.map((day) => day.label) ?? [],
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
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Casa em dia
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Visao geral</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Uma visao rapida do que precisa ser feito e de quem esta mantendo a
          casa em dia.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
          <h2 className="text-lg font-semibold">Atalhos rapidos</h2>
          <p className="text-sm text-slate-500">
            Acesse o que importa sem abrir menus extras.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/tarefas"
              className="group rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">Tarefas</p>
              <p className="text-xs text-slate-500">
                Crie e conclua atividades do dia.
              </p>
            </Link>
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-left">
              <p className="text-sm font-semibold text-slate-900">
                Proximos passos
              </p>
              <p className="text-xs text-slate-500">
                Espaco reservado para novos atalhos.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-200/60">
          <h2 className="text-lg font-semibold">Resumo da casa</h2>
          <p className="text-sm text-slate-200">
            Em breve, voce vai ver aqui um resumo das tarefas em andamento e
            quem concluiu mais atividades.
          </p>
          <div className="grid gap-3 rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              V1
            </p>
            <p className="text-sm">
              Quer adicionar mais visoes? A sidebar ja esta pronta para novas
              rotas.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Resumo</h2>
            <p className="text-sm text-slate-500">
              {summaryPeriod === 'weekly' ? 'Ultimos 7 dias' : 'Ultimos 30 dias'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['weekly', 'monthly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() =>
                  setSummaryPeriod(period as typeof summaryPeriod)
                }
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  summaryPeriod === period
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {period === 'weekly' ? 'Semanal' : 'Mensal'}
              </button>
            ))}
          </div>
        </div>

        {summaryLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Carregando resumo...
          </div>
        ) : !summary ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Nenhum dado disponivel.
          </div>
        ) : (
          <div className="grid gap-6">
            {summaryPeriod !== 'monthly' ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Total no periodo
                  </p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {summary.total}
                  </p>
                  <div className="mt-4 flex w-full items-center justify-center">
                    <ApexChart
                      type="donut"
                      width="100%"
                      height={260}
                      series={donutSeries}
                      options={donutOptions}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Conclusoes por dia
                  </p>
                  <div className="mt-4 w-full">
                    <ApexChart
                      type="bar"
                      width="100%"
                      height={260}
                      series={barSeries}
                      options={barOptions}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Conclusoes por dia
                  </p>
                  <div className="mt-4 w-full">
                    <ApexChart
                      type="bar"
                      width="100%"
                      height={260}
                      series={barSeries}
                      options={barOptions}
                    />
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Total no periodo
                    </p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {summary.total}
                    </p>
                    <div className="mt-4 flex w-full items-center justify-center">
                      <ApexChart
                        type="donut"
                        width="100%"
                        height={260}
                        series={donutSeries}
                        options={donutOptions}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Reservado
                    </p>
                    <p className="text-xs text-slate-500">
                      Espaco para uma nova visualizacao mensal.
                    </p>
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
