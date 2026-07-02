import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLATION', label: 'Cancelado' },
  { value: 'FRAUD', label: 'Fraude' },
] as const;

const MARKETPLACE_LABELS: Record<string, string> = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
  ideris: 'Ideris',
  nuvemshop: 'Nuvemshop',
  ifood: 'iFood',
  zedeliver: 'Zé Delivery',
  uairango: 'Uai Rango',
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Local-date formatting on purpose — toISOString() converts to UTC and can shift the
// date by a day depending on the user's timezone, which would silently mispopulate the inputs.
function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function datePreset(kind: 'currentMonth' | 'previousMonth' | 'thisWeek' | 'last7Days'): { start: string; end: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  switch (kind) {
    case 'currentMonth':
      return { start: toDateInputValue(new Date(year, month, 1)), end: toDateInputValue(today) };
    case 'previousMonth':
      return { start: toDateInputValue(new Date(year, month - 1, 1)), end: toDateInputValue(new Date(year, month, 0)) };
    case 'thisWeek': {
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(year, month, today.getDate() - diffToMonday);
      return { start: toDateInputValue(monday), end: toDateInputValue(today) };
    }
    case 'last7Days': {
      const sevenDaysAgo = new Date(year, month, today.getDate() - 6);
      return { start: toDateInputValue(sevenDaysAgo), end: toDateInputValue(today) };
    }
  }
}

const DATE_PRESETS = [
  { key: 'currentMonth', label: 'Mês atual' },
  { key: 'previousMonth', label: 'Mês anterior' },
  { key: 'thisWeek', label: 'Esta semana' },
  { key: 'last7Days', label: 'Últimos 7 dias' },
] as const;

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export interface VendasIntegrationOption {
  id: string;
  marketplace: string;
  nickname: string | null;
}

interface VendasExportFormProps {
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onPresetSelect: (start: string, end: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  integrationId: string;
  onIntegrationChange: (value: string) => void;
  integrations: VendasIntegrationOption[];
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function VendasExportForm({
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  onPresetSelect,
  status, onStatusChange,
  integrationId, onIntegrationChange,
  integrations,
  loading, error, onSubmit,
}: VendasExportFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const { start, end } = datePreset(preset.key);
              onPresetSelect(start, end);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendas-start-date" className="mb-1.5 block">Data inicial</Label>
          <Input
            id="vendas-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="vendas-end-date" className="mb-1.5 block">Data final</Label>
          <Input
            id="vendas-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendas-status" className="mb-1.5 block">Status</Label>
          <select
            id="vendas-status"
            className={selectClass}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="vendas-integration" className="mb-1.5 block">Integração</Label>
          <select
            id="vendas-integration"
            className={selectClass}
            value={integrationId}
            onChange={(e) => onIntegrationChange(e.target.value)}
          >
            <option value="">Todas as integrações</option>
            {integrations.map((integration) => {
              const marketplaceLabel = MARKETPLACE_LABELS[integration.marketplace] ?? integration.marketplace;
              const label = integration.nickname
                ? `${integration.nickname} (${marketplaceLabel})`
                : marketplaceLabel;
              return (
                <option key={integration.id} value={integration.id}>{label}</option>
              );
            })}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Exportar Excel
          </>
        )}
      </Button>
    </form>
  );
}
