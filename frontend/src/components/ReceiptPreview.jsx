import React from 'react';
import { MapPin, Phone, Mail, CheckCircle2, Save, Printer, Loader2 } from 'lucide-react';

export default function ReceiptPreview({ data, currentReceiptNo, currentStudentId, receiptRef, onSave, isSaving }) {
    const totalAmount = (parseFloat(data.feeAmount) || 0) + (parseFloat(data.otherAmount) || 0);

    return (
        <section className="relative">
            <div className="sticky top-24">
                <div className="print:hidden mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">Live Preview</h2>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Ready to Print
                        </span>
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </div>

                {/* The Actual Receipt */}
                <div
                    ref={receiptRef}
                    className="bg-white w-full max-w-[580px] mx-auto shadow-2xl print:shadow-none print:m-0 print:max-w-none border border-neutral-100 print:border-none p-6 sm:p-8 md:p-10 rounded-lg relative overflow-hidden"
                    id="receipt-content"
                >
                    {/* Top Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-950 via-green-600 to-yellow-500 z-10" />

                    {/* Watermark Logo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.06]">
                        <img src="/dis-logo.svg" alt="watermark" className="w-[80%] max-w-[400px] grayscale" />
                    </div>

                    {/* Academy Header */}
                    <div className="text-center space-y-2 mb-6 relative z-10">
                        <div className="flex justify-center mb-4">
                            <img src="/dis-logo.svg" alt="DIS Cricket Academy Logo" className="h-24 w-auto drop-shadow-sm" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight uppercase">{data.academyName}</h2>
                        <div className="space-y-1 text-xs text-neutral-500 font-medium">
                            {!data.hideAddress && (
                                <p className="flex items-center justify-center gap-2"><MapPin className="w-3 h-3" /> {data.academyAddress}</p>
                            )}
                            <p className="flex items-center justify-center gap-2"><Phone className="w-3 h-3" /> {data.academyPhone} | <Mail className="w-3 h-3" /> {data.academyEmail}</p>
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100 w-full mb-6 relative z-10" />

                    {/* Receipt Meta */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Receipt No</p>
                            <p className="text-sm font-mono font-semibold">{currentReceiptNo}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Date</p>
                            <p className="text-sm font-semibold">{data.date ? new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                        </div>
                    </div>

                    {/* Student Details */}
                    <div className="bg-neutral-50/80 backdrop-blur-sm p-5 rounded-2xl mb-6 space-y-3 relative z-10">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-200 pb-2">Student Details</p>
                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-neutral-400 uppercase font-medium">Name</p>
                                <p className="text-sm font-semibold">{data.studentName || "—"}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] text-neutral-400 uppercase font-medium">Student ID</p>
                                <p className="text-sm font-semibold">{currentStudentId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-neutral-400 uppercase font-medium">Batch</p>
                                <p className="text-sm font-semibold">{data.batch}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Table */}
                    <div className="space-y-3 mb-6 relative z-10">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-200 pb-2">Payment Breakdown</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500">Monthly Coaching Fee — {data.month}</span>
                                <span className="font-mono font-semibold">LKR {parseFloat(data.feeAmount || '0').toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {parseFloat(data.otherAmount) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">{data.otherFees}</span>
                                    <span className="font-mono font-semibold">LKR {parseFloat(data.otherAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-blue-950 text-white p-5 rounded-2xl mb-6 flex justify-between items-center relative z-10 shadow-inner">
                        <span className="text-xs uppercase tracking-widest font-bold opacity-70">Total Paid</span>
                        <span className="text-2xl font-bold font-mono">LKR {totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Method</p>
                            <p className="text-xs font-semibold">{data.paymentMethod}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Transaction Ref</p>
                            <p className="text-xs font-mono font-semibold truncate">{data.transactionRef || "N/A"}</p>
                        </div>
                    </div>

                    {/* Status & Footer */}
                    <div className="text-center space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                            <CheckCircle2 className="w-3 h-3" /> Payment Successful
                        </div>
                        <div className="space-y-1 pt-4 border-t border-neutral-100">
                            <p className="text-[10px] text-neutral-400 font-medium italic">Digitally generated receipt — no signature required</p>
                        </div>
                    </div>
                </div>

                {/* Print Help - Hidden on Print */}
                <div className="print:hidden mt-6 bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-blue-800">
                    <Printer className="w-5 h-5 shrink-0" />
                    <p className="text-xs leading-relaxed">
                        <strong>Tip:</strong> When printing, set the layout to <strong>Portrait</strong> and disable <strong>Headers and Footers</strong> in your browser's print settings for the best result.
                    </p>
                </div>
            </div>
        </section>
    );
}
