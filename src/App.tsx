import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createInvoiceFromFile,
  initialEmails,
  seededRegistered,
  type ExtractedData,
  type InvoiceEmail,
} from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DotBackground } from "@/components/DotBackground";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ExtractionPanel } from "@/components/ExtractionPanel";
import { UploadZone } from "@/components/UploadZone";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type View = "home" | "gestionale";

const APP_NAME = "Quadra";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [emails, setEmails] = useState<InvoiceEmail[]>(initialEmails);
  const [registered, setRegistered] =
    useState<InvoiceEmail[]>(seededRegistered);

  const [processing, setProcessing] = useState<InvoiceEmail | null>(null);
  const [reviewing, setReviewing] = useState<InvoiceEmail | null>(null);
  const [justAdded, setJustAdded] = useState<string[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  const handleUpload = (fileNames: string[]) => {
    const created = fileNames.map((name) => createInvoiceFromFile(name, today));
    setEmails((list) => [...created, ...list]);
    setJustAdded(created.map((c) => c.id));
    setView("home");
    // appena caricato, l'AI legge il primo documento e apre la sidebar di verifica
    setProcessing(created[0]);
    window.setTimeout(() => setJustAdded([]), 2500);
  };

  const handleProcessDone = () => {
    if (processing) {
      setReviewing(processing);
      setProcessing(null);
    }
  };

  const handleConfirm = (data: ExtractedData) => {
    if (!reviewing) return;
    const confirmed: InvoiceEmail = {
      ...reviewing,
      status: "registered",
      extracted: data,
    };
    const alreadyRegistered = registered.some((r) => r.id === reviewing.id);
    if (alreadyRegistered) {
      setRegistered((r) =>
        r.map((e) => (e.id === reviewing.id ? confirmed : e))
      );
    } else {
      setRegistered((r) => [confirmed, ...r]);
      setEmails((list) => list.filter((e) => e.id !== reviewing.id));
    }
    setReviewing(null);
    setView("gestionale");
  };

  return (
    <div className="min-h-screen">
      <DotBackground />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:pt-12">
        {/* ===== Segmented slider ===== */}
        <div className="flex justify-center">
          <Segmented value={view} onChange={setView} />
        </div>

        <AnimatePresence mode="wait">
          {view === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* nome + descrizione */}
              <div className="mt-10 text-center sm:mt-14">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {APP_NAME}
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                  Carica una fattura ricevuta: l'AI legge il documento ed estrae
                  fornitore, importi, IVA e scadenza, pronti da verificare e
                  registrare nel gestionale.
                </p>
              </div>

              {/* dropzone centrale */}
              <div className="mt-8">
                <UploadZone onFiles={handleUpload} />
              </div>

              {/* helper / avviso */}
              <div className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                I dati estratti vanno sempre verificati: controlla ogni fattura
                prima di registrarla.
              </div>

              {/* spazio + fatture da controllare */}
              <div className="mt-14">
                <PendingList
                  emails={emails}
                  justAdded={justAdded}
                  onProcess={(e) => setProcessing(e)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="gestionale"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mt-10 sm:mt-14"
            >
              <GestionaleView rows={registered} onEdit={(e) => setReviewing(e)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== Overlays ===== */}
      <AnimatePresence>
        {processing && (
          <ProcessingOverlay
            key="proc"
            email={processing}
            onDone={handleProcessDone}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {reviewing && (
          <ExtractionPanel
            key="review"
            email={reviewing}
            onClose={() => setReviewing(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Segmented slider ============ */
function Segmented({
  value,
  onChange,
}: {
  value: View;
  onChange: (v: View) => void;
}) {
  const options: { key: View; label: string }[] = [
    { key: "home", label: APP_NAME },
    { key: "gestionale", label: "Gestionale" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-secondary/70 p-1">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
                className="absolute inset-0 rounded-full bg-card shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Fatture da controllare ============ */
function PendingList({
  emails,
  justAdded,
  onProcess,
}: {
  emails: InvoiceEmail[];
  justAdded: string[];
  onProcess: (e: InvoiceEmail) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">
          Fatture da controllare
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {emails.length} in attesa
        </span>
      </div>

      {emails.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nessuna fattura in attesa. Carica un documento qui sopra per iniziare.
        </Card>
      ) : (
        <div className="space-y-3">
          {emails.map((e, i) => {
            const isNew = justAdded.includes(e.id);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 4) * 0.04, duration: 0.25 }}
              >
                <Card
                  className={cn(
                    "flex flex-col gap-4 rounded-2xl p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between",
                    isNew && "border-primary/50 bg-accent/40"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.from}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {e.subject}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{e.attachment}</span>
                      <span>Ricevuta il {formatDate(e.receivedAt)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 sm:pl-4">
                    <Button
                      onClick={() => onProcess(e)}
                      className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-primary/20 sm:w-auto"
                    >
                      Controlla
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ============ Gestionale ============ */
function GestionaleView({
  rows,
  onEdit,
}: {
  rows: InvoiceEmail[];
  onEdit: (e: InvoiceEmail) => void;
}) {
  return (
    <div>
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Gestionale
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fatture verificate e registrate.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nessuna fattura registrata. Controlla le fatture in attesa.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* desktop table */}
          <div className="hidden md:block">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="border-b bg-secondary/60 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Fornitore</th>
                  <th className="px-4 py-3">Numero / Data</th>
                  <th className="px-4 py-3">Scadenza</th>
                  <th className="px-4 py-3 text-right">Imponibile</th>
                  <th className="px-4 py-3 text-right">IVA</th>
                  <th className="px-4 py-3 text-right">Totale</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ backgroundColor: "rgba(2,132,199,0.08)" }}
                    animate={{ backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 1, delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.extracted.supplier}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.extracted.vatNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{e.extracted.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(e.extracted.invoiceDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(e.extracted.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(e.extracted.taxableAmount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {e.extracted.vatRate}% ·{" "}
                      {formatCurrency(e.extracted.vatAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(e.extracted.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Registrata</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(e)}
                      >
                        Modifica
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="divide-y md:hidden">
            {rows.map((e) => (
              <div key={e.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {e.extracted.supplier}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.extracted.invoiceNumber} ·{" "}
                      {formatDate(e.extracted.invoiceDate)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(e)}>
                    Modifica
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Scadenza {formatDate(e.extracted.dueDate)}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(e.extracted.total)}
                  </span>
                </div>
                <Badge variant="success">Registrata</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
