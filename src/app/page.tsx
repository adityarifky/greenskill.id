"use client";

import * as React from 'react';
import { useRouter } from "next/navigation";
import { AtSign, FileText, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    router.push("/dashboard");
  };

  return (
     <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Alamat Email</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" placeholder="anda@contoh.com" required className="pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Kata Sandi</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" placeholder="••••••••" required className="pl-10" />
        </div>
      </div>
      <Button type="submit" className="w-full text-lg">
        Masuk
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Generator File Greenskill</CardTitle>
          <CardDescription>Selamat datang kembali! Silakan masuk untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
          {isClient ? <LoginForm /> : null}
        </CardContent>
      </Card>
    </main>
  );
}
