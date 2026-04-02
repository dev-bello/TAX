import React from 'react';
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

export default function ComplianceCalendar() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  // March 2026 starts on a Sunday, 31 days.
  const dates = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Important Dates</h1>
        <p className="text-on-surface-variant text-lg">Never miss a statutory deadline. Stay ahead of FIRS requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid - Made smaller (col-span-1) */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">March 2026</h2>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant">&lt;</button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant">&gt;</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-outline uppercase tracking-wider">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, i) => {
              const isCurrentMonth = date > 0 && date <= 31;
              const isToday = date === 22; // Current date: Mar 22
              const hasEvent = date === 25 || date === 31;
              
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                    !isCurrentMonth ? 'text-outline-variant/30' : 
                    isToday ? 'bg-primary text-white font-bold shadow-md' : 
                    hasEvent ? 'bg-error-container/30 text-error font-bold border border-error/20' : 
                    'bg-surface-container-low text-on-surface hover:bg-surface-container-highest cursor-pointer'
                  }`}
                >
                  <span className="text-sm">{isCurrentMonth ? date : (date <= 0 ? 28 + date : date - 31)}</span>
                  {hasEvent && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-error"></span>}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-outline-variant/15">
            <h3 className="text-sm font-bold text-on-surface mb-3">Upcoming this month</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <span className="font-medium text-on-surface">Mar 25 - Pay VAT</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <span className="font-medium text-on-surface">Mar 31 - File Company Tax</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area - Expanded for important things (col-span-2) */}
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
                  <h4 className="font-bold text-on-surface text-lg">Pay VAT</h4>
                  <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-1 rounded-md">3 Days Left</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">Filing and payment for February 2026.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-outline">
                    <CalendarIcon size={16} /> Mar 25, 2026
                  </div>
                  <button className="text-error font-semibold text-sm hover:underline flex items-center gap-1">
                    File Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-error/10 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-on-surface text-lg">File Company Tax</h4>
                  <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-1 rounded-md">9 Days Left</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">Annual Company Income Tax return.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-outline">
                    <CalendarIcon size={16} /> Mar 31, 2026
                  </div>
                  <button className="text-error font-semibold text-sm hover:underline flex items-center gap-1">
                    Prepare <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Documents Needed This Month</h3>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">2 of 3 Verified</span>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="text-primary"><CheckCircle size={24} /></div>
                  <div>
                    <div className="font-bold text-on-surface">Sales Invoices (Feb)</div>
                    <div className="text-sm text-on-surface-variant">Uploaded & Verified by AI</div>
                  </div>
                </div>
                <button className="text-outline hover:text-on-surface"><FileText size={20} /></button>
              </label>
              
              <label className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="text-primary"><CheckCircle size={24} /></div>
                  <div>
                    <div className="font-bold text-on-surface">Purchase Receipts</div>
                    <div className="text-sm text-on-surface-variant">Uploaded & Verified by AI</div>
                  </div>
                </div>
                <button className="text-outline hover:text-on-surface"><FileText size={20} /></button>
              </label>
              
              <label className="flex items-center justify-between p-4 rounded-2xl border border-error/30 bg-error/5 hover:bg-error/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="text-error"><Clock size={24} /></div>
                  <div>
                    <div className="font-bold text-on-surface">Bank Statements</div>
                    <div className="text-sm text-error font-medium">Pending Upload - Required for VAT</div>
                  </div>
                </div>
                <button className="bg-error text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90">Upload</button>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
