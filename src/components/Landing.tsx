import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Scale,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Table2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DotBackground } from "@/components/DotBackground";
import { Logo } from "@/components/Logo";
import { HeroShowcase } from "@/components/HeroShowcase";
import { cn } from "@/lib/utils";

interface Props {
  onEnterDemo: () => void;
}

/* animazione condivisa per i reveal on-scroll */
const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Landing({ onEnterDemo }: Props) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <DotBackground />
      <Nav onEnterDemo={onEnterDemo} />
      <Hero onEnterDemo={onEnterDemo} />
      <Problem />
      <HowItWorks />
      <Metrics />
      <Features />
      <FinalCta onEnterDemo={onEnterDemo} />
      <Footer />
    </div>
  );
}

/* ============================ Nav ============================ */
function Nav({ onEnterDemo }: Props) {
  const links = [
    { href: "#problema", label: "Il problema" },
    { href: "#come-funziona", label: "Come funziona" },
    { href: "#vantaggi", label: "Vantaggi" },
  ];
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#top" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">Quadra</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Button onClick={onEnterDemo} className="rounded-xl">
          Prova la demo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.header>
  );
}

/* ============================ Hero ============================ */
function Hero({ onEnterDemo }: Props) {
  const words = ["Le", "fatture", "si", "registrano", "da", "sole."];
  return (
    <section id="top" className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Lettura automatica delle fatture passive
          </motion.div>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.15 + i * 0.09,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "mr-[0.25em] inline-block",
                  w === "sole." && "text-primary"
                )}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Quadra legge ogni fattura che ricevi — fornitore, importi, IVA e
            scadenza — e la prepara per il gestionale. Tu verifichi i dati, un
            clic, ed è registrata. Niente più data entry manuale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              onClick={onEnterDemo}
              size="lg"
              className="rounded-xl text-base shadow-sm"
            >
              Prova la demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a
              href="#come-funziona"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl text-base"
              )}
            >
              Come funziona
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Demo interattiva · dati simulati · nessuna registrazione richiesta
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroShowcase />
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ Problema ============================ */
function Problem() {
  const items = [
    {
      icon: Clock,
      title: "Ore perse a trascrivere",
      body: "Ogni fattura ricevuta va aperta, letta e ribattuta a mano nel gestionale. Un lavoro ripetitivo che divora tempo prezioso.",
    },
    {
      icon: Scale,
      title: "Errori che costano",
      body: "Un importo digitato male, una partita IVA sbagliata, una scadenza saltata: piccoli refusi con conseguenze contabili reali.",
    },
    {
      icon: Inbox,
      title: "Scadenze che sfuggono",
      body: "Tra decine di email e allegati, è facile perdere di vista quali fatture vanno ancora controllate e registrate.",
    },
  ];
  return (
    <Section id="problema" className="pt-28 sm:pt-36">
      <SectionHeading
        eyebrow="Il problema"
        title="Il data entry manuale costa più di quanto sembri"
        subtitle="Registrare le fatture passive a mano è lento, ripetitivo e soggetto a errori. Quadra toglie di mezzo la parte noiosa."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            custom={i}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {it.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {it.body}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ============================ Come funziona ============================ */
function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Ricevi o carichi",
      body: "La fattura arriva via email o la trascini nell'app. PDF, immagine o XML: Quadra la prende in carico.",
    },
    {
      icon: ScanLine,
      title: "L'AI legge",
      body: "OCR e AI riconoscono il testo ed estraggono fornitore, importi, IVA, scadenza e partita IVA.",
    },
    {
      icon: ShieldCheck,
      title: "Tu verifichi",
      body: "I campi incerti sono evidenziati e la quadratura è controllata. Correggi in un attimo, se serve.",
    },
    {
      icon: Table2,
      title: "Registri",
      body: "Con un clic la fattura verificata finisce nel gestionale, pronta e in ordine.",
    },
  ];
  return (
    <Section id="come-funziona" className="pt-28 sm:pt-36">
      <SectionHeading
        eyebrow="Come funziona"
        title="Dalla fattura al gestionale in quattro passi"
        subtitle="Lo stesso flusso che provi nella demo, senza scorciatoie: leggere, verificare, registrare."
      />
      <div className="relative mt-14">
        {/* linea di connessione (desktop) */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              custom={i}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="relative text-center md:text-left"
            >
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-card text-primary shadow-sm md:mx-0">
                <s.icon className="h-6 w-6" />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================ Metriche ============================ */
function Metrics() {
  const stats = [
    { value: 90, suffix: "%", label: "tempo di data entry in meno" },
    { value: 0, suffix: "", label: "errori di trascrizione", zeroLabel: "0" },
    { value: 8, suffix: "", label: "campi estratti per fattura" },
    { value: 1, suffix: " clic", label: "per registrare nel gestionale" },
  ];
  return (
    <Section id="vantaggi" className="pt-28 sm:pt-36">
      <SectionHeading
        eyebrow="Vantaggi"
        title="Meno lavoro manuale, più controllo"
        subtitle="Dati illustrativi di questo scenario dimostrativo — pensati per mostrare l'impatto del flusso automatico."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="rounded-2xl border bg-card p-6 text-center shadow-sm"
          >
            <div className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    if (reduce) {
      setDisplay(to);
      return;
    }
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring, reduce, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

/* ============================ Feature ============================ */
function Features() {
  const feats = [
    {
      icon: ScanLine,
      title: "Estrazione strutturata",
      body: "Fornitore, partita IVA, numero e data documento, imponibile, aliquote, totale e scadenza: ogni campo al posto giusto.",
    },
    {
      icon: Scale,
      title: "Controllo di quadratura",
      body: "Imponibile + IVA = totale, verificato in automatico. Se qualcosa non torna, Quadra te lo segnala subito.",
    },
    {
      icon: ShieldCheck,
      title: "Campi a bassa confidenza",
      body: "Ciò che l'AI non ha letto con certezza viene evidenziato: verifichi solo dove serve, non tutto da capo.",
    },
  ];
  return (
    <Section className="pt-28 sm:pt-36">
      <SectionHeading
        eyebrow="Cosa fa Quadra"
        title="Precisione dove conta, controllo sempre tuo"
        subtitle="L'AI fa il lavoro pesante, ma l'ultima parola resta a te: ogni fattura passa dalla tua verifica."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {feats.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -4 }}
            className="group rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary transition-transform group-hover:scale-105">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ============================ CTA finale ============================ */
function FinalCta({ onEnterDemo }: Props) {
  return (
    <Section className="pt-28 sm:pt-36">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary to-[hsl(214_80%_34%)] px-6 py-14 text-center shadow-lg sm:px-12 sm:py-20"
      >
        {/* riflesso decorativo */}
        <div
          aria-hidden
          className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"
        />
        <div className="relative">
          <Logo className="mx-auto h-12 w-12 text-white" />
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Guarda una fattura registrarsi da sola
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85">
            Carica un documento, osserva l'AI leggerlo e prova la verifica: la
            demo è completa e interattiva.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={onEnterDemo}
              size="lg"
              variant="secondary"
              className="rounded-xl bg-white text-base text-primary shadow-sm hover:bg-white/90"
            >
              Prova la demo ora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ============================ Footer ============================ */
function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-6xl px-4 pb-12">
      <div className="flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-semibold tracking-tight">Quadra</span>
          <span className="text-sm text-muted-foreground">
            · una demo di Webion
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://webion.com/en/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Contattaci
          </a>
          <a
            href="https://webion.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            webion.com
          </a>
        </div>
      </div>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
        Scenario e dati simulati a scopo dimostrativo.
      </p>
    </footer>
  );
}

/* ============================ helper di layout ============================ */
function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl px-4", className)}>
      {children}
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-2xl text-center"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
