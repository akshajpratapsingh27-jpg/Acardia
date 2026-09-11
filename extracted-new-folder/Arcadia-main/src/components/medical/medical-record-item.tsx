import { FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MedicalRecordEntry } from '@/types/care';

const categoryLabels: Record<MedicalRecordEntry['category'], string> = {
  history: 'Medical history',
  prescription: 'Prescription',
  doctor_note: "Doctor's note",
  document: 'Uploaded document',
};

function getYear(date: string) {
  const match = date.match(/\b(19|20)\d{2}\b/);
  return match?.[0] ?? '—';
}

export function MedicalRecordItem({
  record,
  onEdit,
  onDelete,
}: {
  record: MedicalRecordEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="relative grid grid-cols-[72px_1fr] gap-3 sm:grid-cols-[88px_1fr]" data-testid={`medical-record-${record.id}`}>
      <div className="relative pr-3 text-right">
        <p className="font-serif text-lg text-[hsl(var(--foreground))]">{getYear(record.date)}</p>
        <span className="absolute right-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--accent))]" />
        <span className="absolute right-[-1px] top-4 h-[calc(100%+1rem)] w-px bg-[hsl(var(--border))]" />
      </div>
      <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
            <FileText size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{categoryLabels[record.category]}</p>
            <p className="mt-0.5 text-sm font-bold text-[hsl(var(--foreground))]">{record.title}</p>
            {record.notes && <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{record.notes}</p>}
            <p className="mt-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{record.date}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit record" data-testid={`button-edit-record-${record.id}`}>
              <Pencil size={15} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete record" data-testid={`button-delete-record-${record.id}`}>
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
