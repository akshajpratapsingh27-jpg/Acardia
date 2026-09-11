import { useState } from 'react';
import { Plus, Stethoscope, Upload } from 'lucide-react';
import { DetailScreenHeader } from '@/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { MedicalInfoRow } from '@/components/medical/medical-info-row';
import { MedicalInfoFormDialog } from '@/components/medical/medical-info-form-dialog';
import { MedicalRecordItem } from '@/components/medical/medical-record-item';
import { MedicalRecordFormDialog, type MedicalRecordFormValues } from '@/components/medical/medical-record-form-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCareData } from '@/state/care-context';
import type { MedicalRecordEntry } from '@/types/care';

export default function MedicalReportsPage() {
  const {
    state,
    addMedicalInfo,
    updateMedicalInfo,
    deleteMedicalInfo,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
  } = useCareData();
  const { toast } = useToast();
  const parseRecordDate = (value: string) => {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
    const numeric = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (numeric) return new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])).getTime();
    const year = value.match(/\b(19|20)\d{2}\b/);
    return year ? new Date(Number(year[0]), 0, 1).getTime() : Number.MAX_SAFE_INTEGER;
  };

  const chronologicalRecords = [...state.medicalRecords].sort((a, b) => parseRecordDate(a.date) - parseRecordDate(b.date));

  const [infoFormOpen, setInfoFormOpen] = useState(false);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecordEntry | null>(null);

  const handleRecordSubmit = (values: MedicalRecordFormValues) => {
    if (editingRecord) {
      updateMedicalRecord(editingRecord.id, values);
      toast({ title: '✓ Record updated' });
    } else {
      addMedicalRecord(values);
      toast({ title: '✓ Record added' });
    }
  };

  return (
    <DetailScreenShell>
      <DetailScreenHeader title="Medical Reports" icon={<Stethoscope size={18} />} />
      <DetailScreenBody>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">Medical Information</h2>
            <Button variant="outline" size="sm" onClick={() => setInfoFormOpen(true)} data-testid="button-add-medical-info">
              <Plus size={14} /> Add Information
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {state.medicalInfo.map((field) => (
              <MedicalInfoRow
                key={field.id}
                field={field}
                onSave={(updates) => updateMedicalInfo(field.id, updates)}
                onDelete={() => deleteMedicalInfo(field.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">Medical Records</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingRecord(null);
                  setRecordFormOpen(true);
                }}
                data-testid="button-upload-record"
              >
                <Upload size={14} /> Upload
              </Button>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {chronologicalRecords.length > 0 ? (
              <div className="space-y-4">
              {chronologicalRecords.map((record) => (
                <MedicalRecordItem
                  key={record.id}
                  record={record}
                  onEdit={() => {
                    setEditingRecord(record);
                    setRecordFormOpen(true);
                  }}
                  onDelete={() => deleteMedicalRecord(record.id)}
                />
              ))}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No records yet.</p>
            )}
          </div>
        </section>
      </DetailScreenBody>

      <MedicalInfoFormDialog
        open={infoFormOpen}
        onOpenChange={setInfoFormOpen}
        onSubmit={(values) => {
          addMedicalInfo(values);
          toast({ title: '✓ Information added' });
        }}
      />
      <MedicalRecordFormDialog
        open={recordFormOpen}
        onOpenChange={setRecordFormOpen}
        initial={editingRecord}
        onSubmit={handleRecordSubmit}
      />
    </DetailScreenShell>
  );
}
