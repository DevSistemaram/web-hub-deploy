'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type FireResult = Awaited<ReturnType<typeof api.webhookTester.fire>>;

export default function WebhookTesterPage() {
  const [url, setUrl] = useState('');
  const [payloadRaw, setPayloadRaw] = useState('{}');
  const [headersRaw, setHeadersRaw] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FireResult | null>(null);
  const [parseError, setParseError] = useState('');

  async function handleFire() {
    setParseError('');
    let payload: Record<string, unknown>;
    let headers: Record<string, string>;
    try {
      payload = JSON.parse(payloadRaw || '{}');
      headers = JSON.parse(headersRaw || '{}');
    } catch {
      setParseError('JSON inválido no payload ou headers.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.webhookTester.fire(url, payload, headers);
      setResult(res);
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : String(err), duration: 0 });
    } finally {
      setLoading(false);
    }
  }

  let prettyBody = '';
  if (result?.body) {
    try {
      prettyBody = JSON.stringify(JSON.parse(result.body), null, 2);
    } catch {
      prettyBody = result.body;
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Teste de Webhook</h1>
      <p className="text-muted-foreground mb-8">
        Informe uma URL e o servidor vai disparar um <code className="bg-muted px-1.5 py-0.5 rounded text-xs">POST</code> para ela.
      </p>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Configurar disparo</CardTitle>
          <CardDescription>URL de destino + payload opcional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">URL de destino</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://webhook.site/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payload">Payload (JSON)</Label>
            <textarea
              id="payload"
              rows={5}
              value={payloadRaw}
              onChange={(e) => setPayloadRaw(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              spellCheck={false}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="headers">Headers extras (JSON)</Label>
            <textarea
              id="headers"
              rows={3}
              value={headersRaw}
              onChange={(e) => setHeadersRaw(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              spellCheck={false}
            />
          </div>

          {parseError && (
            <p className="text-sm text-destructive">{parseError}</p>
          )}

          <Button onClick={handleFire} disabled={loading || !url.trim()}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? 'Disparando...' : 'Disparar POST'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              {result.ok ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive shrink-0" />
              )}
              <CardTitle className="text-base">Resposta</CardTitle>
              <div className="ml-auto flex items-center gap-2">
                {result.status !== undefined && (
                  <Badge variant={result.ok ? 'success' : 'destructive'}>
                    {result.status} {result.statusText}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{result.duration}ms</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <p className="text-sm text-destructive font-mono">{result.error}</p>
            ) : (
              <pre className="text-xs font-mono bg-muted rounded-md p-3 overflow-auto max-h-64 whitespace-pre-wrap break-all">
                {prettyBody || '(sem corpo)'}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
