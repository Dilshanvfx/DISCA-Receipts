import { useState, useRef, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Printer, Download, Share2, Trophy, Loader2, FileEdit, Eye, Archive, MoreVertical, X, LayoutTemplate, FileText, Sun, Moon, Database, Upload } from 'lucide-react';
import ReceiptForm from './components/ReceiptForm';
import ReceiptPreview from './components/ReceiptPreview';
import ReceiptRecords from './components/ReceiptRecords';
import './App.css';

const getBatchCode = (batch) => {
  return batch.includes('Under') ? `U${batch.split(' ')[1]}` : 'SNR';
};

const formatStudentId = (date, batch, suffix) => {
  if (!date) return 'DIS-YY-BATCH-';
  const d = new Date(date);
  const yy = d.getFullYear().toString().slice(-2);
  const batchCode = getBatchCode(batch);
  const xxx = suffix.padStart(3, '0');
  return `DIS-${yy}-${batchCode}-${xxx}`;
};

const formatReceiptNo = (date, suffix) => {
  if (!date) return 'DISCA-YYYY-MM-';
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const xxxx = suffix.padStart(3, '0');
  return `DISCA-${yyyy}-${mm}-${xxxx}`;
};

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [showMenu, setShowMenu] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('disca_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('disca_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);
  const [data, setData] = useState({
    academyName: "DIS Cricket Academy",
    academyAddress: "No. 45, Maitland Place, Colombo 07, Sri Lanka",
    academyPhone: "+94 76 856 8333",
    academyEmail: "discricketacademy@gmail.com",
    receiptNoMatch: "001",
    date: new Date().toISOString().split('T')[0],
    studentName: "",
    studentIdMatch: "001",
    batch: "Under 15",
    month: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
    feeAmount: "5000",
    otherFees: "Registration Fee",
    otherAmount: "0",
    paymentMethod: "Bank Transfer",
    transactionRef: "",
    hideAddress: false,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const receiptRef = useRef(null);

  const currentReceiptNo = formatReceiptNo(data.date, data.receiptNoMatch);
  const currentStudentId = formatStudentId(data.date, data.batch, data.studentIdMatch);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleSaveReceipt = async () => {
    setIsSaving(true);
    try {
      const newRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        receiptNo: currentReceiptNo,
        receiptNoRaw: data.receiptNoMatch || '001',
        data: { ...data }
      };

      const existingStr = localStorage.getItem('disca_receipts');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      existing.push(newRecord);
      localStorage.setItem('disca_receipts', JSON.stringify(existing));

      showToast('Record saved offline securely!');
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Offline save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordAction = async (record, action) => {
    // Stage 1: Load Data
    setData(record.data);

    if (action === 'open') {
      setActiveTab('form');
      showToast('Record loaded into form!');
      return;
    }

    // Stage 2: Background Rendering Engine for Extracted Actions
    setActiveTab('preview');
    showToast('Preparing historical record for export...');

    // Give DOM exactly 600ms to mount and paint the new data accurately
    setTimeout(async () => {
      try {
        if (action === 'share-image') await handleShare();
        if (action === 'share-pdf') await handleSharePDF();
        if (action === 'download-pdf') await handleDownload();
      } catch (e) {
        console.error('History action failed:', e);
      }
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateHighResImage = async (scale = 3) => {
    if (!receiptRef.current) throw new Error("No receipt ref");
    // toJpeg produces significantly smaller files (KBs vs MBs) for documents
    const dataUrl = await toJpeg(receiptRef.current, {
      pixelRatio: scale,
      quality: 1.0,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: '580px',
        margin: '0'
      }
    });
    return dataUrl;
  };

  const generatePDFCore = async () => {
    const dataUrl = await generateHighResImage(3);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    const imgProps = pdf.getImageProperties(dataUrl);
    const ratio = imgProps.width / imgProps.height;
    let width = pdfWidth;
    let height = width / ratio;
    if (height > pdfHeight) {
      height = pdfHeight;
      width = height * ratio;
    }
    const xPos = (pdfWidth - width) / 2;
    const yPos = (pdfHeight - height) / 2;
    pdf.addImage(dataUrl, 'JPEG', xPos, yPos, width, height);
    return pdf;
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    showToast('Generating A6 PDF...');
    try {
      const pdf = await generatePDFCore();
      pdf.save(`${currentReceiptNo}-${data.studentName || 'Receipt'}.pdf`);
      showToast('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Download failed:', error);
      showToast('Download failed. Try using the Print button.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSharePDF = async () => {
    if (!receiptRef.current) return;
    setIsSharing(true);
    showToast('Preparing PDF for share...');
    try {
      const pdf = await generatePDFCore();
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${currentReceiptNo}.pdf`, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt: ${currentReceiptNo}`,
          text: `Payment receipt for ${data.studentName} - DIS Cricket Academy`
        });
        showToast('Shared successfully!');
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.download = `${currentReceiptNo}.pdf`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Share not supported. PDF downloaded instead.');
      }
    } catch (error) {
      console.error('Sharing PDF failed:', error);
      showToast('Sharing failed due to a rendering issue.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;
    setIsSharing(true);
    showToast('Preparing image for share...');
    try {
      const dataUrl = await generateHighResImage(3);

      // Convert base64 to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const file = new File([blob], `${currentReceiptNo}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt: ${currentReceiptNo}`,
          text: `Payment receipt for ${data.studentName} - DIS Cricket Academy`
        });
        showToast('Shared successfully!');
      } else {
        // Fallback: Auto-download high-res PNG
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${currentReceiptNo}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Share not supported on this device. Image downloaded instead.');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      showToast('Sharing failed due to a rendering issue.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = localStorage.getItem('disca_receipts');
      if (!data || data === '[]') {
        showToast('No records found to export');
        return;
      }
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `disca_receipts_backup_${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Backup file downloaded!');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed');
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) {
          showToast('Invalid backup file format');
          return;
        }

        if (confirm(`Are you sure? This will add ${importedData.length} records to your current history.`)) {
          const existingStr = localStorage.getItem('disca_receipts');
          const existing = existingStr ? JSON.parse(existingStr) : [];

          // Deduplicate based on ID
          const existingIds = new Set(existing.map(r => r.id));
          const newRecords = importedData.filter(r => !existingIds.has(r.id));

          const merged = [...existing, ...newRecords];
          localStorage.setItem('disca_receipts', JSON.stringify(merged));
          showToast(`Successfully imported ${newRecords.length} new records!`);

          // Refresh if in records tab
          if (activeTab === 'records') {
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('Import failed:', err);
        showToast('Import failed - check file format');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-black font-sans text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Mega Modern Header - Hidden on Print */}
      <header className="print:hidden sticky top-0 z-40 bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-sm border-b border-white/20 dark:border-neutral-800/50 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => setActiveTab('form')}>
          <div className="bg-white dark:bg-neutral-900 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 group-hover:shadow-md transition-all">
            <img src="/dis-logo.svg" alt="DISCA Logo" className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-950 to-blue-700 dark:from-blue-400 dark:to-blue-600 text-transparent bg-clip-text">DISCA Receipt</h1>
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none hidden sm:inline-block mt-0.5">Management Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 sm:p-2.5 bg-neutral-100/80 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full transition-all active:scale-95 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 sm:p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full transition-all active:scale-95 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 relative z-[60]"
            >
              {showMenu ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
            </button>

            {/* Floating Dropdown Popup */}
            {showMenu && (
              <>
                {/* Invisible backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-neutral-200/60 dark:border-neutral-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-3 py-2.5 mb-2 border-b border-neutral-100/60 dark:border-neutral-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none mt-0.5">Quick Actions</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { setShowMenu(false); handleShare(); }}
                      disabled={isSharing}
                      className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-2xl transition-all group disabled:opacity-50 font-semibold text-sm outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                    >
                      <div className="bg-blue-100/50 dark:bg-blue-500/10 p-2 rounded-xl group-hover:bg-blue-200/50 dark:group-hover:bg-blue-500/20 transition-colors">
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" /> : <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                      Share Image
                    </button>

                    <button
                      onClick={() => { setShowMenu(false); handleSharePDF(); }}
                      disabled={isSharing}
                      className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-neutral-700 dark:text-neutral-300 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-2xl transition-all group disabled:opacity-50 font-semibold text-sm outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/20"
                    >
                      <div className="bg-indigo-100/50 dark:bg-indigo-500/10 p-2 rounded-xl group-hover:bg-indigo-200/50 dark:group-hover:bg-indigo-500/20 transition-colors">
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" /> : <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      Share PDF
                    </button>

                    <button
                      onClick={() => { setShowMenu(false); handleDownload(); }}
                      disabled={isDownloading}
                      className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20 text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-400 rounded-2xl transition-all group disabled:opacity-50 font-semibold text-sm outline-none focus:bg-amber-50 dark:focus:bg-amber-900/20"
                    >
                      <div className="bg-amber-100/50 dark:bg-amber-500/10 p-2 rounded-xl group-hover:bg-amber-200/50 dark:group-hover:bg-amber-500/20 transition-colors">
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" /> : <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      </div>
                      Download PDF
                    </button>

                    <button
                      onClick={() => { setShowMenu(false); handlePrint(); }}
                      className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl transition-all group font-semibold text-sm outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800"
                    >
                      <div className="bg-neutral-200/50 dark:bg-neutral-700 p-2 rounded-xl group-hover:bg-neutral-300/50 dark:group-hover:bg-neutral-600 transition-colors">
                        <Printer className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      </div>
                      Direct Print
                    </button>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1 mx-2" />

                    <button
                      onClick={() => { setShowMenu(false); setActiveTab(activeTab === 'records' ? 'form' : 'records'); }}
                      className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 text-neutral-700 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 rounded-2xl transition-all group font-semibold text-sm outline-none focus:bg-green-50 dark:focus:bg-green-900/20"
                    >
                      <div className="bg-green-100/50 dark:bg-green-500/10 p-2 rounded-xl group-hover:bg-green-200/50 dark:group-hover:bg-green-500/20 transition-colors">
                        <Archive className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      Saved Records
                    </button>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1 mx-2" />

                    <button
                      onClick={() => { setShowMenu(false); handleExportData(); }}
                      className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl transition-all group font-semibold text-sm outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800"
                    >
                      <div className="bg-neutral-200/50 dark:bg-neutral-700 p-2 rounded-xl group-hover:bg-neutral-300/50 dark:group-hover:bg-neutral-600 transition-colors">
                        <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      </div>
                      Export Backup (.json)
                    </button>

                    <label className="flex items-center gap-3 w-full p-3 text-left bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl transition-all group font-semibold text-sm cursor-pointer outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800">
                      <div className="bg-neutral-200/50 dark:bg-neutral-700 p-2 rounded-xl group-hover:bg-neutral-300/50 dark:group-hover:bg-neutral-600 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      </div>
                      Import Backup (.json)
                      <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>

                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-32 lg:pb-6">
        {activeTab === 'records' ? (
          <div className="max-w-4xl mx-auto">
            <ReceiptRecords onRecordAction={handleRecordAction} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className={`lg:block ${activeTab === 'form' ? 'block' : 'hidden'}`}>
              <ReceiptForm data={data} setData={setData} getBatchCode={getBatchCode} />
            </div>

            <div className={`lg:block ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <ReceiptPreview
                data={data}
                currentReceiptNo={currentReceiptNo}
                currentStudentId={currentStudentId}
                receiptRef={receiptRef}
                onSave={handleSaveReceipt}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}
      </main>

      <div className={`fixed bottom-24 lg:bottom-8 left-1/2 lg:left-auto lg:right-8 -translate-x-1/2 lg:translate-x-0 bg-neutral-900 text-white px-6 py-3 rounded-xl lg:rounded-lg shadow-xl outline outline-1 outline-neutral-800 transition-all duration-300 z-50 ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        {toastMessage}
      </div>

      {/* Mobile Bottom Tab Bar - 3 Tabs */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-md p-1.5 rounded-full flex gap-1 z-40 shadow-2xl border border-neutral-800 w-[95%] max-w-[400px]">
        <button
          onClick={() => {
            setActiveTab('form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'form' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
        >
          <FileEdit className="w-4 h-4 mb-0.5" /> Form
        </button>
        <button
          onClick={() => {
            setActiveTab('preview');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'preview' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
        >
          <Eye className="w-4 h-4 mb-0.5" /> Preview
        </button>
        <button
          onClick={() => {
            setActiveTab('records');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'records' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
        >
          <Archive className="w-4 h-4 mb-0.5" /> Records
        </button>
      </div>

      {/* Global CSS for Printing */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background-color: white !important; }
          header, section.print\\:hidden, .print\\:hidden { display: none !important; }
          main { display: block !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
          section { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          #receipt-content { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 2cm !important;
          }
        }
        
        /* Direct Overrides for Dark Mode - Isolate Receipt */
        .dark:not(#receipt-content) {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .dark header {
          background-color: rgba(0, 0, 0, 0.7) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .dark .bg-white:not(#receipt-content) {
          background-color: #171717 !important;
        }
        .dark .bg-neutral-50:not(#receipt-content, #receipt-content *) {
          background-color: #000000 !important;
        }
        /* Root targeting for text types to avoid inheritance leakage */
        .dark .text-neutral-900:not(#receipt-content, #receipt-content *) {
          color: #ffffff !important;
        }
        .dark .text-neutral-500:not(#receipt-content, #receipt-content *), 
        .dark .text-neutral-400:not(#receipt-content, #receipt-content *) {
          color: #a3a3a3 !important;
        }
        .dark .border-neutral-200:not(#receipt-content, #receipt-content *), 
        .dark .border-neutral-100:not(#receipt-content, #receipt-content *) {
          border-color: #262626 !important;
        }
        .dark input, .dark select {
          background-color: #262626 !important;
          color: #ffffff !important;
          border-color: #404040 !important;
        }
        
        /* HARD RESET for Receipt Content in Dark Mode */
        .dark #receipt-content {
          background-color: #ffffff !important;
          color: #171717 !important;
        }
        .dark #receipt-content * {
          color: #171717 !important;
          border-color: #e5e7eb !important; /* neutral-200 */
        }
        .dark #receipt-content .text-neutral-500, 
        .dark #receipt-content .text-neutral-400 {
          color: #737373 !important; /* neutral-500 */
        }
        /* Preserve white text on dark blue bars in receipt */
        .dark #receipt-content .bg-blue-950 * {
          color: #ffffff !important;
        }

      `}} />
    </div>
  );
}

export default App;
