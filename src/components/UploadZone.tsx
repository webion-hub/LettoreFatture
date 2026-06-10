import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFiles: (fileNames: string[]) => void;
}

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.xml,.p7m";

export function UploadZone({ onFiles }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFiles(Array.from(files).map((f) => f.name));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-card px-6 py-12 text-center shadow-sm transition-colors sm:py-16",
        dragging
          ? "border-primary bg-accent"
          : "border-border hover:border-primary/50 hover:bg-secondary/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <motion.div
        animate={dragging ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
        transition={{ type: "tween", duration: 0.15 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary"
      >
        <UploadCloud className="h-8 w-8" />
      </motion.div>
      <div>
        <p className="text-lg font-semibold text-foreground">
          {dragging
            ? "Rilascia qui le fatture"
            : "Trascina qui le tue fatture"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          oppure{" "}
          <span className="font-medium text-primary group-hover:underline">
            sfoglia dal dispositivo
          </span>{" "}
          · PDF, immagini o XML
        </p>
      </div>
    </div>
  );
}
