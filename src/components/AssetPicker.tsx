import { useState, useEffect } from 'react';

interface AssetPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  folder?: string; // 'backgrounds' | 'overlays' | etc
}

export default function AssetPicker({ onSelect, onClose, folder = 'backgrounds' }: AssetPickerProps) {
  const [assets, setAssets] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(`/api/assets/list?folder=${folder}`);
        const data = await response.json();
        setAssets(data.files || []);
      } catch (error) {
        console.error('Erro ao carregar assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [folder]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            📚 Biblioteca de Mídia ({folder})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin text-4xl">⏳</div>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-2">📂</div>
              <p className="text-gray-500">Nenhum arquivo encontrado nesta pasta.</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione arquivos em: <code className="bg-gray-100 px-1 rounded">public/assets/{folder}</code>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {assets.map((asset) => (
                <button
                  key={asset.url}
                  onClick={() => {
                    onSelect(asset.url);
                    onClose();
                  }}
                  className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:ring-4 ring-blue-500 transition-all"
                >
                  {asset.type === 'video' ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end p-2">
                    <span className="text-white text-xs font-medium truncate w-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                      {asset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 flex justify-between">
          <span>Total: {assets.length} arquivos</span>
          <span>Dica: Passe o mouse sobre vídeos para pré-visualizar</span>
        </div>
      </div>
    </div>
  );
}
