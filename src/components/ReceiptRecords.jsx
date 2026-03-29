import React, { useState, useEffect } from 'react';
import { Trash2, FileEdit, Archive, Receipt, Calendar, Share2, Download, FileText } from 'lucide-react';

export default function ReceiptRecords({ onRecordAction }) {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = () => {
        const saved = localStorage.getItem('disca_receipts');
        if (saved) {
            setRecords(JSON.parse(saved).reverse());
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            const updated = records.filter(r => r.id !== id);
            localStorage.setItem('disca_receipts', JSON.stringify(updated));
            setRecords(updated);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 transition-colors">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Archive className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Saved Records</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Offline database history</p>
                </div>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
                    <Receipt className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">No receipts saved yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {records.map((record) => (
                        <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <Receipt className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{record.data.studentName || 'Unknown Student'}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                        <span className="font-mono text-blue-600 dark:text-blue-400">{record.receiptNo}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">

                                {/* Fast Actions */}
                                <button
                                    onClick={() => onRecordAction(record, 'share-image')}
                                    className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white rounded-lg transition-colors group-hover:border-blue-200 dark:group-hover:border-blue-700 shadow-sm"
                                    title="Share Image"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRecordAction(record, 'share-pdf')}
                                    className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white rounded-lg transition-colors group-hover:border-indigo-200 dark:group-hover:border-indigo-700 shadow-sm"
                                    title="Share PDF"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRecordAction(record, 'download-pdf')}
                                    className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-amber-600 dark:text-amber-400 hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white rounded-lg transition-colors group-hover:border-amber-200 dark:group-hover:border-amber-700 shadow-sm"
                                    title="Download PDF"
                                >
                                    <Download className="w-4 h-4" />
                                </button>

                                {/* Separator */}
                                <div className="w-px h-6 bg-neutral-200 mx-1 hidden sm:block"></div>

                                {/* Primary Actions */}
                                <button
                                    onClick={() => onRecordAction(record, 'open')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white border border-neutral-900 dark:border-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg text-xs font-semibold shadow-sm transition-all"
                                >
                                    <FileEdit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                    title="Delete Record"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
