import type { ComponentType } from 'react';

export type Task = {
  id: string;
  title: string;
  is_one_and_done: boolean;
  is_archived: boolean;
  recurrence_type: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_days: number[] | null;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string;
  completed_by: string;
  participant_id: string | null;
  completed_at: string;
};

export type Participant = {
  id: string;
  name: string;
  created_at: string;
};

export type SummaryTask = {
  title: string;
  count: number;
};

export type SummaryParticipant = {
  id: string;
  name: string;
  count: number;
  tasks: SummaryTask[];
};

export type SummaryDay = {
  date: string;
  label: string;
  count: number;
  tasks: SummaryTask[];
  participants: SummaryParticipant[];
};

export type SummaryResponse = {
  period: 'weekly' | 'monthly';
  range: { start: string; end: string };
  total: number;
  participants: SummaryParticipant[];
  days: SummaryDay[];
};

export type TaskWithLast = Task & {
  last_completion: Pick<TaskCompletion, 'completed_by' | 'completed_at'> | null;
  next_due: string | null;
};

export type SidebarItem = {
  title: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
};
