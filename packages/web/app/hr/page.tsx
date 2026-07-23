'use client';

import { useEffect, useState, useCallback } from 'react';
import { IdCard } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Employee } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

export default function HrPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setEmployees(await api.get<Employee[]>('/employees'));
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
        <h1 className="text-lg font-semibold text-zinc-900">HR</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Employee directory. Login/logout session auditing (IP, device, duration) is available via
          POST /employees/:id/sessions and POST /employee-sessions/:id/logout.
        </p>
      </div>

      <Card>
        <CardHeader title="New employee" />
        <CardBody>
          <div className="grid grid-cols-4 gap-3">
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <Button
              disabled={busy || !name || !email || !role}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post('/employees', { name, email, role });
                  setName('');
                  setEmail('');
                  setRole('');
                  await load();
                } catch (e) {
                  setErr(e instanceof ApiError ? e.message : 'Request failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add employee
            </Button>
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Directory" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : employees.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={IdCard} title="No employees yet" description="Add your first employee above." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
              </Thead>
              <tbody>
                {employees.map((e) => (
                  <Tr key={e.id}>
                    <Td className="font-medium text-zinc-900">{e.name}</Td>
                    <Td>{e.email}</Td>
                    <Td>{e.role}</Td>
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
