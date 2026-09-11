import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EditableTagList({
  items,
  onAdd,
  onRemove,
  placeholder,
  emptyLabel,
}: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder: string;
  emptyLabel: string;
}) {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft('');
  };

  return (
    <div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]"
              data-testid={`tag-${item}`}
            >
              {item}
              <button
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item}`}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                data-testid={`button-remove-tag-${item}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{emptyLabel}</p>
      )}
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className="h-9" data-testid="input-tag" />
        <Button type="submit" size="icon" variant="outline" disabled={!draft.trim()} aria-label="Add" data-testid="button-add-tag">
          <Plus size={15} />
        </Button>
      </form>
    </div>
  );
}
