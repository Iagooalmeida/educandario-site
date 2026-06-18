import React from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface PaginationControlsProps {
  startIndex: number;
  totalFiltrados: number;
  validCurrentPage: number;
  totalPages: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handlePageInput: (page: string) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  startIndex,
  totalFiltrados,
  validCurrentPage,
  totalPages,
  handlePreviousPage,
  handleNextPage,
  handlePageInput,
}) => {
  if (totalFiltrados === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <FileText size={16} className="text-slate-400" />
        <span>
          Mostrando <span className="font-semibold text-slate-900 dark:text-white">{startIndex + 1}</span> de{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{totalFiltrados}</span> documentos
        </span>
      </div>

      <div className="flex items-center gap-2 justify-between sm:justify-end">
        <button
          onClick={handlePreviousPage}
          disabled={validCurrentPage === 1}
          className="p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          title="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Página</span>
          <input
            type="number"
            min="1"
            max={totalPages || 1}
            value={validCurrentPage}
            onChange={(e) => handlePageInput(e.target.value)}
            className="w-12 px-2 py-1 text-center text-sm font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">de {totalPages}</span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={validCurrentPage === totalPages}
          className="p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          title="Próxima página"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;