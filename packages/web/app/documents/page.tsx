'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { EmptyState } from '@/components/ui/empty-state';
import { Disclosure } from '@/components/ui/disclosure';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { api, ApiError } from '@/lib/api';
import { FileText, Lock, ShieldCheck, PlusCircle, Scan, PenTool } from 'lucide-react';

interface Drawing {
  id: string;
  title: string;
  drawingCode: string;
  version: string;
  fileUrl: string;
  approvedBy: string;
  createdAt: string;
}

interface OcrLog {
  id: string;
  fileName: string;
  extractedText: string;
  processedAt: string;
}

interface DigitalSignature {
  id: string;
  documentTitle: string;
  signerName: string;
  signedAt: string;
  certificateHash: string;
}

export default function DocumentsPage() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [ocrLogs, setOcrLogs] = useState<OcrLog[]>([]);
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [drawingTitle, setDrawingTitle] = useState('');
  const [version, setVersion] = useState('v1.0');

  const [docTitle, setDocTitle] = useState('');
  const [signerName, setSignerName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dwg, ocr, sig] = await Promise.all([
        api.get<Drawing[]>('/legal/drawings'),
        api.get<OcrLog[]>('/legal/ocr-logs'),
        api.get<DigitalSignature[]>('/legal/digital-signatures'),
      ]);
      setDrawings(dwg);
      setOcrLogs(ocr);
      setSignatures(sig);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load Document Vault data');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateDrawing = async () => {
    if (!drawingTitle) return;
    setBusy(true);
    try {
      await api.post('/legal/drawings', {
        title: drawingTitle,
        version,
      });
      setDrawingTitle('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to register architectural drawing');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateSignature = async () => {
    if (!docTitle || !signerName) return;
    setBusy(true);
    try {
      await api.post('/legal/digital-signatures', {
        documentTitle: docTitle,
        signerName,
      });
      setDocTitle('');
      setSignerName('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to log digital signature');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Document Intelligence & Architectural Drawing Vault"
        description="CAD blueprints version control, OCR contract clause extraction, and Aadhaar eSign digital signature logs."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={FileText} tone="brand" value={String(drawings.length)} label="CAD Blueprints" sub="Version controlled" />
        <Stat icon={Scan} tone="blue" value={String(ocrLogs.length)} label="OCR Clause Scans" sub="Contract analysis" />
        <Stat icon={PenTool} tone="green" value={String(signatures.length)} label="Digital Signatures" sub="Aadhaar / eSign Hash" />
        <Stat icon={ShieldCheck} tone="amber" value="v1.0 - v2.0" label="Revision System" sub="Architect Approved" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Upload Revised Architectural CAD Drawing">
          <div className="space-y-3">
            <Field label="Drawing Title" placeholder="e.g. Tower A Structural Rebar Elevation Plan" value={drawingTitle} onChange={(e) => setDrawingTitle(e.target.value)} />
            <Field label="Revision Version Tag" value={version} onChange={(e) => setVersion(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !drawingTitle} onClick={handleCreateDrawing}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Upload CAD Revision
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Log Executed Digital Signature (Aadhaar / eSign)">
          <div className="space-y-3">
            <Field label="Document Title" placeholder="e.g. Customer Agreement - Unit A-304" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
            <Field label="Signer Full Name" placeholder="e.g. Rajesh Malhotra" value={signerName} onChange={(e) => setSignerName(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !docTitle || !signerName} onClick={handleCreateSignature}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Log Digital Signature
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Architectural CAD Drawings Table */}
      <Card>
        <CardHeader title="CAD Blueprint Version Vault" description="Controlled revisions and architect approvals" />
        <CardBody className="p-0 overflow-x-auto">
          {drawings.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No architectural drawings registered.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Drawing Code</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Approved By</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {drawings.map((dwg) => (
                  <tr key={dwg.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-mono font-semibold text-zinc-300">{dwg.drawingCode}</td>
                    <td className="p-3.5 font-medium text-zinc-100">{dwg.title}</td>
                    <td className="p-3.5"><Badge tone="green">{dwg.version}</Badge></td>
                    <td className="p-3.5 text-zinc-400">{dwg.approvedBy}</td>
                    <td className="p-3.5 text-zinc-400">{new Date(dwg.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
