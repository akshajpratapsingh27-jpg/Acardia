import { MessageCircle, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContactRecord } from '@/types/care';

const smsBody = encodeURIComponent('Hello, I am contacting you regarding the elderly person under my care.');

export function ContactCard({ contact, onDelete }: { contact: ContactRecord; onDelete: () => void }) {
  const isEmergency = contact.category === 'emergency';
  const phoneHref = `tel:${contact.phone}`;
  const smsHref = `sms:${contact.phone}?body=${smsBody}`;

  return (
    <article
      className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid={`contact-${contact.id}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-[hsl(var(--foreground))]">{contact.name}</p>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          {[contact.roleOrRelationship, contact.hospitalOrClinic, contact.specialty].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{contact.phone}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={phoneHref}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ${isEmergency ? 'bg-[hsl(4_64%_52%)] text-white hover:brightness-95' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'}`}
          aria-label={`Call ${contact.name}`}
          data-testid={`button-call-${contact.id}`}
        >
          <Phone size={16} /> {isEmergency ? 'Quick Call' : 'Call'}
        </a>
        {!isEmergency && (
          <a
            href={smsHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            aria-label={`Message ${contact.name}`}
            data-testid={`button-message-${contact.id}`}
          >
            <MessageCircle size={16} /> Message
          </a>
        )}
        <Button variant="ghost" size="icon" aria-label={`Remove ${contact.name}`} onClick={onDelete} data-testid={`button-delete-contact-${contact.id}`}>
          <Trash2 size={15} />
        </Button>
      </div>
    </article>
  );
}
