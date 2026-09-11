import { useState, type FormEvent } from 'react';
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

export function MedicalInfoFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { label: string; value: string }) => void;
}) {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim() || !value.trim()) return;
    onSubmit({ label: label.trim(), value: value.trim() });
    setLabel('');
    setValue('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-medical-info-form">
        <DialogHeader>
          <DialogTitle>Add information</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="info-label">Label</Label>
            <Input
              id="info-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Blood group"
              data-testid="input-info-label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-value">Value</Label>
            <Input
              id="info-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. B+"
              data-testid="input-info-value"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!label.trim() || !value.trim()} data-testid="button-save-medical-info">
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
