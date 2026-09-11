import { useState } from 'react';
import { Phone, Plus } from 'lucide-react';
import { DetailScreenHeader } from '@/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { ContactCard } from '@/components/contacts/contact-card';
import { ContactFormDialog, type ContactFormValues } from '@/components/contacts/contact-form-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCareData } from '@/state/care-context';
import type { ContactCategory } from '@/types/care';

const sections: { category: ContactCategory; title: string }[] = [
  { category: 'doctor', title: 'Doctor' },
  { category: 'family', title: 'Family' },
  { category: 'caregiver', title: 'Other Caregivers' },
  { category: 'emergency', title: 'Emergency Contacts' },
];

export default function ConnectPage() {
  const { state, addContact, deleteContact } = useCareData();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<ContactCategory>('family');

  const handleSubmit = (values: ContactFormValues) => {
    addContact(values);
    toast({ title: '✓ Contact added' });
  };

  return (
    <DetailScreenShell>
      <DetailScreenHeader title="Connect" icon={<Phone size={18} />} />
      <DetailScreenBody>
        {sections.map(({ category, title }) => {
          const contacts = state.contacts.filter((c) => c.category === category);
          return (
            <section key={category}>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{title}</h2>
                <button
                  className="flex items-center gap-1 text-sm font-bold text-[hsl(40_64%_43%)] hover:underline"
                  onClick={() => {
                    setFormCategory(category);
                    setFormOpen(true);
                  }}
                  data-testid={`button-add-contact-${category}`}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onDelete={() => deleteContact(contact.id)} />
                  ))
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">No {title.toLowerCase()} added yet.</p>
                )}
              </div>
            </section>
          );
        })}
      </DetailScreenBody>

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} defaultCategory={formCategory} onSubmit={handleSubmit} />
    </DetailScreenShell>
  );
}
