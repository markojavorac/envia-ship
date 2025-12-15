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

        // Check for redirect parameter (preserves query strings)
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get("redirect");

        // Redirect to original URL or default to /admin
        router.push(redirectPath || "/admin");
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
    <div
      className="bg-background flex min-h-screen items-center justify-center p-4"
      data-theme="admin"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
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
        <Card className="bg-card border-border border shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-foreground text-center text-2xl font-bold">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground border focus:ring-1"
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-foreground text-sm font-medium">
                  PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                  className="bg-input border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground border focus:ring-1"
                  disabled={isLoading}
                  autoComplete="current-password"
                  maxLength={6}
                  required
                />
                <p className="text-muted-foreground text-xs">4-6 digit numeric PIN</p>
              </div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 h-10 w-full font-semibold text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="border-border mt-6 border-t pt-4">
              <div className="bg-primary/10 border-primary/20 rounded-md border p-3">
                <p className="text-foreground mb-1 text-center text-xs font-medium">
                  Demo credentials
                </p>
                <div className="text-muted-foreground space-y-1 text-center text-xs">
                  <p>
                    <span className="text-foreground font-semibold">Username:</span> Admin User
                  </p>
                  <p>
                    <span className="text-foreground font-semibold">PIN:</span> 1234
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
