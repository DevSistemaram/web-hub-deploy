import { Suspense } from 'react';
import Image from 'next/image';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/RAMHub.svg" alt="Hub RAM" width={180} height={52} className="h-14 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Criar conta no Hub RAM</h1>
          <p className="text-muted-foreground text-sm mt-1">Acesso por convite</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Suspense fallback={<div className="h-40" />}>
              <RegisterForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
