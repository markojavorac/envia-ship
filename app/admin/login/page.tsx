"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !pin) {
      toast.error("Please enter both username and PIN");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" data-theme="admin">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/envia-logo.png"
            alt="ENVÍA"
            width={160}
            height={53}
            className="h-auto w-[160px]"
            priority
          />
        </div>

        {/* Login Card */}
        <Card className="bg-card border border-border shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium text-foreground">
                  PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                  className="bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                  autoComplete="current-password"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">4-6 digit numeric PIN</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90 font-semibold h-10"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-xs font-medium text-center text-foreground mb-1">
                  Demo credentials
                </p>
                <div className="space-y-1 text-xs text-muted-foreground text-center">
                  <p>
                    <span className="font-semibold text-foreground">Username:</span> Admin User
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">PIN:</span> 1234
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
