'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Task, Employee } from '@/lib/types-extra';
import type { TaskStatus } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Disclosure } from '@/components/ui/disclosure';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';

const TONE: Record<TaskStatus, 'neutral' | 'amber' | 'blue' | 'green'> = {
  open: 'neutral',
  in_progress: 'blue',
  in_qa: 'amber',
  closed: 'green',
};

const TASK_STATUSES: TaskStatus[] = ['open', 'in_progress', 'in_qa', 'closed'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [title, setTitle] = useState('');
  const [assignerId, setAssignerId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, e] = await Promise.all([api.get<Task[]>('/tasks'), api.get<Employee[]>('/employees')]);
      setTasks(t);
      setEmployees(e);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to reach API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTasks = useMemo(
    () => (statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter)),
    [tasks, statusFilter],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Task Tracking"
        description="Assignment, reassignment audit trail (mandatory reason + before/after assignee), and early-completion flagging against target deadline."
      />

      <Disclosure title="New task" defaultOpen={tasks.length === 0 && employees.length > 0}>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Select
            label="Assigner"
            value={assignerId}
            onChange={(e) => setAssignerId(e.target.value)}
            disabled={employees.length === 0}
          >
            <option value="">{employees.length === 0 ? 'No employees yet' : 'Select assigner'}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            disabled={employees.length === 0}
          >
            <option value="">{employees.length === 0 ? 'No employees yet' : 'Select assignee'}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
          <Field
            label="Target deadline"
            type="datetime-local"
            value={targetDeadline}
            onChange={(e) => setTargetDeadline(e.target.value)}
          />
        </div>
        <Button
          className="mt-3"
          size="sm"
          disabled={busy || !title || !assignerId || !assigneeId || !targetDeadline}
          onClick={async () => {
            setBusy(true);
            try {
              await api.post('/tasks', {
                title,
                assignerId,
                assigneeId,
                targetDeadline: new Date(targetDeadline).toISOString(),
              });
              setTitle('');
              await load();
            } catch (e) {
              setErr(e instanceof ApiError ? e.message : 'Request failed');
            } finally {
              setBusy(false);
            }
          }}
        >
          Create task
        </Button>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
        {employees.length === 0 && (
          <p className="mt-3 text-sm text-ink-2">Add employees under HR before creating tasks.</p>
        )}
      </Disclosure>

      <Card>
        <CardHeader
          title="Tasks"
          actions={
            tasks.length > 0 && (
              <Select
                aria-label="Filter by status"
                className="h-8 w-36 text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            )
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton cols={3} />
          ) : tasks.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={ListChecks} title="No tasks yet" description="Create your first task above." />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={ListChecks} title="No matching tasks" description="Try a different status filter." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Title</Th>
                <Th>Deadline</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <Tr key={t.id}>
                    <Td className="font-medium text-ink">{t.title}</Td>
                    <Td>{new Date(t.targetDeadline).toLocaleString()}</Td>
                    <Td>
                      <Badge tone={TONE[t.status]}>{t.status}</Badge>
                      {t.closedEarly && <Badge tone="green">early</Badge>}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
