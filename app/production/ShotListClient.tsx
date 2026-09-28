"use client";

import { useMemo, useState } from "react";

type ScriptRow = {
  id: number;
  title: string;
  body_black: string;
  body_red: string;
  body_green: string;
};

function toLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export default function ShotListClient({ scripts }: { scripts: ScriptRow[] }) {
  const [scriptId, setScriptId] = useState<string>("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const script = scripts.find((s) => String(s.id) === scriptId);
  const dialogueLines = useMemo(() => (script ? toLines(script.body_black) : []), [script]);
  const actionLines = useMemo(() => (script ? toLines(script.body_red) : []), [script]);
  const editLines = useMemo(() => (script ? toLines(script.body_green) : []), [script]);

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  return (
    <div>
      <select
        value={scriptId}
        onChange={(e) => {
          setScriptId(e.target.value);
          setChecked({});
        }}
        className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5 mb-4"
      >
        <option value="">Select a saved script…</option>
        {scripts.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>

      {script && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Film — line by line (black)</h4>
            <ul className="space-y-1.5">
              {dialogueLines.map((line, i) => {
                const key = `d${i}`;
                return (
                  <li key={key}>
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} className="mt-1" />
                      <span className={checked[key] ? "line-through text-muted" : ""}>{line}</span>
                    </label>
                  </li>
                );
              })}
              {dialogueLines.length === 0 && <p className="text-xs text-muted">No dialogue lines.</p>}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-red-400">Camera / actions (red)</h4>
            <ul className="space-y-1.5 mb-4">
              {actionLines.map((line, i) => {
                const key = `a${i}`;
                return (
                  <li key={key}>
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} className="mt-1" />
                      <span className={checked[key] ? "line-through text-muted" : ""}>{line}</span>
                    </label>
                  </li>
                );
              })}
              {actionLines.length === 0 && <p className="text-xs text-muted">No action notes.</p>}
            </ul>
            <h4 className="text-sm font-medium mb-2 text-green-400">Editing notes (green)</h4>
            <ul className="space-y-1.5">
              {editLines.map((line, i) => (
                <li key={`e${i}`} className="text-sm text-muted">
                  • {line}
                </li>
              ))}
              {editLines.length === 0 && <p className="text-xs text-muted">No editing notes.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
