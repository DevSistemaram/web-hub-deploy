'use client';

import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { api, type ExportVendasParams } from '@/lib/api';
import { downloadBlob } from '@/lib/download';
import { toastError, toastSuccess } from '@/lib/swal';
import { Card, CardContent } from '@/components/ui/card';
import { VendasExportForm, type VendasIntegrationOption } from '@/components/dashboard/VendasExportForm';

export default function VendasPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [integrationId, setIntegrationId] = useState('');
  const [integrations, setIntegrations] = useState<VendasIntegrationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.integrations.list()
      .then((list) => setIntegrations(list.filter((i) => i.isActive)))
      .catch(() => toastError('Não foi possível carregar as integrações.'));
  }, []);

  function handlePresetSelect(start: string, end: string) {
    setStartDate(start);
    setEndDate(end);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Selecione a data inicial e a data final.');
      return;
    }
    if (endDate < startDate) {
      setError('A data final não pode ser anterior à data inicial.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const blob = await api.vendas.exportExcel({
        startDate,
        endDate,
        status: (status || undefined) as ExportVendasParams['status'],
        integrationId: integrationId || undefined,
      });
      downloadBlob(blob, `vendas_${startDate}_${endDate}.xlsx`);
      toastSuccess('Planilha exportada com sucesso!');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao exportar vendas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <FileSpreadsheet className="w-6 h-6" />
        Vendas
      </h1>
      <p className="text-muted-foreground mb-8">
        Exporte os pedidos de venda filtrados para uma planilha Excel (.xlsx).
      </p>

      <Card>
        <CardContent className="pt-6">
          <VendasExportForm
            startDate={startDate} onStartDateChange={setStartDate}
            endDate={endDate} onEndDateChange={setEndDate}
            onPresetSelect={handlePresetSelect}
            status={status} onStatusChange={setStatus}
            integrationId={integrationId} onIntegrationChange={setIntegrationId}
            integrations={integrations}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
