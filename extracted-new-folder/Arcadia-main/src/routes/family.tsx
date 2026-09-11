import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Phone, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useCareData } from "@/state/care-context";
import { ContactCard } from "@/components/contacts/contact-card";
import type { ContactCategory } from "@/types/care";

const sections: { category: ContactCategory; title: string }[] = [
  { category: "family", title: "Family" },
  { category: "caregiver", title: "Caregivers" },
  { category: "doctor", title: "Doctors" },
  { category: "emergency", title: "Emergency Contacts" },
];

export default function FamilyPage() {
  const [, setLocation] = useLocation();
  const { state } = useCareData();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8">
      <button
        type="button"
        onClick={() => setLocation("/")}
        className="mb-6 flex items-center gap-2 self-start text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>
      <header className="mb-8 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sun/30 text-sun-foreground">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family & Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">People who can help, call, or message you.</p>
        </div>
      </header>

      <div className="space-y-6">
        {sections.map(({ category, title }) => {
          const contacts = state.contacts.filter((contact) => contact.category === category);
          return (
            <section key={category}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
              <div className="mt-3 space-y-3">
                {contacts.length > 0 ? (
                  contacts.map((contact) => <ContactCard key={contact.id} contact={contact} readOnly />)
                ) : (
                  <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No {title.toLowerCase()} added yet.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

export const Route = createFileRoute("/family")({
  component: FamilyPage,
});
