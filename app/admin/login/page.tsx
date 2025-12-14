"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md bg-white border-2 border-primary/30">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-secondary">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="font-semibold text-foreground">
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your 4-6 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                disabled={isLoading}
                autoComplete="current-password"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">4-6 digit numeric PIN</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-muted-foreground">
              Default login for testing:
              <br />
              <span className="font-mono font-semibold">Username: Admin User</span>
              <br />
              <span className="font-mono font-semibold">PIN: 1234</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
