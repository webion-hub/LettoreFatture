import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export function Header({ userName, userEmail, onLogout }: Props) {
  const [open, setOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed right-4 top-4 z-30">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-2.5 text-sm shadow-sm transition-colors hover:bg-secondary",
            open && "bg-secondary"
          )}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {initials}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <>
              {/* click-catcher per chiudere il menu */}
              <button
                aria-hidden="true"
                tabIndex={-1}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpen(false)}
              />
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-60 origin-top-right overflow-hidden rounded-xl border bg-card p-1 shadow-lg"
              >
                <div className="border-b px-3 py-2.5">
                  <p className="truncate text-sm font-medium text-foreground">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>

                <div className="py-1">
                  <MenuItem icon={User} label="Profilo" disabled />
                  <MenuItem icon={Settings} label="Impostazioni" disabled />
                </div>

                <div className="border-t pt-1">
                  <MenuItem
                    icon={LogOut}
                    label="Esci"
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof User;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        disabled
          ? "cursor-not-allowed text-muted-foreground/50"
          : "text-foreground hover:bg-secondary"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
