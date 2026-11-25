import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function GET() {
  const db = getDb();
  const qcReports = db.prepare('SELECT * FROM qc_reports ORDER BY created_at DESC').all() as Array<Record<string, unknown>>;

  const reportsDir = path.resolve(process.cwd(), 'projects', 'police-reference', 'reports');
  const docsDir = path.resolve(process.cwd(), 'docs');

  const collectFiles = (dir: string, labelPrefix: string) => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.jsonl'))
      .map((f) => {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        return {
          id: `${labelPrefix}/${f}`,
          name: f,
          folder: labelPrefix,
          sizeBytes: stat.size,
          updatedAt: stat.mtime.toISOString(),
          preview:
            f.endsWith('.md') || stat.size < 16384
              ? fs.readFileSync(full, 'utf8').slice(0, 4000)
              : 'Large structured manifest file on disk.',
        };
      });
  };

  return NextResponse.json({
    qcReports: qcReports.map((r) => ({
      reportId: String(r.report_id),
      projectId: String(r.project_id),
      versionNumber: Number(r.version_number),
      status: String(r.status),
      issues: JSON.parse(String(r.issues_json ?? '[]')),
      summaryMd: String(r.summary_md),
      createdAt: String(r.created_at),
    })),
    artifacts: [
      ...collectFiles(reportsDir, 'projects/police-reference/reports'),
      ...collectFiles(docsDir, 'docs'),
    ],
  });
}
