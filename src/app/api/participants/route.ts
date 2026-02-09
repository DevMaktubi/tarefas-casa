import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participants: data ?? [] });
}
