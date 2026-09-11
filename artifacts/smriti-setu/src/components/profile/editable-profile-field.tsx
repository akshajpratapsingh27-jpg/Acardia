import { useEffect, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function EditableProfileField({
  label,
  value,
  onSave,
  multiline = false,
  testId,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  testId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const save = () => {
    onSave(draft.trim());
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3" data-testid={testId}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</p>
        {!editing && (
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label={`Edit ${label}`} data-testid={`button-edit-${testId}`}>
            <Pencil size={14} />
          </Button>
        )}
      </div>
      {editing ? (
        <div className="mt-2 flex items-start gap-2">
          {multiline ? (
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1" data-testid={`input-${testId}`} />
          ) : (
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1" data-testid={`input-${testId}`} />
          )}
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={save} aria-label="Save" data-testid={`button-save-${testId}`}>
              <Check size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setEditing(false)} aria-label="Cancel" data-testid={`button-cancel-${testId}`}>
              <X size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-[hsl(var(--foreground))]">{value}</p>
      )}
    </div>
  );
}
