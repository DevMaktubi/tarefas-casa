'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Participant, TaskWithLast } from '@/lib/types';

const WEEK_DAYS = [
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sab', value: 6 },
  { label: 'Dom', value: 0 },
];

const RECURRENCE_LABEL: Record<'daily' | 'weekly' | 'monthly', string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

function formatDate(value?: string | null) {
  if (!value) return 'Nunca';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Data invalida'
    : date.toLocaleString('pt-BR');
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithLast[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [isOneAndDone, setIsOneAndDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completingKey, setCompletingKey] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<
    'daily' | 'weekly' | 'monthly' | ''
  >('');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [filterRecurrence, setFilterRecurrence] = useState<
    'all' | 'daily' | 'weekly' | 'monthly'
  >('all');

  const pendingCount = useMemo(
    () => tasks.filter((task) => !task.is_archived).length,
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    if (filterRecurrence === 'all') return tasks;
    return tasks.filter((task) => task.recurrence_type === filterRecurrence);
  }, [tasks, filterRecurrence]);

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

  async function fetchParticipants() {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao carregar participantes.');
      }
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    }
  }

  useEffect(() => {
    fetchTasks();
    fetchParticipants();
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
        body: JSON.stringify({
          title: trimmed,
          isOneAndDone,
          recurrenceType: recurrenceType || null,
          recurrenceDays,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao criar tarefa.');
      }
      setTitle('');
      setIsOneAndDone(false);
      setRecurrenceType('');
      setRecurrenceDays([]);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(taskId: string, participantId: string) {
    setError('');
    if (!taskId) {
      setError('Tarefa invalida. Recarregue a pagina.');
      return;
    }

    const key = `${taskId}-${participantId}`;
    setCompletingKey(key);
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao marcar tarefa.');
      }
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setCompletingKey('');
    }
  }

  function Spinner() {
    return (
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-700" />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
      <header className="rounded-2xl border border-zinc-200 bg-white px-5 py-5">
        <h1 className="text-[38px] font-semibold leading-none text-zinc-900">
          Tasks
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Crie tarefas, defina recorrencias e registre quem concluiu cada uma.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Nova tarefa</h2>
            <p className="text-sm text-zinc-500">
              {pendingCount} tarefa(s) ativa(s)
            </p>
          </div>
          <button
            onClick={async () => {
              setRefreshing(true);
              await fetchTasks();
              setRefreshing(false);
            }}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
            type="button"
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Atualizando
              </span>
            ) : (
              'Atualizar'
            )}
          </button>
        </div>

        <form onSubmit={handleCreate} className="grid gap-4 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Lavar louca, limpar banheiro"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-zinc-800 outline-none focus:border-emerald-700"
            />

            <div className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-zinc-700">Recorrencia</label>
                <select
                  value={recurrenceType}
                  onChange={(event) =>
                    setRecurrenceType(event.target.value as typeof recurrenceType)
                  }
                  disabled={isOneAndDone}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-100"
                >
                  <option value="">Sem recorrencia</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              {recurrenceType === 'weekly' && !isOneAndDone && (
                <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
                  {WEEK_DAYS.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={recurrenceDays.includes(day.value)}
                        onChange={(event) => {
                          setRecurrenceDays((prev) => {
                            if (event.target.checked) {
                              return [...prev, day.value];
                            }
                            return prev.filter((value) => value !== day.value);
                          });
                        }}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-700"
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              )}

              {isOneAndDone && (
                <p className="text-xs text-zinc-500">
                  Recorrencia desativada para tarefas one and done.
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={isOneAndDone}
                onChange={(event) => setIsOneAndDone(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-700"
              />
              Marcar como one and done (arquiva ao concluir)
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Salvando
              </span>
            ) : (
              'Adicionar'
            )}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-900">Lista de tarefas</h2>
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-1">
            {['all', 'daily', 'weekly', 'monthly'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setFilterRecurrence(filter as typeof filterRecurrence)
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  filterRecurrence === filter
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {filter === 'all'
                  ? 'Todas'
                  : RECURRENCE_LABEL[filter as 'daily' | 'weekly' | 'monthly']}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
            Carregando tarefas...
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
            Nenhuma tarefa encontrada com esse filtro.
          </div>
        ) : (
          <div className="grid gap-3">
            {visibleTasks
              .filter((task) => task.id)
              .map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-[240px] flex-col gap-1.5">
                      <h3 className="text-lg font-semibold text-zinc-900">{task.title}</h3>
                      <p className="text-sm text-zinc-600">
                        Ultima vez: {formatDate(task.last_completion?.completed_at)}
                      </p>
                      <p className="text-sm text-zinc-600">
                        Por: {task.last_completion?.completed_by || 'Ninguem ainda'}
                      </p>
                      <p className="text-sm text-zinc-600">
                        Proxima vez: {formatDate(task.next_due)}
                      </p>

                      {task.recurrence_type && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {RECURRENCE_LABEL[task.recurrence_type]}
                          {task.recurrence_type === 'weekly' &&
                            task.recurrence_days &&
                            task.recurrence_days.length > 0 && (
                              <span className="ml-2 text-zinc-400">
                                ({task.recurrence_days
                                  .map(
                                    (value) =>
                                      WEEK_DAYS.find((day) => day.value === value)
                                        ?.label
                                  )
                                  .filter(Boolean)
                                  .join(', ')})
                              </span>
                            )}
                        </p>
                      )}

                      {task.is_one_and_done && (
                        <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          One and done
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {participants.length === 0 ? (
                        <span className="text-xs text-zinc-400">
                          Nenhum participante cadastrado.
                        </span>
                      ) : (
                        participants.map((participant) => {
                          const key = `${task.id}-${participant.id}`;
                          const isCompleting = completingKey === key;
                          return (
                            <button
                              key={participant.id}
                              onClick={() => handleComplete(task.id, participant.id)}
                              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
                              type="button"
                              disabled={isCompleting}
                            >
                              {isCompleting ? (
                                <span className="flex items-center gap-2">
                                  <Spinner />
                                  Salvando
                                </span>
                              ) : (
                                `${participant.name} fez`
                              )}
                            </button>
                          );
                        })
                      )}
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
