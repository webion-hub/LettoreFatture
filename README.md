# Quadra — Lettore automatico di fatture passive

Demo di un sistema che elimina il data entry manuale delle fatture ricevute.
Le fatture arrivano via email, **OCR + AI** estraggono fornitore, importi, IVA e
scadenza, l'utente verifica/corregge gli eventuali errori e registra nel
gestionale con un clic.

## Funzionalità della demo

- **Dashboard** con KPI: ore di data entry risparmiate, errori contabili azzerati,
  fatture registrate, fatture in attesa.
- **Posta in arrivo**: elenco delle email con allegato fattura. Pulsante
  _"Elabora con AI"_ → animazione di **scansione OCR + estrazione AI** a step.
- **Pannello di verifica** (slide-over): tutti i campi estratti sono **modificabili**.
  - I campi riconosciuti con bassa affidabilità sono **evidenziati in giallo**
    ("da verificare").
  - **Controllo di quadratura** automatico: imponibile + IVA = totale, con
    pulsante _"Ricalcola IVA"_.
- **Gestionale**: tabella delle fatture registrate (con vista a card su mobile),
  ognuna ri-modificabile.
- **Responsive** (mobile → desktop) e animazioni con Framer Motion.

> I dati sono simulati ([src/data/mockData.ts](src/data/mockData.ts)). Prova a
> elaborare la bolletta di _Energia Più_: ha la scadenza e il numero fattura
> marcati come "da verificare".

## Stack

React + TypeScript + Vite · Tailwind CSS · componenti stile shadcn/ui ·
Framer Motion · lucide-react.

## Avvio

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build di produzione
```
