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

const MARKETPLACE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'mercadolivre', label: 'Mercado Livre' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'ideris', label: 'Ideris' },
  { value: 'nuvemshop', label: 'Nuvemshop' },
] as const;

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

interface VendasExportFormProps {
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  marketplace: string;
  onMarketplaceChange: (value: string) => void;
  client: string;
  onClientChange: (value: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function VendasExportForm({
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  status, onStatusChange,
  marketplace, onMarketplaceChange,
  client, onClientChange,
  loading, error, onSubmit,
}: VendasExportFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          {error}
        </div>
      )}

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

      <div>
        <Label htmlFor="vendas-client" className="mb-1.5 block">Cliente</Label>
        <Input
          id="vendas-client"
          type="text"
          placeholder="Nome ou CPF/CNPJ do cliente"
          value={client}
          onChange={(e) => onClientChange(e.target.value)}
        />
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
          <Label htmlFor="vendas-marketplace" className="mb-1.5 block">Marketplace</Label>
          <select
            id="vendas-marketplace"
            className={selectClass}
            value={marketplace}
            onChange={(e) => onMarketplaceChange(e.target.value)}
          >
            {MARKETPLACE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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
