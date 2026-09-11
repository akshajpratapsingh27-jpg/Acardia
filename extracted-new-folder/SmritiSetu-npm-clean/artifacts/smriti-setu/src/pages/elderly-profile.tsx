import { Camera, Trash2, UserRound } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DetailScreenHeader } from '@/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { EditableProfileField } from '@/components/profile/editable-profile-field';
import { EditableTagList } from '@/components/profile/editable-tag-list';
import { useCareData } from '@/state/care-context';
import type { DementiaStage } from '@/types/care';

const stages: DementiaStage[] = ['Mild', 'Moderate', 'Severe'];

export default function ElderlyProfilePage() {
  const { state, updateElderlyField, updateElderlyPhoto, addAllergy, removeAllergy, addPreference, removePreference } =
    useCareData();
  const { elderly } = state;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateElderlyPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <DetailScreenShell>
      <DetailScreenHeader title="Elderly Profile" icon={<UserRound size={18} />} />
      <DetailScreenBody>
        <section className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="flex flex-col gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-[hsl(42_45%_96%)] bg-[hsl(174_26%_89%)] shadow-md">
              {elderly.photoUrl ? (
                <img src={elderly.photoUrl} alt={elderly.name} className="h-full w-full object-cover" data-testid="img-profile-photo" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[hsl(var(--muted-foreground))]">
                  <UserRound className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(174_42%_43%)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                <Camera size={14} />
                Change Photo
              </button>
              {elderly.photoUrl && (
                <button
                  type="button"
                  onClick={() => updateElderlyPhoto(null)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
                >
                  <Trash2 size={14} />
                  Remove Photo
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-2xl text-[hsl(var(--foreground))]">{elderly.name}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Age {elderly.age}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditableProfileField
            label="Name"
            value={elderly.name}
            onSave={(v) => updateElderlyField('name', v)}
            testId="field-name"
          />
          <EditableProfileField
            label="Age"
            value={String(elderly.age)}
            onSave={(v) => {
              const parsed = Number(v);
              if (!Number.isNaN(parsed) && parsed > 0) updateElderlyField('age', parsed);
            }}
            testId="field-age"
          />
          <EditableProfileField
            label="Preferred language"
            value={elderly.preferredLanguage}
            onSave={(v) => updateElderlyField('preferredLanguage', v)}
            testId="field-language"
          />
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            <Label className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Dementia stage
            </Label>
            <Select value={elderly.dementiaStage} onValueChange={(v) => updateElderlyField('dementiaStage', v as DementiaStage)}>
              <SelectTrigger className="mt-2" data-testid="select-dementia-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Allergies</p>
          <div className="mt-2">
            <EditableTagList
              items={elderly.allergies}
              onAdd={addAllergy}
              onRemove={removeAllergy}
              placeholder="Add an allergy"
              emptyLabel="No known allergies recorded."
            />
          </div>
        </section>

        <EditableProfileField
          label="Emergency information"
          value={elderly.emergencyInfo}
          onSave={(v) => updateElderlyField('emergencyInfo', v)}
          multiline
          testId="field-emergency-info"
        />

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Personal preferences
          </p>
          <div className="mt-2">
            <EditableTagList
              items={elderly.personalPreferences}
              onAdd={addPreference}
              onRemove={removePreference}
              placeholder="Add a preference"
              emptyLabel="No personal preferences recorded."
            />
          </div>
        </section>
      </DetailScreenBody>
    </DetailScreenShell>
  );
}
