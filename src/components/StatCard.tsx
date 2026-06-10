import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  hint?: string;
  delay?: number;
}

export function StatCard({ label, value, hint, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </motion.div>
  );
}
