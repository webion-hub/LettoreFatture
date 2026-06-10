export type InvoiceStatus = "inbox" | "processing" | "review" | "registered";

export interface LineItem {
  description: string;
  amount: number;
}

export interface ExtractedData {
  supplier: string;
  vatNumber: string; // Partita IVA
  invoiceNumber: string;
  invoiceDate: string; // ISO
  dueDate: string; // ISO scadenza
  taxableAmount: number; // imponibile
  vatRate: number; // aliquota IVA %
  vatAmount: number; // importo IVA
  total: number; // totale
  /** confidenza per campo (0-1) — i campi sotto soglia vengono segnalati */
  confidence: Partial<Record<keyof ExtractedData, number>>;
}

export interface InvoiceEmail {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  receivedAt: string; // ISO datetime
  attachment: string; // nome file pdf
  status: InvoiceStatus;
  extracted: ExtractedData;
}

const makeConfidence = (
  overrides: Partial<Record<keyof ExtractedData, number>> = {}
): ExtractedData["confidence"] => ({
  supplier: 0.99,
  vatNumber: 0.98,
  invoiceNumber: 0.97,
  invoiceDate: 0.99,
  dueDate: 0.98,
  taxableAmount: 0.99,
  vatRate: 0.99,
  vatAmount: 0.99,
  total: 0.99,
  ...overrides,
});

export const initialEmails: InvoiceEmail[] = [
  {
    id: "inv-001",
    from: "Tecnoforniture S.r.l.",
    fromEmail: "amministrazione@tecnoforniture.it",
    subject: "Fattura n. 2026/0457 - Tecnoforniture S.r.l.",
    receivedAt: "2026-06-09T08:14:00",
    attachment: "Fattura_2026_0457.pdf",
    status: "inbox",
    extracted: {
      supplier: "Tecnoforniture S.r.l.",
      vatNumber: "IT04567890123",
      invoiceNumber: "2026/0457",
      invoiceDate: "2026-06-05",
      dueDate: "2026-07-05",
      taxableAmount: 2450.0,
      vatRate: 22,
      vatAmount: 539.0,
      total: 2989.0,
      confidence: makeConfidence(),
    },
  },
  {
    id: "inv-002",
    from: "Energia Più S.p.A.",
    fromEmail: "fatture@energiapiu.it",
    subject: "La tua bolletta di Giugno - Energia Più",
    receivedAt: "2026-06-09T07:42:00",
    attachment: "Bolletta_Giugno_2026.pdf",
    status: "inbox",
    extracted: {
      supplier: "Energia Più S.p.A.",
      vatNumber: "IT09887766554",
      invoiceNumber: "EP-2026-118923",
      invoiceDate: "2026-06-03",
      dueDate: "2026-06-28",
      taxableAmount: 612.3,
      vatRate: 10,
      vatAmount: 61.23,
      total: 673.53,
      // la scadenza è stampata male sul PDF → bassa confidenza, va rivista
      confidence: makeConfidence({ dueDate: 0.58, invoiceNumber: 0.71 }),
    },
  },
  {
    id: "inv-003",
    from: "Studio Legale Bianchi & Associati",
    fromEmail: "segreteria@studiobianchi.it",
    subject: "Parcella prestazioni professionali Q2",
    receivedAt: "2026-06-08T16:30:00",
    attachment: "Parcella_Q2_2026.pdf",
    status: "inbox",
    extracted: {
      supplier: "Studio Legale Bianchi & Associati",
      vatNumber: "IT01234567890",
      invoiceNumber: "45/PA",
      invoiceDate: "2026-06-01",
      dueDate: "2026-07-15",
      taxableAmount: 3500.0,
      vatRate: 22,
      vatAmount: 770.0,
      total: 4270.0,
      confidence: makeConfidence({ supplier: 0.82 }),
    },
  },
  {
    id: "inv-004",
    from: "CloudHost Italia",
    fromEmail: "billing@cloudhost.it",
    subject: "Invoice #INV-90233 - Servizi Cloud Maggio",
    receivedAt: "2026-06-08T11:05:00",
    attachment: "Invoice_INV90233.pdf",
    status: "inbox",
    extracted: {
      supplier: "CloudHost Italia",
      vatNumber: "IT07778889990",
      invoiceNumber: "INV-90233",
      invoiceDate: "2026-05-31",
      dueDate: "2026-06-30",
      taxableAmount: 189.9,
      vatRate: 22,
      vatAmount: 41.78,
      total: 231.68,
      confidence: makeConfidence(),
    },
  },
];

