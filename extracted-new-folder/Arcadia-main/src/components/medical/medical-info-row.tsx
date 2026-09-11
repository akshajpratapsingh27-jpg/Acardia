import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MedicalInfoField } from '@/types/care';

export function MedicalInfoRow({
  field,
  onSave,
  onDelete,
}: {
  field: MedicalInfoField;
  onSave: (updates: Partial<Omit<MedicalInfoField, 'id'>>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(field.label);
  const [value, setValue] = useState(field.value);

  const save = () => {
    onSave({ label: label.trim(), value: value.trim() });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:flex-row sm:items-center">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="sm:w-48" data-testid={`input-medical-label-${field.id}`} />
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" data-testid={`input-medical-value-${field.id}`} />
        <div className="flex shrink-0 gap-1.5">
          <Button variant="outline" size="icon" onClick={save} aria-label="Save" data-testid={`button-save-medical-${field.id}`}>
            <Check size={15} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setEditing(false)} aria-label="Cancel" data-testid={`button-cancel-medical-${field.id}`}>
            <X size={15} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3" data-testid={`medical-field-${field.id}`}>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{field.label}</p>
        <p className="mt-0.5 truncate text-sm text-[hsl(var(--foreground))]">{field.value}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit" data-testid={`button-edit-medical-${field.id}`}>
          <Pencil size={15} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete" data-testid={`button-delete-medical-${field.id}`}>
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}
