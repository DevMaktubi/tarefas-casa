import Link from 'next/link';

export default function OverviewPage() {
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
    </div>
  );
}
