import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseAdmin();
  const { id } = await params;
  const body = await request.json();
  const completedBy = String(body?.completedBy || '').trim();

  if (!completedBy) {
    return NextResponse.json(
      { error: 'Informe quem concluiu a tarefa.' },
      { status: 400 }
    );
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, is_one_and_done')
    .eq('id', id)
    .single();

  if (taskError) {
    return NextResponse.json(
      { error: taskError.message },
      { status: 500 }
    );
  }

  if (!task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada.' },
      { status: 404 }
    );
  }

  const { error: completionError } = await supabase
    .from('task_completions')
    .insert({ task_id: id, completed_by: completedBy });

  if (completionError) {
    return NextResponse.json(
      { error: completionError.message },
      { status: 500 }
    );
  }

  if (task.is_one_and_done) {
    const { error: archiveError } = await supabase
      .from('tasks')
      .update({ is_archived: true })
      .eq('id', id);

    if (archiveError) {
      return NextResponse.json(
        { error: archiveError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
