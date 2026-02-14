import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= (totalPages || 1); i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) {
                pages.push('ellipsis');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('ellipsis');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-4 py-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm rounded-b-xl">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all flex items-center justify-center ${currentPage === 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-90'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-1 text-slate-300 font-bold">
                                    ···
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`min-w-[36px] h-9 rounded-lg font-bold text-sm transition-all ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`p-2 rounded-lg transition-all flex items-center justify-center ${currentPage === totalPages || totalPages === 0
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-90'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Compact Footer Status */}
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <span>Page</span>
                    <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{currentPage}</span>
                    <span>of</span>
                    <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{Math.max(1, totalPages)}</span>
                </div>

                <div className="h-4 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-2 group">
                    <span className="group-hover:text-blue-500 transition-colors">Jump to</span>
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const page = parseInt((e.target as HTMLInputElement).value);
                                if (!isNaN(page)) handlePageChange(page);
                            }
                        }}
                        defaultValue={currentPage}
                        className="w-12 bg-transparent text-center text-slate-900 focus:outline-none border-b border-transparent group-hover:border-blue-500 transition-all font-black text-xs p-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default Pagination;
