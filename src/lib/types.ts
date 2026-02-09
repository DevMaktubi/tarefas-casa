import type { ComponentType } from 'react';

export type Task = {
  id: string;
  title: string;
  is_one_and_done: boolean;
  is_archived: boolean;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string;
  completed_by: string;
  completed_at: string;
};

export type TaskWithLast = Task & {
  last_completion: Pick<TaskCompletion, 'completed_by' | 'completed_at'> | null;
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
