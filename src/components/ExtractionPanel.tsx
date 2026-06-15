import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { ExtractedData, InvoiceEmail } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  email: InvoiceEmail;
  onClose: () => void;
  onConfirm: (data: ExtractedData) => void;
}

const LOW_CONFIDENCE = 0.85;

type FieldKey = keyof ExtractedData;

export function ExtractionPanel({ email, onClose, onConfirm }: Props) {
  const [data, setData] = useState<ExtractedData>(email.extracted);
  const [touched, setTouched] = useState<Set<FieldKey>>(new Set());

  const update = (key: FieldKey, value: string | number) => {
    setData((d) => ({ ...d, [key]: value }));
    setTouched((t) => new Set(t).add(key));
  };

  const isLow = (key: FieldKey) =>
    (data.confidence[key] ?? 1) < LOW_CONFIDENCE && !touched.has(key);

  // controllo di coerenza contabile
  const expectedVat = +(data.taxableAmount * (data.vatRate / 100)).toFixed(2);
  const expectedTotal = +(data.taxableAmount + data.vatAmount).toFixed(2);
  const vatMatches = Math.abs(expectedVat - data.vatAmount) < 0.02;
  const totalMatches = Math.abs(expectedTotal - data.total) < 0.02;
  const coherent = vatMatches && totalMatches;

  const lowCount = useMemo(
    () =>
      (Object.keys(data.confidence) as FieldKey[]).filter((k) => isLow(k))
        .length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, touched]
  );

  const recalc = () => {
    const vat = +(data.taxableAmount * (data.vatRate / 100)).toFixed(2);
    const total = +(data.taxableAmount + vat).toFixed(2);
    setData((d) => ({ ...d, vatAmount: vat, total }));
    setTouched((t) => new Set(t).add("vatAmount").add("total"));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/30"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.28 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-card shadow-2xl"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Verifica dati fattura</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Dati estratti automaticamente da{" "}
              <span className="text-foreground">{email.attachment}</span>.
              Controlla e correggi prima di registrare.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* avviso campi a bassa confidenza */}
        <div className="border-b px-6 py-3">
          {lowCount > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {lowCount} campo/i da verificare, evidenziati di seguito.
            </div>
          ) : (
            <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
              Tutti i campi sono stati riconosciuti con buona affidabilità.
            </div>
          )}
        </div>

        {/* form */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Fornitore</h3>
            <Field
              label="Ragione sociale"
              low={isLow("supplier")}
              value={data.supplier}
              onChange={(v) => update("supplier", v)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Partita IVA"
                low={isLow("vatNumber")}
                value={data.vatNumber}
                onChange={(v) => update("vatNumber", v)}
              />
              <Field
                label="Codice fiscale"
                low={isLow("taxCode")}
                value={data.taxCode}
                onChange={(v) => update("taxCode", v)}
              />
            </div>
            <Field
              label="Sede / indirizzo"
              low={isLow("address")}
              value={data.address}
              onChange={(v) => update("address", v)}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Documento</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Tipo documento"
                low={isLow("documentType")}
                value={data.documentType}
                onChange={(v) => update("documentType", v)}
              />
              <Field
                label="Numero fattura"
                low={isLow("invoiceNumber")}
                value={data.invoiceNumber}
                onChange={(v) => update("invoiceNumber", v)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Data fattura"
                type="date"
                low={isLow("invoiceDate")}
                value={data.invoiceDate}
                onChange={(v) => update("invoiceDate", v)}
              />
              <Field
                label="Scadenza"
                type="date"
                low={isLow("dueDate")}
                value={data.dueDate}
                onChange={(v) => update("dueDate", v)}
              />
            </div>
            <Field
              label="Codice destinatario (SDI)"
              low={isLow("recipientCode")}
              value={data.recipientCode}
              onChange={(v) => update("recipientCode", v)}
            />
            <Field
              label="Causale"
              low={isLow("description")}
              value={data.description}
              onChange={(v) => update("description", v)}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Importi</h3>
              <Button variant="ghost" size="sm" onClick={recalc}>
                Ricalcola IVA
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NumberField
                label="Imponibile €"
                low={isLow("taxableAmount")}
                value={data.taxableAmount}
                onChange={(v) => update("taxableAmount", v)}
              />
              <NumberField
                label="Aliquota IVA %"
                low={isLow("vatRate")}
                value={data.vatRate}
                onChange={(v) => update("vatRate", v)}
              />
              <NumberField
                label="Importo IVA €"
                low={isLow("vatAmount")}
                warn={!vatMatches}
                value={data.vatAmount}
                onChange={(v) => update("vatAmount", v)}
              />
            </div>
            <NumberField
              label="Totale fattura €"
              low={isLow("total")}
              warn={!totalMatches}
              value={data.total}
              onChange={(v) => update("total", v)}
            />

            <div
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                coherent
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              )}
            >
              {coherent ? (
                <>
                  Quadratura corretta: {formatCurrency(data.taxableAmount)} +{" "}
                  {formatCurrency(data.vatAmount)} ={" "}
                  {formatCurrency(data.total)}.
                </>
              ) : (
                <>
                  I totali non quadrano: attesi IVA{" "}
                  {formatCurrency(expectedVat)} e totale{" "}
                  {formatCurrency(expectedTotal)}.
                </>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Pagamento</h3>
            <Field
              label="Modalità di pagamento"
              low={isLow("paymentMethod")}
              value={data.paymentMethod}
              onChange={(v) => update("paymentMethod", v)}
            />
          </section>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 border-t bg-secondary/40 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={() => onConfirm(data)}>
            Registra nel gestionale
          </Button>
        </div>
      </motion.aside>
    </>
  );
}

/* ---- campi riutilizzabili ---- */

interface FieldProps {
  label: string;
  value: string;
  low?: boolean;
  type?: string;
  onChange: (v: string) => void;
}

function Field({ label, value, low, type = "text", onChange }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2">
        {label}
        {low && <VerifyTag />}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          low && "border-amber-300 bg-amber-50 focus-visible:ring-amber-400"
        )}
      />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  low?: boolean;
  warn?: boolean;
  onChange: (v: number) => void;
}

function NumberField({ label, value, low, warn, onChange }: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2">
        {label}
        {low && <VerifyTag />}
      </Label>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={cn(
          low && "border-amber-300 bg-amber-50 focus-visible:ring-amber-400",
          warn && "border-amber-400 ring-1 ring-amber-200"
        )}
      />
    </div>
  );
}

function VerifyTag() {
  return (
    <Badge variant="warning" className="px-1.5 py-0 text-[10px] normal-case">
      da verificare
    </Badge>
  );
}
