import React from 'react';
import { User, Hash, Calendar, CreditCard } from 'lucide-react';

export default function ReceiptForm({ data, setData, getBatchCode }) {
    return (
        <section className="print:hidden space-y-6">
            <div className="bg-white dark:bg-neutral-900 p-5 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 sm:space-y-8">
                <div>
                    <h2 className="text-lg font-semibold mb-1 dark:text-white">Receipt Details</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Fill in the payment information below.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <Hash className="w-3 h-3" /> Receipt No (Manual Part)
                        </label>
                        <div className="flex items-center">
                            <span className="text-xs font-mono text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-3 py-3 rounded-l-xl border border-r-0 border-neutral-200 dark:border-neutral-700 whitespace-nowrap flex-shrink-0">
                                {data.date ? `DISCA-${new Date(data.date).getFullYear()}-${(new Date(data.date).getMonth() + 1).toString().padStart(2, '0')}-` : 'DISCA-YYYY-MM-'}
                            </span>
                            <input
                                type="text"
                                placeholder="001"
                                value={data.receiptNoMatch}
                                onChange={(e) => setData({ ...data, receiptNoMatch: e.target.value.replace(/\D/g, '') })}
                                className="flex-1 px-4 py-3 rounded-r-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Date
                        </label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                if (!newDate) {
                                    setData({ ...data, date: newDate, month: '' });
                                    return;
                                }
                                const d = new Date(newDate);
                                const newMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
                                setData({ ...data, date: newDate, month: newMonth });
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-semibold border-b border-neutral-100 pb-2">Student Information</h3>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                <User className="w-3 h-3" /> Student Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                value={data.studentName}
                                onChange={(e) => setData({ ...data, studentName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Student ID (Manual Part)
                            </label>
                            <div className="flex items-center">
                                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-3 py-3 rounded-l-xl border border-r-0 border-neutral-200 whitespace-nowrap flex-shrink-0">
                                    {data.date ? `DIS-${new Date(data.date).getFullYear().toString().slice(-2)}-${getBatchCode(data.batch)}-` : 'DIS-YY-BATCH-'}
                                </span>
                                <input
                                    type="text"
                                    placeholder="001"
                                    value={data.studentIdMatch}
                                    onChange={(e) => setData({ ...data, studentIdMatch: e.target.value.replace(/\D/g, '') })}
                                    className="flex-1 px-4 py-3 rounded-r-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                Batch
                            </label>
                            <select
                                value={data.batch}
                                onChange={(e) => setData({ ...data, batch: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-neutral-800"
                            >
                                <option>Under 13</option>
                                <option>Under 15</option>
                                <option>Under 17</option>
                                <option>Under 19</option>
                                <option>Senior</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-semibold border-b border-neutral-100 pb-2">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Month</label>
                            <input
                                type="text"
                                value={data.month}
                                onChange={(e) => setData({ ...data, month: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Fee (LKR)</label>
                            <input
                                type="number"
                                value={data.feeAmount}
                                onChange={(e) => setData({ ...data, feeAmount: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                            />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Other Fees</label>
                            <input
                                type="text"
                                value={data.otherFees}
                                onChange={(e) => setData({ ...data, otherFees: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Amount (LKR)</label>
                            <input
                                type="number"
                                value={data.otherAmount}
                                onChange={(e) => setData({ ...data, otherAmount: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-semibold border-b border-neutral-100 pb-2">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 sm:gap-2">
                                <CreditCard className="w-3 h-3" /> Method
                            </label>
                            <select
                                value={data.paymentMethod}
                                onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white dark:bg-neutral-800"
                            >
                                <option>Cash</option>
                                <option>Bank Transfer</option>
                                <option>Online Payment</option>
                                <option>Cheque</option>
                            </select>
                        </div>
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Ref No</label>
                            <input
                                type="text"
                                placeholder="Transaction ID"
                                value={data.transactionRef}
                                onChange={(e) => setData({ ...data, transactionRef: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="hideAddress"
                        checked={data.hideAddress || false}
                        onChange={(e) => setData({ ...data, hideAddress: e.target.checked })}
                        className="w-4 h-4 text-neutral-900 bg-neutral-100 border-neutral-200 rounded focus:ring-neutral-900 focus:ring-2"
                    />
                    <label htmlFor="hideAddress" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer">
                        Hide Academy Address on Receipt
                    </label>
                </div>
            </div>
        </section>
    );
}
