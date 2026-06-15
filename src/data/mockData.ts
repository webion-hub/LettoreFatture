export type InvoiceStatus = "inbox" | "processing" | "review" | "registered";

export interface LineItem {
  description: string;
  amount: number;
}

export interface ExtractedData {
  // --- Fornitore (cedente/prestatore) ---
  supplier: string; // ragione sociale
  vatNumber: string; // Partita IVA
  taxCode: string; // Codice fiscale
  address: string; // sede / indirizzo
  // --- Documento ---
  documentType: string; // tipo documento, es. "TD01 - fattura"
  invoiceNumber: string; // numero documento
  invoiceDate: string; // ISO — data documento
  dueDate: string; // ISO — data scadenza
  recipientCode: string; // codice destinatario (SDI)
  description: string; // causale
  // --- Importi ---
  taxableAmount: number; // imponibile
  vatRate: number; // aliquota IVA %
  vatAmount: number; // importo IVA
  total: number; // totale documento
  // --- Pagamento ---
  paymentMethod: string; // modalità di pagamento, es. "MP19 - SEPA Direct Debit"
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
  taxCode: 0.98,
  address: 0.95,
  documentType: 0.99,
  invoiceNumber: 0.97,
  invoiceDate: 0.99,
  dueDate: 0.98,
  recipientCode: 0.96,
  description: 0.93,
  taxableAmount: 0.99,
  vatRate: 0.99,
  vatAmount: 0.99,
  total: 0.99,
  paymentMethod: 0.95,
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
      taxCode: "04567890123",
      address: "Via dell'Industria 12, Bologna (BO), 40139 IT",
      documentType: "TD01 - fattura",
      invoiceNumber: "2026/0457",
      invoiceDate: "2026-06-05",
      dueDate: "2026-07-05",
      recipientCode: "SUBM70N",
      description: "Forniture materiale tecnico - ordine n. 318",
      taxableAmount: 2450.0,
      vatRate: 22,
      vatAmount: 539.0,
      total: 2989.0,
      paymentMethod: "MP05 - Bonifico",
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
      taxCode: "09887766554",
      address: "Viale Roma 200, Milano (MI), 20121 IT",
      documentType: "TD01 - fattura",
      invoiceNumber: "EP-2026-118923",
      invoiceDate: "2026-06-03",
      dueDate: "2026-06-28",
      recipientCode: "0000000",
      description: "Fornitura energia elettrica - periodo Maggio 2026",
      taxableAmount: 612.3,
      vatRate: 10,
      vatAmount: 61.23,
      total: 673.53,
      paymentMethod: "MP19 - SEPA Direct Debit",
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
      taxCode: "01234567890",
      address: "Corso Vittorio Emanuele 5, Torino (TO), 10128 IT",
      documentType: "TD06 - parcella",
      invoiceNumber: "45/PA",
      invoiceDate: "2026-06-01",
      dueDate: "2026-07-15",
      recipientCode: "KRRH6B9",
      description: "Prestazioni professionali Q2 2026",
      taxableAmount: 3500.0,
      vatRate: 22,
      vatAmount: 770.0,
      total: 4270.0,
      paymentMethod: "MP05 - Bonifico",
      confidence: makeConfidence({ supplier: 0.82, address: 0.79 }),
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
      taxCode: "07778889990",
      address: "Via Tiburtina 1020, Roma (RM), 00156 IT",
      documentType: "TD01 - fattura",
      invoiceNumber: "INV-90233",
      invoiceDate: "2026-05-31",
      dueDate: "2026-06-30",
      recipientCode: "USAL8PV",
      description: "Servizi cloud e hosting - Maggio 2026",
      taxableAmount: 189.9,
      vatRate: 22,
      vatAmount: 41.78,
      total: 231.68,
      paymentMethod: "MP08 - Carta di pagamento",
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
  {
    name: "Forniture Industriali Verdi S.r.l.",
    vat: "IT05512348890",
    address: "Via Emilia 88, Reggio Emilia (RE), 42121 IT",
  },
  {
    name: "Digital Solutions S.p.A.",
    vat: "IT08891234560",
    address: "Piazza San Babila 3, Milano (MI), 20122 IT",
  },
  {
    name: "Logistica Meridiana S.r.l.",
    vat: "IT04432198870",
    address: "Via del Porto 45, Napoli (NA), 80133 IT",
  },
  {
    name: "Officine Meccaniche Galli",
    vat: "IT02239988110",
    address: "Via Artigiani 9, Brescia (BS), 25125 IT",
  },
  {
    name: "Marketing Lab S.r.l.s.",
    vat: "IT09987001230",
    address: "Corso Italia 110, Firenze (FI), 50123 IT",
  },
  {
    name: "Acqua & Servizi S.p.A.",
    vat: "IT01122334450",
    address: "Viale Adriatico 7, Pescara (PE), 65126 IT",
  },
];

const VAT_RATES = [22, 10, 4];

const PAYMENT_METHODS = [
  "MP05 - Bonifico",
  "MP19 - SEPA Direct Debit",
  "MP08 - Carta di pagamento",
];

const RECIPIENT_CODES = ["SUBM70N", "KRRH6B9", "USAL8PV", "0000000"];

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
  // la verifica manuale: ~45% scadenza, ~30% partita IVA, ~35% causale.
  const lowConf: Partial<Record<keyof ExtractedData, number>> = {};
  if (Math.random() < 0.45) lowConf.dueDate = 0.61;
  if (Math.random() < 0.3) lowConf.vatNumber = 0.7;
  if (Math.random() < 0.35) lowConf.description = 0.64;
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
      taxCode: pickedSupplier.vat.replace(/^IT/, ""),
      address: pickedSupplier.address,
      documentType: "TD01 - fattura",
      invoiceNumber: `${new Date(today).getFullYear()}/${pad(
        100 + uploadSeq * 13
      )}`,
      invoiceDate,
      dueDate,
      recipientCode: RECIPIENT_CODES[uploadSeq % RECIPIENT_CODES.length],
      description: `Fornitura di beni e servizi - ${fileName.replace(
        /\.[^.]+$/,
        ""
      )}`,
      taxableAmount,
      vatRate,
      vatAmount,
      total,
      paymentMethod: PAYMENT_METHODS[uploadSeq % PAYMENT_METHODS.length],
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
      taxCode: "03219876540",
      address: "Via Mazzini 23, Modena (MO), 41121 IT",
      documentType: "TD01 - fattura",
      invoiceNumber: "312",
      invoiceDate: "2026-06-02",
      dueDate: "2026-07-02",
      recipientCode: "M5UXCR1",
      description: "Materiale di cancelleria per ufficio",
      taxableAmount: 145.5,
      vatRate: 22,
      vatAmount: 32.01,
      total: 177.51,
      paymentMethod: "MP05 - Bonifico",
      confidence: makeConfidence(),
    },
  },
];
