import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MedicalRecordCategory, MedicalRecordEntry } from '@/types/care';

const categoryOptions: { value: MedicalRecordCategory; label: string }[] = [
  { value: 'history', label: 'Medical history' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'doctor_note', label: "Doctor's note" },
  { value: 'document', label: 'Uploaded document' },
];

export interface MedicalRecordFormValues {
  category: MedicalRecordCategory;
  title: string;
  date: string;
  notes?: string;
}

export function MedicalRecordFormDialog({
  open,
  onOpenChange,
  initial,
  defaultCategory,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: MedicalRecordEntry | null;
  defaultCategory?: MedicalRecordCategory;
  onSubmit: (values: MedicalRecordFormValues) => void;
}) {
  const [category, setCategory] = useState<MedicalRecordCategory>('document');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setCategory(initial?.category ?? defaultCategory ?? 'document');
      setTitle(initial?.title ?? '');
      setDate(initial?.date ?? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
      setNotes(initial?.notes ?? '');
    }
  }, [open, initial, defaultCategory]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ category, title: title.trim(), date, notes: notes.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-medical-record-form">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit record' : 'Add record'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="record-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MedicalRecordCategory)}>
              <SelectTrigger id="record-category" data-testid="select-record-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="record-title">Title</Label>
            <Input id="record-title" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-record-title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="record-date">Date</Label>
            <Input id="record-date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-record-date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="record-notes">Notes (optional)</Label>
            <Textarea id="record-notes" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-record-notes" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!title.trim()} data-testid="button-save-record">
              {initial ? 'Save changes' : 'Add record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
