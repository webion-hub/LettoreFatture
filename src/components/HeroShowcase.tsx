import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Vetrina animata dell'hero: mostra, in loop, la lettura di una fattura.
 * A sinistra il documento con un fascio di scansione che lo attraversa;
 * a destra i campi che l'AI estrae, che compaiono uno alla volta con il
 * segno di spunta. Un campo ("Scadenza") viene marcato "da verificare",
 * e in fondo compare il controllo di quadratura. Riproduce dal vivo il
 * linguaggio visivo del prodotto reale.
 */

type Field = {
  label: string;
  value: string;
  verify?: boolean;
};

const FIELDS: Field[] = [
  { label: "Fornitore", value: "Tecnoforniture S.r.l." },
  { label: "Partita IVA", value: "IT04567890123" },
  { label: "N. documento", value: "2026/0457" },
  { label: "Imponibile", value: "2.450,00 €" },
  { label: "IVA 22%", value: "539,00 €" },
  { label: "Scadenza", value: "05/07/2026", verify: true },
];

// durata di una singola passata prima di ripartire (ms)
const CYCLE_MS = 6400;

export function HeroShowcase() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* alone morbido dietro alla scena */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/10 via-sky-200/20 to-transparent blur-2xl"
      />

      <div className="grid gap-4 rounded-3xl border bg-card/80 p-4 shadow-xl backdrop-blur-sm sm:grid-cols-2 sm:p-5">
        {/* ===== documento con scansione ===== */}
        <div className="relative overflow-hidden rounded-2xl border bg-[hsl(210_40%_99%)] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Fattura_2026_0457.pdf
          </div>

          {/* corpo finto del documento */}
          <div className="space-y-2.5">
            <div className="h-3 w-2/3 rounded bg-foreground/80" />
            <div className="h-2 w-1/2 rounded bg-muted-foreground/30" />
            <div className="mt-4 space-y-1.5">
              <div className="h-2 w-full rounded bg-muted-foreground/20" />
              <div className="h-2 w-11/12 rounded bg-muted-foreground/20" />
              <div className="h-2 w-4/5 rounded bg-muted-foreground/20" />
            </div>
            <div className="mt-4 flex justify-between border-t pt-3">
              <div className="h-2.5 w-24 rounded bg-muted-foreground/30" />
              <div className="h-2.5 w-16 rounded bg-primary/70" />
            </div>
          </div>

          {/* fascio di scansione */}
          <motion.div
            key={`beam-${cycle}`}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0"
            initial={{ y: "-20%", opacity: 0 }}
            animate={{ y: ["-20%", "420%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
          />
          {/* linea netta del fascio */}
          <motion.div
            key={`line-${cycle}`}
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-primary/70 shadow-[0_0_12px_2px_hsl(214_80%_42%/0.5)]"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: [8, 240], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
          />

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Lettura OCR + AI
          </div>
        </div>

        {/* ===== pannello dati estratti ===== */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Dati estratti
            </span>
            <ProgressDot cycle={cycle} />
          </div>

          <ul className="space-y-2">
            {FIELDS.map((f, i) => (
              <FieldRow key={`${cycle}-${f.label}`} field={f} index={i} />
            ))}
          </ul>

          {/* quadratura */}
          <motion.div
            key={`quad-${cycle}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 * FIELDS.length + 0.4, duration: 0.4 }}
            className="mt-3 flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-3 py-2"
          >
            <span className="text-xs font-medium text-sky-700">
              Quadratura verificata
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-sky-700">
              <Check className="h-3.5 w-3.5" />
              2.989,00 €
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ field, index }: { field: Field; index: number }) {
  const delay = 0.35 * index + 0.5;
  return (
    <motion.li
      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className="flex items-center justify-between gap-3 rounded-lg px-1"
    >
      <span className="text-xs text-muted-foreground">{field.label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "truncate rounded-md px-1.5 py-0.5 text-sm font-medium tabular-nums",
            field.verify
              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              : "text-foreground"
          )}
        >
          {field.value}
        </span>
        {field.verify ? (
          <Badge variant="warning" className="shrink-0">
            da verificare
          </Badge>
        ) : (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.1, type: "spring", stiffness: 500, damping: 22 }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Check className="h-3 w-3" />
          </motion.span>
        )}
      </div>
    </motion.li>
  );
}

/** piccolo indicatore: gira mentre "estrae", poi diventa spunta. */
function ProgressDot({ cycle }: { cycle: number }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(false);
    const t = window.setTimeout(() => setDone(true), 0.35 * FIELDS.length * 1000 + 700);
    return () => window.clearTimeout(t);
  }, [cycle]);

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.span
            key="done"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-sky-700"
          >
            <Check className="h-3.5 w-3.5" /> completato
          </motion.span>
        ) : (
          <motion.span key="loading" exit={{ opacity: 0 }} className="flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> lettura…
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
