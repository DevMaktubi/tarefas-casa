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
