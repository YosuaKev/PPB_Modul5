import { useEffect, useState } from 'react';
import recipeService from '../../services/recipeService';

export default function CacheInspector() {
  const [items, setItems] = useState({ cacheStorage: [], localStorage: [] });
  const [network, setNetwork] = useState({ online: navigator.onLine });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await recipeService.listCachedRecipes();
      setItems(list);
      const net = await recipeService.checkNetworkStatus({ ping: true });
      setNetwork(net);
    } catch (err) {
      console.warn('CacheInspector refresh error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const onOnline = () => setNetwork({ online: true });
    const onOffline = () => setNetwork({ online: false });
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const clearAll = async () => {
    await recipeService.clearAllRecipeCache();
    await refresh();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 border border-slate-200 rounded-xl p-3 shadow-md w-72 text-sm">
        <div className="flex items-center justify-between mb-2">
          <strong>Cache Inspector</strong>
          <button onClick={refresh} className="text-xs text-slate-500">{loading ? '...' : 'Refresh'}</button>
        </div>
        <div className="mb-2">
          <div className="text-xs text-slate-500">Network:</div>
          <div className="font-medium">{network.online ? 'Online' : 'Offline'}{network.status ? ` (HTTP ${network.status})` : ''}</div>
        </div>
        <div className="mb-2">
          <div className="text-xs text-slate-500">CacheStorage:</div>
          <div className="h-16 overflow-auto text-xs">
            {items.cacheStorage.length === 0 ? (
              <div className="text-slate-400">(empty)</div>
            ) : (
              items.cacheStorage.map((u) => (
                <div key={u} className="truncate">{u}</div>
              ))
            )}
          </div>
        </div>
        <div className="mb-2">
          <div className="text-xs text-slate-500">localStorage keys:</div>
          <div className="h-16 overflow-auto text-xs">
            {items.localStorage.length === 0 ? (
              <div className="text-slate-400">(empty)</div>
            ) : (
              items.localStorage.map((k) => (
                <div key={k} className="truncate">{k}</div>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAll} className="flex-1 px-2 py-1 bg-red-600 text-white rounded-md text-xs">Clear All</button>
          <button onClick={refresh} className="px-2 py-1 bg-slate-100 rounded-md text-xs">Inspect</button>
        </div>
      </div>
    </div>
  );
}
