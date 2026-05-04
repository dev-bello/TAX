import React, { useState } from 'react';
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle, Clock, FileText, ArrowRight, ChevronLeft, ChevronRight, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import HelpTooltip from '../components/HelpTooltip';

export default function ComplianceCalendar() {
  const { addToast } = useToast();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [documentChecks, setDocumentChecks] = useState({
    salesInvoices: false,
    purchaseReceipts: false,
    bankStatements: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
    if (date === 25) {
      addToast('VAT payment due on March 25, 2026', 'warning');
    } else if (date === 31) {
      addToast('Company Tax filing due on March 31, 2026', 'warning');
    }
  };

  const handleFileNow = () => {
    addToast('Redirecting to NRS Portal...', 'info');
    window.open('https://www.nrs.gov.ng/taxpayer-portal/', '_blank');
  };

  const handlePrepare = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'compliance' }));
    addToast('Opening compliance preparation checklist...', 'info');
  };

  const toggleDocument = (key: keyof typeof documentChecks) => {
    setDocumentChecks(prev => ({ ...prev, [key]: !prev[key] }));
    const label = key === 'salesInvoices' ? 'Sales Invoices' : key === 'purchaseReceipts' ? 'Purchase Receipts' : 'Bank Statements';
    if (!documentChecks[key]) {
      addToast(`${label} marked as verified`, 'success');
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setDocumentChecks(prev => ({ ...prev, bankStatements: true }));
      addToast('Bank statement uploaded and verified!', 'success');
    }, 2000);
  };

  const isToday = (date: number) => {
    const today = new Date();
    return date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const hasEvent = (date: number) => {
    // VAT due on 21st of every month
    // CIT filing due on last day of March
    if (date === 21) return true;
    if (currentMonth === 2 && date === 31) return true;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Important Dates</h1>
        <p className="text-on-surface-variant text-lg">Never miss a statutory deadline. Stay ahead of NRS requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">{monthNames[currentMonth]} {currentYear}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-outline uppercase tracking-wider">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: totalCells }).map((_, i) => {
              const date = i - firstDay + 1;
              const isCurrentMonth = date > 0 && date <= daysInMonth;
              const today = isCurrentMonth && isToday(date);
              const event = isCurrentMonth && hasEvent(date);
              const selected = selectedDate === date && isCurrentMonth;
              
              return (
                <button 
                  key={i} 
                  onClick={() => isCurrentMonth && handleDateClick(date)}
                  disabled={!isCurrentMonth}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                    !isCurrentMonth ? 'text-outline-variant/30' : 
                    today ? 'bg-primary text-white font-bold shadow-md' : 
                    selected ? 'bg-primary-container/20 text-primary font-bold border-2 border-primary' :
                    event ? 'bg-error-container/30 text-error font-bold border border-error/20' : 
                    'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  <span className="text-sm">{isCurrentMonth ? date : ''}</span>
                  {event && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-error"></span>}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-outline-variant/15">
            <h3 className="text-sm font-bold text-on-surface mb-3">Upcoming this month</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <span className="font-medium text-on-surface">{monthNames[currentMonth]} 21 - Pay VAT</span>
              </div>
              {currentMonth === 2 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-error"></div>
                  <span className="font-medium text-on-surface">{monthNames[currentMonth]} 31 - File Company Tax</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-error-container/10 border border-error/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-error-container/50 rounded-lg text-error">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-error">Urgent Deadlines</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-error/10 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-on-surface text-lg"><HelpTooltip term="VAT Remittance" explanation="The process of sending the VAT you collected from customers to the government. Due by the 21st of each month in Nigeria." /></h4>
                  <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-1 rounded-md">Monthly</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">Filing and payment due by the 21st of each month.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-outline">
                    <CalendarIcon size={16} /> {monthNames[currentMonth]} 21, {currentYear}
                  </div>
                  <button onClick={handleFileNow} className="text-error font-semibold text-sm hover:underline flex items-center gap-1">
                    File Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-error/10 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-on-surface text-lg"><HelpTooltip term="Company Tax Filing" explanation="Submitting your annual Company Income Tax return to NRS. Shows your profits, deductions, and how much tax you owe. Due by March 31 each year." /></h4>
                  <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-1 rounded-md">Annual</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">Annual Company Income Tax return due by March 31.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-outline">
                    <CalendarIcon size={16} /> March 31, {currentYear}
                  </div>
                  <button onClick={handlePrepare} className="text-error font-semibold text-sm hover:underline flex items-center gap-1">
                    Prepare <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Documents Needed This Month</h3>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {Object.values(documentChecks).filter(Boolean).length} of 3 Verified
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleDocument('salesInvoices')} className="text-primary hover:scale-110 transition-transform">
                    {documentChecks.salesInvoices ? <CheckCircle size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-outline-variant" />}
                  </button>
                  <div>
                    <div className="font-bold text-on-surface">Sales Invoices (Feb)</div>
                    <div className="text-sm text-on-surface-variant">{documentChecks.salesInvoices ? 'Uploaded & Verified by AI' : 'Pending upload'}</div>
                  </div>
                </div>
                <button onClick={() => addToast('Viewing Sales Invoices...', 'info')} className="text-outline hover:text-on-surface transition-colors">
                  <FileText size={20} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleDocument('purchaseReceipts')} className="text-primary hover:scale-110 transition-transform">
                    {documentChecks.purchaseReceipts ? <CheckCircle size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-outline-variant" />}
                  </button>
                  <div>
                    <div className="font-bold text-on-surface">Purchase Receipts</div>
                    <div className="text-sm text-on-surface-variant">{documentChecks.purchaseReceipts ? 'Uploaded & Verified by AI' : 'Pending upload'}</div>
                  </div>
                </div>
                <button onClick={() => addToast('Viewing Purchase Receipts...', 'info')} className="text-outline hover:text-on-surface transition-colors">
                  <FileText size={20} />
                </button>
              </div>
              
              <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${documentChecks.bankStatements ? 'border-outline-variant/20 hover:bg-surface-container-low' : 'border-error/30 bg-error/5 hover:bg-error/10'}`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleDocument('bankStatements')} className="text-primary hover:scale-110 transition-transform">
                    {documentChecks.bankStatements ? <CheckCircle size={24} /> : <Clock size={24} className="text-error" />}
                  </button>
                  <div>
                    <div className="font-bold text-on-surface">Bank Statements</div>
                    <div className={`text-sm font-medium ${documentChecks.bankStatements ? 'text-on-surface-variant' : 'text-error'}`}>
                      {documentChecks.bankStatements ? 'Uploaded & Verified' : 'Pending Upload - Required for VAT'}
                    </div>
                  </div>
                </div>
                {!documentChecks.bankStatements && (
                  <button onClick={handleUpload} disabled={isUploading}
                    className="bg-error text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
                {documentChecks.bankStatements && (
                  <button onClick={() => addToast('Viewing Bank Statements...', 'info')} className="text-outline hover:text-on-surface transition-colors">
                    <FileText size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
