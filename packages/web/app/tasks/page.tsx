'use client';

import { useEffect, useState, useCallback } from 'react';
import { ListChecks } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Task, Employee } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

const TONE: Record<string, 'neutral' | 'amber' | 'blue' | 'green'> = {
  open: 'neutral',
  in_progress: 'blue',
  in_qa: 'amber',
  closed: 'green',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Task Tracking</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Assignment, reassignment audit trail (mandatory reason + before/after assignee), and
          early-completion flagging against target deadline.
        </p>
      </div>

      <Card>
        <CardHeader title="New task" />
        <CardBody>
          <div className="grid grid-cols-5 gap-3">
            <input className="input col-span-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="input" value={assignerId} onChange={(e) => setAssignerId(e.target.value)}>
              <option value="">Assigner</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select className="input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Assignee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <input
              className="input"
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
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
          {employees.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500">Add employees under HR before creating tasks.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Tasks" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : tasks.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={ListChecks} title="No tasks yet" description="Create your first task above." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Title</Th>
                <Th>Deadline</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {tasks.map((t) => (
                  <Tr key={t.id}>
                    <Td className="font-medium text-zinc-900">{t.title}</Td>
                    <Td>{new Date(t.targetDeadline).toLocaleString()}</Td>
                    <Td>
                      <Badge tone={TONE[t.status]}>{t.status}</Badge>
                      {t.closedEarly && (
                        <Badge tone="green">early</Badge>
                      )}
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
