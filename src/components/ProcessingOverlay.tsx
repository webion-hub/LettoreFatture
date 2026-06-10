import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { InvoiceEmail } from "@/data/mockData";

interface Props {
  email: InvoiceEmail;
  onDone: () => void;
}

const STEPS = [
  "Apertura del documento ricevuto",
  "Riconoscimento del testo (OCR)",
  "Estrazione dei dati: fornitore, importi, IVA, scadenza",
  "Verifica della quadratura e della partita IVA",
];

export function ProcessingOverlay({ email, onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i + 1), 700 * (i + 1)));
    });
    timers.push(window.setTimeout(onDone, 700 * (STEPS.length + 1)));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md overflow-hidden rounded-lg border bg-card shadow-xl"
      >
        <div className="border-b bg-secondary/60 px-5 py-4">
          <p className="text-sm font-semibold">Lettura della fattura in corso</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {email.attachment} · {email.from}
          </p>
        </div>

        <div className="p-5">
          {/* barra di avanzamento */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / STEPS.length) * 100}%` }}
              transition={{ ease: "easeOut", duration: 0.4 }}
            />
          </div>

          <ul className="space-y-1">
            {STEPS.map((label, i) => {
              const state = i < step ? "done" : i === step ? "active" : "pending";
              return (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-md px-1 py-1.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {state === "done" ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : state === "active" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </span>
                  <span
                    className={
                      state === "pending"
                        ? "text-sm text-muted-foreground"
                        : "text-sm text-foreground"
                    }
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
