import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

const PERIOD_DAYS = {
  weekly: 7,
  monthly: 30,
} as const;

type Period = keyof typeof PERIOD_DAYS;

type SummaryTask = {
  title: string;
  count: number;
};

type ParticipantSummary = {
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
  participants: ParticipantSummary[];
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
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
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - (PERIOD_DAYS[period] - 1));

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
    .gte('completed_at', start.toISOString())
    .lte('completed_at', now.toISOString())
    .order('completed_at', { ascending: true });

  if (completionsError) {
    return NextResponse.json(
      { error: completionsError.message },
      { status: 500 }
    );
  }

  const dayMap = new Map<string, DaySummary>();
  const participantMap = new Map<string, ParticipantSummary>();

  (participants || []).forEach((participant) => {
    participantMap.set(participant.id, {
      id: participant.id,
      name: participant.name,
      count: 0,
      tasks: [],
    });
  });

  const dayCursor = startOfDay(start);
  for (let i = 0; i < PERIOD_DAYS[period]; i += 1) {
    const key = formatDateKey(dayCursor);
    dayMap.set(key, {
      date: key,
      label: formatLabel(dayCursor),
      count: 0,
      tasks: [],
      participants: [],
    });
    dayCursor.setDate(dayCursor.getDate() + 1);
  }

  (completions || []).forEach((completion) => {
    const completedAt = new Date(completion.completed_at as string);
    const dayKey = formatDateKey(completedAt);
    const taskTitle = (completion.tasks as { title: string } | null)?.title ||
      'Tarefa';
    const participantId = completion.participant_id as string | null;
    const participantName =
      (completion.participants as { name: string } | null)?.name ||
      'Desconhecido';

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
          } as ParticipantSummary);

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
      start: start.toISOString(),
      end: now.toISOString(),
    },
    total,
    participants: participantsSummary,
    days,
  });
}
