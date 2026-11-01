import { useMemo, useState } from 'react';
import { Download, FileCode, Folder, Copy, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { sourceFiles, buildZip } from '../lib/sourceFiles';

function download() {
  const url = URL.createObjectURL(buildZip());
  const a = document.createElement('a');
  a.href = url; a.download = 'openskill-source.zip'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function FileTree({ files, active, onPick }: { files: string[]; active: string; onPick: (p: string) => void }) {
  let lastDir = '';
  return (
    <div className="text-sm font-mono">
      {files.map((p) => {
        const parts = p.split('/');
        const dir = parts.slice(0, -1).join('/');
        const header = dir !== lastDir ? (lastDir = dir, (
          <div className="flex items-center gap-1.5 px-2 pt-3 pb-1 text-xs text-muted-foreground"><Folder className="h-3.5 w-3.5" />{dir || '/'}</div>
        )) : null;
        return (
          <div key={p}>
            {header}
            <button onClick={() => onPick(p)} className={`w-full text-left flex items-center gap-1.5 pl-6 pr-2 py-1 rounded truncate ${p === active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
              <FileCode className="h-3.5 w-3.5 shrink-0" />{parts[parts.length - 1]}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function SourcePage() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(sourceFiles.find((f) => f.path.endsWith('App.tsx'))?.path ?? sourceFiles[0]?.path ?? '');
  const files = useMemo(() => sourceFiles.map((f) => f.path).filter((p) => p.toLowerCase().includes(q.toLowerCase())), [q]);
  const file = sourceFiles.find((f) => f.path === active);
  const lines = file?.content.split('\n') ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Open source code</h1>
          <p className="text-muted-foreground mt-1">The full code of OpenSkill — {sourceFiles.length} files. Always matches the live site.</p>
        </div>
        <Button onClick={download}><Download className="h-4 w-4 mr-2" />Download ZIP</Button>
      </div>
      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        <aside className="border border-border rounded-lg p-2 md:max-h-[75vh] overflow-auto">
          <div className="relative mb-1"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter files" className="pl-8" /></div>
          <FileTree files={files} active={active} onPick={setActive} />
        </aside>
        <section className="border border-border rounded-lg overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
            <span className="font-mono text-sm truncate">{active}</span>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(file?.content ?? ''); toast('Copied'); }}><Copy className="h-4 w-4 mr-1" />Copy</Button>
          </div>
          <pre className="text-xs font-mono overflow-auto max-h-[70vh] p-4 leading-5">
            {lines.map((l, i) => (
              <div key={i} className="flex"><span className="select-none w-10 shrink-0 text-right pr-4 text-muted-foreground">{i + 1}</span><span className="whitespace-pre">{l}</span></div>
            ))}
          </pre>
        </section>
      </div>
    </div>
  );
}
