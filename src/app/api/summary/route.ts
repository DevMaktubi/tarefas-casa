import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

const PERIOD_DAYS = {
  weekly: 7,
  monthly: 30,
} as const;
const APP_TIMEZONE = 'America/Sao_Paulo';
export const dynamic = 'force-dynamic';

type Period = keyof typeof PERIOD_DAYS;

type SummaryTask = {
  title: string;
  count: number;
};

type ParticipantSummary = {
  id: string;
  name: string;
  count: number;
  current_streak: number;
  tasks: SummaryTask[];
};

type DayParticipantSummary = {
  id: string;
  name: string;
  count: number;
  tasks: SummaryTask[];
};

type DaySummary = {
  date: string;
  label: string;
  count: number;
  tasks: SummaryTask[];
  participants: DayParticipantSummary[];
};

function formatDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addDaysToDateKey(dateKey: string, delta: number) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: APP_TIMEZONE,
  });
}

function getJoinedName(
  value: { name: string } | { name: string }[] | null
) {
  if (!value) return null;
  if (Array.isArray(value)) return value[0]?.name ?? null;
  return value.name;
}

function getTaskTitle(
  value: { title: string } | { title: string }[] | null
) {
  if (!value) return null;
  if (Array.isArray(value)) return value[0]?.title ?? null;
  return value.title;
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') || 'weekly') as Period;

  if (!Object.keys(PERIOD_DAYS).includes(period)) {
    return NextResponse.json(
      { error: 'Periodo invalido.' },
      { status: 400 }
    );
  }

  const now = new Date();
  const todayKey = formatDateKey(now);
  const startKey = addDaysToDateKey(todayKey, -(PERIOD_DAYS[period] - 1));
  const queryStart = new Date(now);
  queryStart.setUTCDate(queryStart.getUTCDate() - (PERIOD_DAYS[period] + 2));

  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('id, name')
    .order('name', { ascending: true });

  if (participantsError) {
    return NextResponse.json(
      { error: participantsError.message },
      { status: 500 }
    );
  }

  const { data: completions, error: completionsError } = await supabase
    .from('task_completions')
    .select('completed_at, task_id, tasks(title), participant_id, participants(name)')
    .gte('completed_at', queryStart.toISOString())
    .lte('completed_at', now.toISOString())
    .order('completed_at', { ascending: true });

  if (completionsError) {
    return NextResponse.json(
      { error: completionsError.message },
      { status: 500 }
    );
  }

  const { data: allCompletions, error: allCompletionsError } = await supabase
    .from('task_completions')
    .select('completed_at, participant_id')
    .not('participant_id', 'is', null)
    .lte('completed_at', now.toISOString())
    .order('completed_at', { ascending: true });

  if (allCompletionsError) {
    return NextResponse.json(
      { error: allCompletionsError.message },
      { status: 500 }
    );
  }

  const dayMap = new Map<string, DaySummary>();
  const participantMap = new Map<string, ParticipantSummary>();
  const participantCompletionDays = new Map<string, Set<string>>();

  (participants || []).forEach((participant) => {
    participantMap.set(participant.id, {
      id: participant.id,
      name: participant.name,
      count: 0,
      current_streak: 0,
      tasks: [],
    });
    participantCompletionDays.set(participant.id, new Set<string>());
  });

  for (let i = 0; i < PERIOD_DAYS[period]; i += 1) {
    const key = addDaysToDateKey(startKey, i);
    dayMap.set(key, {
      date: key,
      label: formatLabel(parseDateKey(key)),
      count: 0,
      tasks: [],
      participants: [],
    });
  }

  (completions || []).forEach((completion) => {
    const completedAt = new Date(completion.completed_at as string);
    const dayKey = formatDateKey(completedAt);
    const taskTitle = getTaskTitle(
      completion.tasks as { title: string } | { title: string }[] | null
    ) || 'Tarefa';
    const participantId = completion.participant_id as string | null;
    const participantName =
      getJoinedName(
        completion.participants as
          | { name: string }
          | { name: string }[]
          | null
      ) || 'Desconhecido';

    const dayEntry = dayMap.get(dayKey);
    if (dayEntry) {
      dayEntry.count += 1;
      const existingTask = dayEntry.tasks.find(
        (task) => task.title === taskTitle
      );
      if (existingTask) {
        existingTask.count += 1;
      } else {
        dayEntry.tasks.push({ title: taskTitle, count: 1 });
      }

      if (participantId) {
        const dayParticipant =
          dayEntry.participants.find((participant) => participant.id === participantId) ||
          ({
            id: participantId,
            name: participantName,
            count: 0,
            tasks: [],
          } as DayParticipantSummary);

        dayParticipant.count += 1;
        const dayParticipantTask = dayParticipant.tasks.find(
          (task) => task.title === taskTitle
        );
        if (dayParticipantTask) {
          dayParticipantTask.count += 1;
        } else {
          dayParticipant.tasks.push({ title: taskTitle, count: 1 });
        }

        if (
          !dayEntry.participants.some(
            (participant) => participant.id === participantId
          )
        ) {
          dayEntry.participants.push(dayParticipant);
        }
      }
    }

    if (participantId) {
      const participantEntry =
        participantMap.get(participantId) ||
        ({
          id: participantId,
          name: participantName,
          count: 0,
          current_streak: 0,
          tasks: [],
        } as ParticipantSummary);

      participantEntry.count += 1;
      const participantTask = participantEntry.tasks.find(
        (task) => task.title === taskTitle
      );
      if (participantTask) {
        participantTask.count += 1;
      } else {
        participantEntry.tasks.push({ title: taskTitle, count: 1 });
      }

      participantMap.set(participantId, participantEntry);
    }
  });

  (allCompletions || []).forEach((completion) => {
    const participantId = completion.participant_id as string | null;
    if (!participantId) return;
    const dayKey = formatDateKey(new Date(completion.completed_at as string));
    const days = participantCompletionDays.get(participantId) || new Set<string>();
    days.add(dayKey);
    participantCompletionDays.set(participantId, days);
  });

  const yesterdayKey = addDaysToDateKey(todayKey, -1);

  participantMap.forEach((participant, participantId) => {
    const days = participantCompletionDays.get(participantId) || new Set<string>();
    const hasToday = days.has(todayKey);
    const hasYesterday = days.has(yesterdayKey);

    if (!hasToday && !hasYesterday) {
      participant.current_streak = 0;
      return;
    }

    let streak = 0;
    let cursorKey = hasToday ? todayKey : yesterdayKey;
    while (days.has(cursorKey)) {
      streak += 1;
      cursorKey = addDaysToDateKey(cursorKey, -1);
    }
    participant.current_streak = streak;
  });

  const days = Array.from(dayMap.values()).map((day) => ({
    ...day,
    tasks: day.tasks.sort((a, b) => b.count - a.count),
    participants: day.participants.map((participant) => ({
      ...participant,
      tasks: participant.tasks.sort((a, b) => b.count - a.count),
    })),
  }));
  const participantsSummary = Array.from(participantMap.values()).map(
    (participant) => ({
      ...participant,
      tasks: participant.tasks.sort((a, b) => b.count - a.count),
    })
  );

  const total = participantsSummary.reduce(
    (sum, participant) => sum + participant.count,
    0
  );

  return NextResponse.json({
    period,
    range: {
      start: queryStart.toISOString(),
      end: now.toISOString(),
    },
    total,
    participants: participantsSummary,
    days,
  });
}
