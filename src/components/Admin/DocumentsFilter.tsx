import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface DocumentsFilterProps {
  filters: {
    busca: string;
    categoria: string;
    visibilidade: string;
    ano: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    busca: string;
    categoria: string;
    visibilidade: string;
    ano: string;
  }>>;
  showAdvancedFilter: boolean;
  setShowAdvancedFilter: (show: boolean) => void;
  categorias: string[];
  anos: string[];
  visibilidades: string[];
  filtrosAtivos: number;
  limparFiltros: () => void;
  totalFiltrados: number;
  totalGeral: number;
}

const DocumentsFilter: React.FC<DocumentsFilterProps> = ({
  filters,
  setFilters,
  showAdvancedFilter,
  setShowAdvancedFilter,
  categorias,
  anos,
  visibilidades,
  filtrosAtivos,
  limparFiltros,
  totalFiltrados,
  totalGeral,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button 
          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
          className={`flex items-center justify-start gap-2 px-3 md:px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap cursor-pointer ${
            showAdvancedFilter 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Filter size={18} />
          Filtro Avancado
          {filtrosAtivos > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
              {filtrosAtivos}
            </span>
          )}
        </button>
        <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
          {totalFiltrados} de {totalGeral} documentos
        </span>
      </div>

      {showAdvancedFilter && (
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Search size={16} /> Buscar por Nome
              </label>
              <input
                type="text"
                placeholder="Digite o nome do arquivo..."
                value={filters.busca}
                onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visibilidade</label>
              <select
                value={filters.visibilidade}
                onChange={(e) => setFilters({ ...filters, visibilidade: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">Todas as visibilidades</option>
                {visibilidades.map(vis => (
                  <option key={vis} value={vis}>{vis}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ano</label>
              <select
                value={filters.ano}
                onChange={(e) => setFilters({ ...filters, ano: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">Todos os anos</option>
                {anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
          </div>

          {filtrosAtivos > 0 && (
            <button
              onClick={limparFiltros}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X size={18} /> Limpar todos os filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsFilter;