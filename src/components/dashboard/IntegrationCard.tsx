interface IntegrationCardProps {
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  connectedSince?: string;
  onConnect: () => void;
}

export function IntegrationCard({
  name,
  icon,
  description,
  connected,
  connectedSince,
  onConnect,
}: IntegrationCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          {connected && connectedSince && (
            <p className="text-xs text-gray-400 mt-1">
              Vinculado em{' '}
              {new Date(connectedSince).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-3">
        {connected ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Conectado
          </span>
        ) : (
          <button
            onClick={onConnect}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Conectar
          </button>
        )}
      </div>
    </div>
  );
}
