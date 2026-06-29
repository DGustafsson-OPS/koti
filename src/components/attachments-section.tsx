"use client";

import { useRef, useState, useTransition } from "react";
import { uploadAttachment, removeAttachment } from "@/lib/attachment-actions";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useI18n } from "@/components/locale-provider";
import { formatFileSize } from "@/lib/format-file-size";
import type { Attachment } from "@/db/schema";
import type { Locale } from "@/lib/i18n/types";
import { formatDate } from "@/lib/utils";

export function AttachmentsSection({
  propertyId,
  entityType,
  entityId,
  attachments,
  locale,
}: {
  propertyId: string;
  entityType: string;
  entityId: string;
  attachments: Attachment[];
  locale: Locale;
}) {
  const { dict } = useI18n();
  const a = dict.attachments;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  return (
    <div>
      {attachments.length > 0 && (
        <ul className="space-y-2 mb-4">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-canvas-subtle/50 border border-stone-200/60"
            >
              <div className="min-w-0">
                <a
                  href={`/api/files/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-800 hover:underline truncate block"
                >
                  {file.filename}
                </a>
                <p className="text-xs text-stone-400 mt-0.5">
                  {formatFileSize(file.sizeBytes)}
                  {file.sizeBytes ? " · " : ""}
                  {formatDate(file.createdAt, locale)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-red-600"
                onClick={() => setDeleteTarget(file.id)}
              >
                {dict.common.delete}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {attachments.length === 0 && (
        <p className="text-sm text-stone-500 mb-4">{a.empty}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const fd = new FormData();
            fd.set("file", file);
            fd.set("propertyId", propertyId);
            fd.set("entityType", entityType);
            fd.set("entityId", entityId);
            await uploadAttachment(fd);
          } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
      />
      <Button
        type="button"
        variant="secondary"
        className="text-sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "…" : a.upload}
      </Button>

      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title={dict.common.confirmTitle}
        message={a.deleteConfirm}
        confirmLabel={dict.common.delete}
        cancelLabel={dict.common.cancel}
        pending={deletePending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget;
          startDeleteTransition(async () => {
            await removeAttachment(id);
            setDeleteTarget(null);
          });
        }}
      />
    </div>
  );
}