/* ============================================================
 * Generazione fatture dai file caricati dall'utente.
 * In una demo non c'è un vero OCR: simuliamo l'estrazione AI
 * producendo dati plausibili a partire dal nome del file.
 * ============================================================ */

const SUPPLIER_POOL = [
  { name: "Forniture Industriali Verdi S.r.l.", vat: "IT05512348890" },
  { name: "Digital Solutions S.p.A.", vat: "IT08891234560" },
  { name: "Logistica Meridiana S.r.l.", vat: "IT04432198870" },
  { name: "Officine Meccaniche Galli", vat: "IT02239988110" },
  { name: "Marketing Lab S.r.l.s.", vat: "IT09987001230" },
  { name: "Acqua & Servizi S.p.A.", vat: "IT01122334450" },
];

const VAT_RATES = [22, 10, 4];

let uploadSeq = 0;

function pad(n: number, len = 4): string {
  return String(n).padStart(len, "0");
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Prova a ricavare una ragione sociale leggibile dal nome del file. */
function supplierFromFileName(fileName: string): string | null {
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\b(fattura|invoice|ft|ft\.|n|nr|doc|2024|2025|2026)\b/gi, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return base.length >= 3 ? base.replace(/\b\w/g, (c) => c.toUpperCase()) : null;
}

/**
 * Crea una fattura "in arrivo" da un file caricato.
 * `today` è la data odierna in ISO (YYYY-MM-DD), passata dall'app.
 */
export function createInvoiceFromFile(
  fileName: string,
  today: string
): InvoiceEmail {
  uploadSeq += 1;

  const pickedSupplier =
    SUPPLIER_POOL[Math.floor(Math.random() * SUPPLIER_POOL.length)];
  const nameHint = supplierFromFileName(fileName);

  const taxableAmount = +(Math.random() * 4800 + 80).toFixed(2);
  const vatRate = VAT_RATES[Math.floor(Math.random() * VAT_RATES.length)];
  const vatAmount = +(taxableAmount * (vatRate / 100)).toFixed(2);
  const total = +(taxableAmount + vatAmount).toFixed(2);

  const invoiceDate = addDays(today, -Math.floor(Math.random() * 6));
  const dueDate = addDays(invoiceDate, 30);

  // Su alcuni file simuliamo un riconoscimento incerto, per mostrare
  // la verifica manuale: ~45% scadenza, ~30% partita IVA.
  const lowConf: Partial<Record<keyof ExtractedData, number>> = {};
  if (Math.random() < 0.45) lowConf.dueDate = 0.61;
  if (Math.random() < 0.3) lowConf.vatNumber = 0.7;
  if (!nameHint) lowConf.supplier = 0.74;

  return {
    id: `upl-${uploadSeq}-${Math.floor(Math.random() * 1e6)}`,
    from: nameHint ?? pickedSupplier.name,
    fromEmail: "caricamento.manuale@local",
    subject: fileName,
    receivedAt: `${today}T${pad(8 + (uploadSeq % 9), 2)}:${pad(
      (uploadSeq * 7) % 60,
      2
    )}:00`,
    attachment: fileName,
    status: "inbox",
    extracted: {
      supplier: nameHint ?? pickedSupplier.name,
      vatNumber: pickedSupplier.vat,
      invoiceNumber: `${new Date(today).getFullYear()}/${pad(
        100 + uploadSeq * 13
      )}`,
      invoiceDate,
      dueDate,
      taxableAmount,
      vatRate,
      vatAmount,
      total,
      confidence: makeConfidence(lowConf),
    },
  };
}

/** Fatture già registrate a mano (storico) per dare contesto al gestionale. */
export const seededRegistered: InvoiceEmail[] = [
  {
    id: "inv-000",
    from: "Cancelleria Rossi",
    fromEmail: "ordini@cancelleriarossi.it",
    subject: "Fattura n. 312 - Cancelleria Rossi",
    receivedAt: "2026-06-06T09:00:00",
    attachment: "Fattura_312.pdf",
    status: "registered",
    extracted: {
      supplier: "Cancelleria Rossi",
      vatNumber: "IT03219876540",
      invoiceNumber: "312",
      invoiceDate: "2026-06-02",
      dueDate: "2026-07-02",
      taxableAmount: 145.5,
      vatRate: 22,
      vatAmount: 32.01,
      total: 177.51,
      confidence: makeConfidence(),
    },
  },
];
