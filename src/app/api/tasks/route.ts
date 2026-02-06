import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import type { TaskCompletion, TaskWithLast } from '@/lib/types';

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
    .select('task_id, completed_by, completed_at')
    .in('task_id', taskIds)
    .order('completed_at', { ascending: false });

  if (completionsError) {
    return NextResponse.json(
      { error: completionsError.message },
      { status: 500 }
    );
  }

  const latestByTask = new Map<string, TaskWithLast['last_completion']>();

  (completions || []).forEach((completion) => {
    const typed = completion as TaskCompletion;
    if (!latestByTask.has(typed.task_id)) {
      latestByTask.set(typed.task_id, {
        completed_by: typed.completed_by,
        completed_at: typed.completed_at,
      });
    }
  });

  const tasksWithLast: TaskWithLast[] = tasks
    .filter((task) => Boolean(task.id))
    .map((task) => ({
      ...(task as TaskWithLast),
      last_completion: latestByTask.get(task.id) ?? null,
    }));

  return NextResponse.json({ tasks: tasksWithLast });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();
  const title = String(body?.title || '').trim();
  const isOneAndDone = Boolean(body?.isOneAndDone);

  if (!title) {
    return NextResponse.json(
      { error: 'Titulo e obrigatorio.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ title, is_one_and_done: isOneAndDone })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
