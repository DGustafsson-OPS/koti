"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "./actions";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";
import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

export function LanguageSettings({ currentLocale }: { currentLocale: Locale }) {
  const { dict } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function selectLocale(locale: Locale) {
    startTransition(async () => {
      await setLocaleAction(locale);
      router.refresh();
    });
  }

  return (
    <Panel title={dict.settings.language}>
      <p className="text-sm text-stone-500 mb-5 leading-relaxed">{dict.settings.languageHelp}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {LOCALES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            disabled={pending}
            onClick={() => selectLocale(value)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all",
              currentLocale === value
                ? "border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20"
                : "border-stone-200 bg-surface text-stone-700 hover:border-brand-300 hover:bg-brand-50/50"
            )}
          >
            <span>{label}</span>
            {currentLocale === value && (
              <span className="text-xs text-brand-700 font-semibold uppercase tracking-wide">
                {dict.settings.selected}
              </span>
            )}
          </button>
        ))}
      </div>
    </Panel>
  );
}
