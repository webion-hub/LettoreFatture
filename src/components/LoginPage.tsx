import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  appName: string;
  defaultEmail: string;
  onLogin: () => void;
}

export function LoginPage({ appName, defaultEmail, onLogin }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Accedi a {appName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inserisci le tue credenziali per continuare.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showPassword ? "Nascondi password" : "Mostra password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl">
            Accedi
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo · le credenziali sono già compilate, premi Accedi per entrare.
        </p>
      </motion.div>
    </div>
  );
}
