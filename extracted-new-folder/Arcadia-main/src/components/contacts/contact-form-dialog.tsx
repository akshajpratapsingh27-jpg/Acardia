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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContactCategory, ContactRecord } from '@/types/care';

const categoryOptions: { value: ContactCategory; label: string }[] = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'family', label: 'Family' },
  { value: 'caregiver', label: 'Other caregiver' },
  { value: 'emergency', label: 'Emergency contact' },
];

export interface ContactFormValues {
  category: ContactCategory;
  name: string;
  phone: string;
  roleOrRelationship?: string;
  hospitalOrClinic?: string;
  specialty?: string;
}

export function ContactFormDialog({
  open,
  onOpenChange,
  defaultCategory,
  initialContact,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory: ContactCategory;
  initialContact?: ContactRecord | null;
  onSubmit: (values: ContactFormValues) => void;
}) {
  const [category, setCategory] = useState<ContactCategory>(defaultCategory);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [clinic, setClinic] = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    if (open) {
      setCategory(initialContact?.category ?? defaultCategory);
      setName(initialContact?.name ?? '');
      setPhone(initialContact?.phone ?? '');
      setRole(initialContact?.roleOrRelationship ?? '');
      setClinic(initialContact?.hospitalOrClinic ?? '');
      setSpecialty(initialContact?.specialty ?? '');
    }
  }, [open, defaultCategory, initialContact]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit({
      category,
      name: name.trim(),
      phone: phone.trim(),
      ...(role.trim() ? { roleOrRelationship: role.trim() } : {}),
      ...(clinic.trim() ? { hospitalOrClinic: clinic.trim() } : {}),
      ...(specialty.trim() ? { specialty: specialty.trim() } : {}),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-contact-form">
        <DialogHeader>
          <DialogTitle>{initialContact ? 'Edit contact' : 'Add contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ContactCategory)}>
              <SelectTrigger id="contact-category" data-testid="select-contact-category">
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
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} data-testid="input-contact-name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone number</Label>
            <Input id="contact-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" data-testid="input-contact-phone" />
          </div>
          {category === 'doctor' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="contact-clinic">Hospital / clinic</Label>
                <Input id="contact-clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} data-testid="input-contact-clinic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-specialty">Specialty (optional)</Label>
                <Input id="contact-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} data-testid="input-contact-specialty" />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="contact-role">Relationship / role</Label>
              <Input id="contact-role" value={role} onChange={(e) => setRole(e.target.value)} data-testid="input-contact-role" />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || !phone.trim()} data-testid="button-save-contact">
              {initialContact ? 'Save changes' : 'Add contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
