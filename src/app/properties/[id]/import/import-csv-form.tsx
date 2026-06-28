"use client";

import { useRef, useState } from "react";
import { Button, Panel } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";
import { interpolate } from "@/lib/i18n";
import type { ImportResult } from "@/lib/import-actions";

export function ImportCsvForm({
  label,
  help,
  columns,
  importAction,
}: {
  label: string;
  help: string;
  columns: string;
  importAction: (formData: FormData) => Promise<ImportResult>;
}) {
  const { dict } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  return (
    <Panel title={label}>
      <p className="text-sm text-stone-500 mb-2">{help}</p>
      <p className="text-xs text-stone-400 mb-4 font-mono">{columns}</p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setImporting(true);
          setResult(null);
          try {
            const csvText = await file.text();
            const formData = new FormData();
            formData.set("csv", csvText);
            const importResult = await importAction(formData);
            setResult(importResult);
          } finally {
            setImporting(false);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
      />

      <Button
        type="button"
        variant="secondary"
        disabled={importing}
        onClick={() => inputRef.current?.click()}
      >
        {importing ? "…" : dict.import.chooseFile}
      </Button>

      {result && (
        <div className="mt-4 text-sm">
          <p className="text-stone-700">
            {interpolate(
              result.created === 1 ? dict.import.importedOne : dict.import.importedMany,
              { n: result.created }
            )}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-600">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );
}
