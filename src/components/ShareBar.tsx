import { useRef, useState } from 'react';
import { download, fromJSON, logFromJSON, slug, toBackup, toJSON, toLink, toPlainText } from '../lib/share';
import type { Routine, SessionLog } from '../types';

interface Props {
  routines: Routine[];
  active: Routine;
  log: SessionLog[];
  onImport: (routines: Routine[]) => void;
  onImportLog: (log: SessionLog[]) => void;
}

export default function ShareBar({ routines, active, log, onImport, onImportLog }: Props) {
  const [open, setOpen] = useState(false);
  const [paste, setPaste] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (t: string) => {
    setMsg(t);
    window.setTimeout(() => setMsg(''), 2500);
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${what} copied`);
    } catch {
      flash('Clipboard blocked — use the file instead');
    }
  };

  const take = (text: string) => {
    const routinesIn = fromJSON(text);
    const logIn = logFromJSON(text);
    if (!routinesIn.length && !logIn.length) return flash('No routines or history found in that file');
    if (routinesIn.length) onImport(routinesIn);
    if (logIn.length) onImportLog(logIn);
    setOpen(false);
    const bits = [
      routinesIn.length ? `${routinesIn.length} routine${routinesIn.length > 1 ? 's' : ''}` : '',
      logIn.length ? `${logIn.length} logged session${logIn.length > 1 ? 's' : ''}` : '',
    ].filter(Boolean);
    flash(`Added ${bits.join(' and ')}`);
  };

  const takeFile = async (file: File) => take(await file.text());

  const takePaste = () => {
    take(paste);
    setPaste('');
  };

  return (
    <div className="share-bar">
      <div className="row">
        <button onClick={() => download(`${slug(active.name)}.json`, toJSON([active]))}>Save this routine</button>
        <button onClick={() => download('body-io-routines.json', toJSON(routines))}>Save all</button>
        <button
          onClick={() => download(`body-io-backup-${new Date().toISOString().slice(0, 10)}.json`, toBackup(routines, log))}
          title="Routines plus every logged session"
        >
          Back up everything
        </button>
        <button onClick={() => copy(toLink(active), 'Link')}>Copy link</button>
        <button onClick={() => copy(toPlainText(active), 'Routine')}>Copy as text</button>
        <button onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : 'Import'}</button>
      </div>

      {open && (
        <div className="import">
          <button className="go" onClick={() => fileRef.current?.click()}>
            Choose a file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) takeFile(f);
              e.target.value = '';
            }}
          />
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="…or paste a saved routine or backup here"
            rows={4}
          />
          <button onClick={takePaste} disabled={!paste.trim()}>
            Add pasted routine
          </button>
        </div>
      )}

      {msg && <p className="share-msg">{msg}</p>}
    </div>
  );
}
