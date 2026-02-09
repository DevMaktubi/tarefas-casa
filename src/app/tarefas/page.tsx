'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TaskWithLast } from '@/lib/types';

const PARTICIPANTS = ['Eu', 'Namorada'];

function formatDate(value?: string | null) {
  if (!value) return 'Nunca';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Data invalida'
    : date.toLocaleString('pt-BR');
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithLast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [isOneAndDone, setIsOneAndDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const pendingCount = useMemo(
    () => tasks.filter((task) => !task.is_archived).length,
    [tasks]
  );

  async function fetchTasks() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao carregar tarefas.');
      }
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed, isOneAndDone: isOneAndDone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao criar tarefa.');
      }
      setTitle('');
      setIsOneAndDone(false);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(taskId: string, completedBy: string) {
    setError('');
    if (!taskId) {
      setError('Tarefa invalida. Recarregue a pagina.');
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao marcar tarefa.');
      }
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Casa em dia
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Tarefas compartilhadas
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Organize quem fez o que e mantenha tudo visivel. As tarefas ficam
          ativas por padrao, a menos que sejam marcadas como one and done.
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Nova tarefa</h2>
            <p className="text-sm text-slate-500">
              {pendingCount} tarefa(s) ativa(s)
            </p>
          </div>
          <button
            onClick={fetchTasks}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            type="button"
          >
            Atualizar
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-[1fr_auto]"
        >
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Lavar louca, limpar banheiro"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-slate-400 focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isOneAndDone}
                onChange={(event) => setIsOneAndDone(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              Marcar como one and done (arquiva ao concluir)
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Lista de tarefas</h2>
        {loading ? (
          <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-lg shadow-slate-200/60">
            Carregando tarefas...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-lg shadow-slate-200/60">
            Nenhuma tarefa criada ainda.
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks
              .filter((task) => task.id)
              .map((task) => (
                <article
                  key={task.id}
                  className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-sm text-slate-500">
                        Ultima vez:{' '}
                        {formatDate(task.last_completion?.completed_at)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Por: {task.last_completion?.completed_by || 'Ninguem ainda'}
                      </p>
                      {task.is_one_and_done && (
                        <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          One and done
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PARTICIPANTS.map((name) => (
                        <button
                          key={name}
                          onClick={() => handleComplete(task.id, name)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                          type="button"
                        >
                          {name} fez
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
