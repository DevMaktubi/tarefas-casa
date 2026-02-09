import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import type {
  Participant,
  Task,
  TaskCompletion,
  TaskWithLast,
} from '@/lib/types';

type RecurrenceType = 'daily' | 'weekly' | 'monthly';

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const maxDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0
  ).getDate();
  next.setDate(Math.min(day, maxDay));
  return next;
}

function normalizeWeekDays(days: number[]) {
  return Array.from(
    new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))
  ).sort((a, b) => a - b);
}

function nextFromWeekdays(
  base: Date,
  days: number[],
  includeToday: boolean
) {
  const normalized = normalizeWeekDays(days);
  if (normalized.length === 0) return null;
  const baseDay = base.getDay();
  const startOffset = includeToday ? 0 : 1;
  for (let offset = startOffset; offset <= 7; offset += 1) {
    const candidate = (baseDay + offset) % 7;
    if (normalized.includes(candidate)) {
      return addDays(base, offset);
    }
  }
  return addDays(base, 7);
}

function computeNextDue(
  task: Task,
  lastCompletion: TaskWithLast['last_completion']
) {
  if (task.is_one_and_done) return null;
  if (!task.recurrence_type) return null;

  const now = new Date();
  const lastDate = lastCompletion?.completed_at
    ? new Date(lastCompletion.completed_at)
    : null;

  switch (task.recurrence_type) {
    case 'daily': {
      const base = lastDate ?? now;
      const next = lastDate ? addDays(base, 1) : now;
      return next.toISOString();
    }
    case 'weekly': {
      if (task.recurrence_days && task.recurrence_days.length > 0) {
        const base = lastDate ?? now;
        const next = nextFromWeekdays(base, task.recurrence_days, !lastDate);
        return next ? next.toISOString() : null;
      }
      const base = lastDate ?? now;
      const next = lastDate ? addDays(base, 7) : now;
      return next.toISOString();
    }
    case 'monthly': {
      const base = lastDate ?? now;
      const next = lastDate ? addMonths(base, 1) : now;
      return next.toISOString();
    }
    default:
      return null;
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  if (tasksError) {
    return NextResponse.json(
      { error: tasksError.message },
      { status: 500 }
    );
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ tasks: [] });
  }

  const taskIds = tasks.map((task) => task.id);

  const { data: completions, error: completionsError } = await supabase
    .from('task_completions')
    .select('task_id, completed_by, completed_at, participant_id')
    .in('task_id', taskIds)
    .order('completed_at', { ascending: false });

  if (completionsError) {
    return NextResponse.json(
      { error: completionsError.message },
      { status: 500 }
    );
  }

  const latestByTask = new Map<string, TaskWithLast['last_completion']>();

  const participantIds = Array.from(
    new Set(
      (completions || [])
        .map((completion) => (completion as TaskCompletion).participant_id)
        .filter(Boolean)
    )
  ) as string[];

  const participantsById = new Map<string, Participant>();

  if (participantIds.length > 0) {
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, created_at')
      .in('id', participantIds);

    if (participantsError) {
      return NextResponse.json(
        { error: participantsError.message },
        { status: 500 }
      );
    }

    (participants || []).forEach((participant) => {
      participantsById.set(participant.id, participant as Participant);
    });
  }

  (completions || []).forEach((completion) => {
    const typed = completion as TaskCompletion;
    if (!latestByTask.has(typed.task_id)) {
      const participantName = typed.participant_id
        ? participantsById.get(typed.participant_id)?.name
        : null;
      latestByTask.set(typed.task_id, {
        completed_by: participantName || typed.completed_by,
        completed_at: typed.completed_at,
      });
    }
  });

  const tasksWithLast: TaskWithLast[] = tasks
    .filter((task) => Boolean(task.id))
    .map((task) => {
      const last = latestByTask.get(task.id) ?? null;
      const nextDue = computeNextDue(task as Task, last);
      return {
        ...(task as TaskWithLast),
        last_completion: last,
        next_due: nextDue,
      };
    })
    .sort((a, b) => {
      if (!a.next_due && !b.next_due) return 0;
      if (!a.next_due) return 1;
      if (!b.next_due) return -1;
      return new Date(a.next_due).getTime() - new Date(b.next_due).getTime();
    });

  return NextResponse.json({ tasks: tasksWithLast });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();
  const title = String(body?.title || '').trim();
  const isOneAndDone = Boolean(body?.isOneAndDone);
  const recurrenceType = body?.recurrenceType as RecurrenceType | undefined;
  const recurrenceDays = Array.isArray(body?.recurrenceDays)
    ? body.recurrenceDays.map((day: unknown) => Number(day))
    : null;

  if (!title) {
    return NextResponse.json(
      { error: 'Titulo e obrigatorio.' },
      { status: 400 }
    );
  }

  if (
    recurrenceType &&
    recurrenceType !== 'daily' &&
    recurrenceType !== 'weekly' &&
    recurrenceType !== 'monthly'
  ) {
    return NextResponse.json(
      { error: 'Tipo de recorrencia invalido.' },
      { status: 400 }
    );
  }

  const normalizedDays = recurrenceDays
    ? normalizeWeekDays(recurrenceDays)
    : null;

  const payload = {
    title,
    is_one_and_done: isOneAndDone,
    recurrence_type: isOneAndDone ? null : recurrenceType ?? null,
    recurrence_days:
      isOneAndDone || recurrenceType !== 'weekly'
        ? null
        : normalizedDays?.length
          ? normalizedDays
          : null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
