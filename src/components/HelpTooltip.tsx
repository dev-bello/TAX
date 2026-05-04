import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  term: string;
  explanation?: string;
  children?: React.ReactNode;
}

export default function HelpTooltip({ term, explanation, children }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const text = explanation || taxTerms[term] || term;

  useEffect(() => {
    if (isOpen && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (triggerRect.top < tooltipRect.height + 20) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <span className="relative inline-flex items-center gap-1" ref={triggerRef}>
      {children || <span className="font-medium">{term}</span>}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-outline hover:text-primary transition-colors focus:outline-none shrink-0"
        aria-label={`Learn about ${term}`}
      >
        <HelpCircle size={16} className="inline" />
      </button>
      
      {isOpen && (
        <div 
          ref={tooltipRef}
          className={`fixed z-[9999] w-80 p-4 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200`}
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'top' 
              ? { bottom: 'calc(100% + 12px)' } 
              : { top: 'calc(100% + 12px)' }
            ),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-primary text-sm">{term}</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-outline hover:text-on-surface"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
          <div 
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-container-lowest rotate-45 ${
              position === 'top' 
                ? 'bottom-0 translate-y-1/2 border-r border-b border-outline-variant/20' 
                : 'top-0 -translate-y-1/2 border-l border-t border-outline-variant/20'
            }`}
          />
        </div>
      )}
    </span>
  );
}

// Tax Terms Dictionary for consistent explanations
export const taxTerms: Record<string, string> = {
  'Taxable Income': 'This is your business profit after deducting all allowable expenses. Think of it as: Money In - Money Out = What the government taxes you on.',
  
  'Deductible Expenses': 'Money you spent running your business that reduces your tax. Examples: office rent, salaries, fuel, internet bills. Basically, costs that keep your business running.',
  
  'Asset Depreciation': 'When you buy expensive items like laptops or machinery, you can\'t deduct the full cost immediately. Instead, you deduct a portion each year (usually 25%). This is called depreciation.',
  
  'Capital Allowance': 'Similar to depreciation - it\'s the tax deduction you get for buying business assets. The government lets you claim 25% of the cost in the first year for most equipment.',
  
  'Company Tax (CIT)': 'The main tax on your business profits. In Nigeria: Small companies (under ₦25M revenue) pay 0%, Medium (₦25M-₦100M) pay 20%, Large (over ₦100M) pay 30%.',
  
  'Employee Tax (PAYE)': 'Pay As You Earn - the income tax deducted from your employees\' salaries before you pay them. You collect this and send it to NRS monthly.',
  
  'Value Added Tax (VAT)': 'A 7.5% tax added to most goods and services. If you charge VAT to customers, you must remit it to NRS monthly. But you can deduct VAT you paid on business purchases.',
  
  'Development Levy': 'A 2% tax on profits (reduced from 3% in 2025) for medium and large companies. It funds education and infrastructure. Small companies remain exempt.',
  
  'Tax Rate': 'The percentage of your profit that goes to the government as tax. Your rate depends on your company size and industry.',
  
  'Pioneer Status': 'A special government incentive where new businesses in key sectors (like tech, agriculture, or manufacturing) pay 0% tax for up to 5 years. Updated 2025 rules expanded eligible sectors.',
  
  'Tax Holiday': 'A period where you don\'t pay company tax, usually because you have Pioneer Status or operate in a special economic zone. 2025 Act extended some holidays to 7 years for strategic sectors.',
  
  'Gross Profit': 'Your total revenue minus the direct cost of producing your goods/services. Before deducting things like rent or salaries.',
  
  'Taxable Profit': 'Your profit after subtracting all allowable deductions and exemptions. This is the amount the government actually taxes.',
  
  'Effective Tax Rate': 'The actual percentage of your total profit that you pay in tax, after all deductions and exemptions. Usually lower than the official rate.',
  
  'NRS': 'Nigeria Revenue Service - the unified Nigerian government agency that collects all taxes (formerly FIRS). You file returns and pay taxes through their single portal at www.nrs.gov.ng.',
  
  'Capital Expenditure': 'Money spent on long-term business assets like equipment, vehicles, or buildings. Different from day-to-day operating expenses.',
  
  'Revenue': 'All the money your business earns from sales or services before any expenses are deducted. Also called turnover or income.',
  
  'Company Size Classification': 'How NRS categorizes your business based on annual revenue: Small (under ₦25M), Medium (₦25M-₦100M), or Large (over ₦100M). This determines your tax rate.',
  
  'TETFund': 'Tertiary Education Trust Fund - now 2% of assessable profit (reduced from 3% in 2025) for medium and large companies to support education.',
  
  'Audit Risk': 'The likelihood that NRS will audit (closely examine) your tax returns. Keeping good records and filing on time keeps this low.', 
  
  'Digital Tax': 'New 2025 provision: 5% tax on digital services provided by non-resident companies to Nigerian consumers.',
  
  'Minimum Tax': 'Updated 2025: Companies must pay minimum 0.5% of turnover if they report losses or very low profits, increased from 0.25%.',
  
  'NRS Portal': 'The online platform at www.nrs.gov.ng where taxpayers file returns, make payments, and access tax services. Replaced the old FIRS e-tax system in 2025.',

  'CAC Number': 'Corporate Affairs Commission registration number. It\'s like your business\'s ID card, issued when you register your company in Nigeria. Format: RC1234567 or BN1234567.',

  'TIN': 'Tax Identification Number - your unique taxpayer ID issued by NRS. Every business must have one to file taxes. It looks like 12345678-0001.',

  'VAT Registration': 'Value Added Tax registration is mandatory if your annual turnover exceeds ₦25 million. Once registered, you must charge 7.5% VAT on sales and remit it monthly.',

  'Tax Year': 'The 12-month period used for calculating your taxes. Calendar Year = Jan-Dec. Fiscal Year can start in April or July, common for some industries.',

  'Professional Services': 'Services like consulting, legal advice, accounting, or management services. If you provide these, different tax rules may apply to your income.',

  'Annual Turnover': 'The total amount of money your business receives from sales and services in one year, before deducting any costs. Also called revenue or gross income.',

  'Tax Deduction': 'An expense that reduces your taxable income. The more legitimate deductions you claim, the less tax you pay. Examples: office rent, salaries, fuel.',

  'VAT Remittance': 'The process of sending the VAT you collected from customers to the government. Due by the 21st of each month in Nigeria.',

  'Company Tax Filing': 'Submitting your annual Company Income Tax return to NRS. Shows your profits, deductions, and how much tax you owe. Due by March 31 each year.',

  'Penalty': 'A fine for late or incorrect tax filing. In Nigeria: 10% of tax owed + ₦500,000 fixed penalty + daily interest for continued delay.',

  'Uncategorized Expenses': 'Business costs that haven\'t been sorted into proper categories yet. You should review and categorize these so they count as tax deductions.',

  'Compliance Status': 'Whether your business is up-to-date with tax filings and payments. Compliant = all good. Overdue = action needed.',

  'Tax Classification': 'The category NRS puts your business in based on turnover: Small (<₦25M, 0% tax), Medium (₦25M-₦100M, 20% tax), or Large (>₦100M, 30% tax).',

  'Business Type': 'The legal structure of your business. Sole Proprietorship = one owner. Limited Company = separate legal entity. Partnership = shared ownership.',

  'Year of Incorporation': 'The year your business was officially registered with CAC. This determines how long you\'ve been operating and may affect some tax rules.',

  'Sector': 'The industry your business operates in. Different sectors get different tax incentives. For example, tech and agriculture often qualify for Pioneer Status.',

  'Deductions': 'Legitimate business expenses that reduce your taxable profit. The government allows you to subtract these from your income before calculating tax.',

  'Tax Estimate': 'An approximate calculation of how much tax you owe based on your turnover and tax rate. The actual amount may differ after all deductions are applied.',

  'Tax Spending Trend': 'A visual chart showing how your tax payments change month by month. Helps you spot unusual spikes and plan cash flow.',

  'NRS Connection': 'Whether our app can link to the Nigeria Revenue Service portal to check your tax status and filing history.',

  'Employee Tax': 'Pay As You Earn (PAYE) - the income tax you deduct from employee salaries and remit to NRS monthly.',

  'Levy': 'Additional taxes like the Education Tax (2% for medium/large companies) that fund public services. Small companies are exempt.',

  'Smart Validation': 'Our system automatically checks if your numbers make sense. For example, expenses shouldn\'t be higher than your total income.',

  'Bank Statement Upload': 'Upload your bank CSV or PDF and our AI reads it to find business income and expenses automatically, saving you from manual entry.',

  'Expense Categorization': 'Sorting business costs into groups like Office Expenses, Utilities, or Transportation. Proper categorization helps maximize your tax deductions.',

  'Receipt Scanner': 'Take a photo of a receipt and our AI reads the vendor name, amount, and date automatically. No more manual data entry.',

  'Scenario Planner': 'A tool to see how business decisions affect your taxes. What if you buy new equipment? What if revenue increases? Plan ahead before making moves.',

  'Forecasting': 'Predictions about your future tax obligations based on current trends. Helps you set aside money and avoid surprises.',

  'Compliance Calendar': 'A visual schedule of all your tax deadlines. Never miss a filing date again.',

  'Tax Clearance Certificate': 'An official document from NRS proving your business has paid all taxes. Required for government contracts and some business deals.',

  'Withholding Tax': 'Tax deducted at source from payments you receive. For example, clients may deduct 5-10% from your invoice and remit it directly to NRS.',

  'Stamp Duty': 'A tax on legal documents and transactions. In Nigeria, it applies to agreements, receipts over ₦10,000, and some financial transfers.',

  'Record Keeping': 'The legal requirement to keep business records for at least 6 years. Includes receipts, invoices, bank statements, and tax returns.',

  'Invoice': 'A document you give customers showing what they bought and how much they owe. Must include your business name, address, and TIN.',

  'Receipt': 'Proof of payment. You need receipts for all business expenses to claim them as tax deductions.',

  'Bank Reconciliation': 'Matching your bank statements with your records to ensure all transactions are accounted for. Essential for accurate tax filing.',

  'Gross Income': 'All money your business earns before any deductions. Includes sales, services, interest, and other income.',

  'Net Income': 'Your profit after all expenses and deductions. Also called net profit or bottom line.',

  'Operating Expenses': 'Day-to-day costs of running your business: rent, salaries, utilities, marketing. Deductible from your taxable income.',

  'Cost of Goods Sold': 'Direct costs of producing what you sell: raw materials, factory labor, shipping. Subtract this from revenue to get gross profit.',

  'Amortization': 'Similar to depreciation but for intangible assets like patents, trademarks, or software licenses. Spread the cost over several years.',

  'Bad Debt': 'Money owed to you that you can\'t collect. You can deduct this from your taxable income if you\'ve made reasonable efforts to collect it.',

  'Inventory': 'Goods you have on hand waiting to be sold. The value of your inventory affects your cost of goods sold and taxable profit.',

  'Fixed Asset': 'Long-term business property like buildings, vehicles, or equipment. These are not fully deductible in one year; you claim capital allowances over time.',

  'Current Asset': 'Short-term assets like cash, inventory, or money owed by customers. Expected to be converted to cash within a year.',

  'Liability': 'Money your business owes to others: loans, unpaid bills, taxes due. Deductible liabilities reduce your taxable profit.',

  'Equity': 'The owner\'s stake in the business. Calculated as total assets minus total liabilities. Also called shareholders\' funds or net worth.',

  'Retained Earnings': 'Profits you\'ve kept in the business rather than paying out as dividends. These accumulate year after year.',

  'Dividend': 'A payment to shareholders from company profits. In Nigeria, dividends are subject to 10% withholding tax.',

  'Tax Loss Carryforward': 'Losses from previous years that reduce future taxable income. Can be carried forward indefinitely in Nigeria.',

  'Tax Neutrality': 'The principle that tax should not distort business decisions. Often cited but rarely achieved in practice.',

  'Tax Planning': 'Legally organizing your finances to minimize tax. Includes timing income and expenses, choosing business structures, and claiming all deductions.',

  'Tax Compliance': 'Following all tax laws: filing on time, paying what\'s due, keeping proper records. Good compliance reduces audit risk.',

  'Tax Gap': 'The difference between taxes owed and taxes actually paid. Includes evasion, avoidance, and non-compliance.',

  'Tax Expenditure': 'Revenue lost due to tax exemptions, deductions, and incentives.',

  'Tax Threshold': 'The income level below which no tax is payable. Nigeria\'s personal income tax has a monthly threshold.',

  'Tax Band': 'A range of income taxed at a specific rate. Nigeria has multiple bands for personal income tax.',

  'Direct Tax': 'A tax paid directly by the person it falls on, like income tax.',

  'Indirect Tax': 'A tax collected by an intermediary, like VAT collected by sellers.',

  'Ad Valorem Tax': 'A tax based on the value of goods or property, like VAT and property tax.',

  'Progressive Tax': 'A tax where higher earners pay a higher percentage. Nigeria\'s personal income tax is progressive.',

  'Regressive Tax': 'A tax where lower earners pay a higher percentage of their income. VAT is often considered regressive.',

  'Proportional Tax': 'A tax where everyone pays the same percentage. Company tax is proportional.',

  'Tax Incentive': 'A government benefit that reduces your tax, like Pioneer Status or special deductions for certain industries.',

  'Tax Exemption': 'Income or transactions that are completely free from tax. Different from deductions which just reduce taxable income.',

  'Tax Credit': 'An amount you can subtract directly from your tax bill. More valuable than a deduction because it reduces tax dollar-for-dollar.',

  'Deferred Tax': 'Tax that will be paid in the future but is recorded now. Happens when income and expenses are recognized at different times for accounting vs tax purposes.',

  'Provisional Tax': 'An estimate of tax you pay during the year, before your final tax is calculated. Common for businesses with seasonal income.',

  'Self-Assessment': 'When you calculate your own tax liability and pay it directly to NRS, rather than waiting for NRS to assess you.',

  'Tax Return': 'The formal document you submit to NRS showing your income, deductions, and tax calculations for a specific period.',

  'Financial Year': 'The 12-month period your business uses for accounting. Can be different from the calendar year. Most Nigerian businesses use Jan-Dec or Apr-Mar.',

  'Quarter': 'A 3-month period: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec). Some taxes are filed quarterly.',

  'Half-Year': 'A 6-month period. Some tax reports are filed half-yearly.',

  'Annual Return': 'A yearly report to CAC showing your company\'s current directors, shareholders, and financial status. Different from tax returns.',

  'Certificate of Incorporation': 'The official document from CAC that proves your company legally exists. Essential for opening bank accounts and filing taxes.',

  'Memorandum and Articles of Association': 'Legal documents that define your company\'s purpose, structure, and rules. Filed with CAC when incorporating.',

  'Form CAC 1.1': 'The annual return form filed with CAC, showing updated company information.',

  'Board Resolution': 'A formal decision by your company\'s directors, documented in writing. Required for major business decisions.',

  'Share Certificate': 'A document proving ownership of company shares. Required for tax purposes when declaring dividends.',

  'Deed of Assignment': 'A legal document transferring ownership of property or rights. May have stamp duty implications.',

  'Power of Attorney': 'A legal document giving someone authority to act on your behalf. Must be stamped to be valid in court.',

  'Company Seal': 'An official stamp used to authenticate company documents. Still required for some legal and tax filings in Nigeria.',

  'Registered Office': 'The official address of your company for legal and tax purposes. Must be a physical location in Nigeria.',

  'Principal Place of Business': 'The main location where your business operates. May be different from your registered office.',

  'Branch Office': 'A secondary business location. Must be registered with CAC and may have separate tax obligations.',

  'Nigeria Revenue Service (NRS)': 'The unified federal agency responsible for assessing, collecting, and accounting for taxes in Nigeria. Replaced FIRS in 2025.',

  'Federal Inland Revenue Service (FIRS)': 'The former federal tax agency, replaced by NRS in 2025. Some older documents may still reference FIRS.',

  'State Internal Revenue Service (SIRS)': 'State-level tax agencies that collect personal income tax, property tax, and other state levies.',

  'Joint Tax Board': 'A body coordinating federal and state tax policies. Ensures consistency across Nigeria\'s tax system.',

  'Federal Ministry of Finance': 'The government department that sets tax policy and oversees NRS. Proposes changes to tax laws.',

  'National Assembly': 'Nigeria\'s parliament, consisting of the Senate and House of Representatives. Passes tax laws and approves the budget.',

  'Finance Act': 'The annual law that updates tax rates, rules, and penalties. The 2025 Finance Act made significant changes to Nigerian taxation.',

  'Tax Regulations': 'Detailed rules issued by NRS to implement tax laws. Have the force of law unless contradicted by the courts.',

  'Tax Practice Note': 'Guidance issued by NRS on how specific tax rules apply. Useful for understanding complex provisions.',

  'Public Ruling': 'NRS\'s official position on how a tax law applies to specific situations. Binding on NRS but taxpayers can challenge in court.',

  'Private Ruling': 'NRS\'s written opinion on how tax law applies to a specific taxpayer\'s situation. Binding on NRS for that taxpayer.',

  'Advance Tax Ruling': 'A binding opinion from NRS on the tax treatment of a proposed transaction. Gives certainty before you proceed.',

  'Tax Clearance': 'Official confirmation from NRS that your tax affairs are up to date. Required for government contracts and some transactions.',

  'Taxpayer Identification Number (TIN)': 'Your unique taxpayer identifier. Every individual and business must have one. Required for all tax filings and many business transactions.',

  'Value Added Tax (VAT) Number': 'Your registration number for VAT purposes. Display this on all VAT invoices. Format: VAT followed by digits.',

  'PAYE Number': 'Your registration number for Pay As You Earn employee tax. Used when remitting employee income tax to NRS.',

  'WHT Number': 'Your registration number for withholding tax. Used when deducting tax from payments to suppliers and contractors.',

  'Stamp Duty Number': 'Your registration for stamp duty purposes. Required if you frequently execute documents subject to stamp duty.',

  'Capital Gains Tax Account': 'A separate tax account for reporting gains from selling assets. Different from your regular company tax account.',

  'Education Tax Account': 'A separate account for TETFund contributions. Medium and large companies must maintain this.',

  'NITDA Levy Account': 'A separate account for technology levy if your business is in the tech sector and meets the threshold.',

  'NSITF Account': 'A separate account for Industrial Training Fund contributions if you have 5+ employees or meet the turnover threshold.',

  'Pension Account': 'Required for remitting employee pension contributions. Separate from tax accounts but monitored by regulators.',

  'Employee Compensation Fund': 'A fund providing benefits to employees injured at work. Funded by employer contributions.',

  'Group Life Insurance': 'Mandatory life insurance for employees, funded by employers. Required by law for most businesses.',

  'Health Insurance': 'Mandatory health coverage for employees under the National Health Insurance Scheme. Employers must contribute.',

  'Import Duty': 'Tax on goods brought into Nigeria. Rates vary by product type. Must be paid before customs releases goods.',

  'Export Duty': 'Tax on goods sent out of Nigeria. Most exports are duty-free, but some products may attract charges.',

  'Excise Duty': 'Tax on locally manufactured goods like alcohol and tobacco. Paid by manufacturers, often included in retail prices.',

  'Customs Duty': 'Tax collected by Nigeria Customs Service on imported goods. Separate from VAT and other taxes.',

  'Tariff Classification': 'The system for categorizing imported goods for tax purposes. The wrong classification can result in underpayment or overpayment.',

  'Harmonized System Code': 'An internationally standardized code for classifying traded products. Determines import duty rates.',

  'Rules of Origin': 'Criteria determining where a product was made. Affects which tax rates and trade agreements apply.',

  'Most Favored Nation': 'A trade status where a country gives another country the best trade terms it offers anyone. Affects import duties.',

  'Common External Tariff': 'A uniform import duty rate applied by all ECOWAS countries. Nigeria uses this for goods from non-ECOWAS countries.',

  'ECOWAS Trade Liberalization Scheme': 'An agreement allowing duty-free trade of approved goods between ECOWAS member countries.',

  'African Continental Free Trade Area': 'A recent agreement creating a single market across Africa. May reduce tariffs on intra-African trade.',

  'Bilateral Investment Treaty': 'An agreement between two countries protecting investments. May include tax provisions for investors.',

  'Double Taxation Agreement': 'A treaty preventing the same income being taxed in two countries. Nigeria has these with many countries.',

  'Permanent Establishment': 'A fixed place of business that creates tax obligations in a foreign country. Important for multinational companies.',

  'Source Principle': 'The rule that income is taxed where it is earned, not where the recipient lives. Basis of Nigeria\'s international tax rules.',

  'Residence Principle': 'The rule that residents are taxed on worldwide income, while non-residents are taxed only on Nigeria-sourced income.',

  'Transfer Pricing Adjustment': 'When NRS changes prices in related-party transactions to reflect fair market value. Can increase your taxable income.',

  'Arm\'s Length Principle': 'The standard that transactions between related companies should be priced as if they were between unrelated parties.',

  'OECD Guidelines': 'International standards for transfer pricing and tax matters. Nigeria generally follows these in its tax rules.',

  'BEPS Action Plan': 'The OECD\'s 15-point plan to stop multinational companies from avoiding tax. Nigeria has implemented several actions.',

  'Automatic Exchange of Information': 'The international system where countries share taxpayer information automatically. Helps catch offshore tax evasion.',

  'Common Reporting Standard': 'The OECD standard for automatic exchange of financial account information. Nigeria participates in this.',

  'Offshore Account': 'A bank account in another country. Must be reported to NRS if you\'re a Nigerian taxpayer.',

  'Shell Company': 'A company with no real business activity, often used to hide ownership or shift profits. NRS scrutinizes these closely.',

  'Beneficial Ownership': 'The real person who ultimately owns or controls a company. NRS requires disclosure of beneficial owners.',

  'Tax Loss Carryback': 'Using current losses to get refunds of taxes paid in previous years. Not generally allowed in Nigeria.',

  'Minimum Alternate Tax': 'A minimum tax based on assets or turnover, ensuring companies pay some tax even if they report losses.',

  'Book Profit': 'Profit shown in your financial statements, calculated using accounting rules. May differ from taxable profit.',

  'Tax Profit': 'Profit calculated using tax rules, which may differ from book profit due to different deductions and timing rules.',

  'Permanent Difference': 'An item that affects book profit but never affects taxable profit, or vice versa. For example, some fines are never deductible.',

  'Temporary Difference': 'An item that affects book and taxable profit in different periods. Creates deferred tax.',

  'Tax Base': 'The amount attributed to an asset or liability for tax purposes. Different from its accounting value.',

  'Carrying Amount': 'The value of an asset or liability in your financial statements. Also called book value.',

  'Recoverable Amount': 'The higher of an asset\'s fair value and its value in use. Used to test for impairment.',

  'Impairment Loss': 'A reduction in an asset\'s value. Recognized in accounts and may be deductible for tax.',

  'Revaluation Surplus': 'An increase in an asset\'s value above its original cost. May have tax implications when realized.',

  'Foreign Exchange Gain': 'Profit from currency fluctuations. Taxable in Nigeria when realized.',

  'Foreign Exchange Loss': 'Loss from currency fluctuations. May be deductible when realized.',

  'Hedging': 'Using financial instruments to protect against currency or price fluctuations. Gains and losses may have special tax treatment.',

  'Derivative': 'A financial contract whose value depends on an underlying asset. Complex tax rules apply to derivatives.',

  'Fair Value': 'The price an asset would fetch in an open market. Used for accounting and sometimes tax purposes.',

  'Mark-to-Market': 'Valuing assets at current market prices rather than historical cost. Creates unrealized gains and losses.',

  'Realized Gain': 'Profit from selling an asset. Taxable when realized.',

  'Unrealized Gain': 'Paper profit from an asset increasing in value while you still own it. Not taxable until realized.',

  'Contingent Liability': 'A potential future obligation depending on an uncertain event. May affect tax planning if likely to materialize.',

  'Provision': 'An amount set aside for a probable future expense. Deductible for tax only when the expense actually occurs.',

  'Reserve': 'Profits kept in the business for specific purposes. May be required by law or company policy.',

  'Distributable Profit': 'Profits available to pay as dividends. Calculated after accounting for taxes, reserves, and legal requirements.',

  'Interim Dividend': 'A dividend paid during the year, before final profits are known. Must be supported by available distributable profits.',

  'Final Dividend': 'The dividend declared after year-end when final profits are known. Approved by shareholders at the annual general meeting.',

  'Dividend Warrant': 'The document authorizing payment of a dividend. Includes tax deductions and payment details.',

  'Scrip Dividend': 'A dividend paid in additional shares rather than cash. Tax treatment may differ from cash dividends.',

  'Stock Dividend': 'Another term for scrip dividend. Additional shares given to shareholders instead of cash.',

  'Bonus Issue': 'Free additional shares given to existing shareholders. Does not involve cash but may have tax implications.',

  'Rights Issue': 'An offer to existing shareholders to buy additional shares at a discount. The difference between market and issue price may have tax implications.',

  'Share Buyback': 'When a company repurchases its own shares from shareholders. May be treated as a dividend for tax purposes.',

  'Redeemable Preference Share': 'A share that the company can buy back at a future date. May have debt-like tax treatment.',

  'Convertible Bond': 'A bond that can be converted into shares. Complex tax treatment during conversion.',

  'Warrant': 'A right to buy shares at a specific price. May have tax implications when exercised.',

  'Option': 'A contract giving the right to buy or sell at a set price. Tax treatment depends on whether it\'s a employee option or investment.',

  'Employee Share Option': 'A right given to employees to buy company shares at a discount. Taxable as employment income when exercised.',

  'Restricted Stock Unit': 'A promise to give employees shares in the future. Taxable when the restriction lapses and shares vest.',

  'Performance Share': 'Shares given to employees based on achieving targets. Taxable when earned.',

  'Golden Parachute': 'A large payment to executives if the company is taken over. May have special tax treatment and limits.',

  'Severance Pay': 'Payment to employees when leaving the company. Taxable as employment income.',

  'Gratuity': 'A lump sum payment to employees on retirement. May have tax exemptions up to certain limits.',

  'Pension Contribution': 'Money paid into a retirement fund. Employer contributions are deductible. Employee contributions may get tax relief.',

  'Annuity': 'A regular payment, usually from a pension or insurance policy. Taxable as income when received.',

  'Life Insurance Premium': 'Payment for life insurance. May be deductible for group policies covering employees.',

  'Keyman Insurance': 'Insurance on the life of an important employee. Premiums may be deductible but payouts may be taxable.',

  'Professional Indemnity Insurance': 'Insurance covering professional mistakes. Premiums are deductible business expenses.',

  'Public Liability Insurance': 'Insurance covering injury to third parties. Premiums are deductible business expenses.',

  'Property Insurance': 'Insurance covering buildings and contents. Premiums are deductible.',

  'Business Interruption Insurance': 'Insurance covering lost profits during disruptions. Premiums are deductible, payouts are taxable.',

  'Cyber Insurance': 'Insurance covering data breaches and cyber attacks. Increasingly important and premiums are deductible.',

  'Directors and Officers Insurance': 'Insurance covering legal liability of directors. Premiums are usually deductible.',

  'Employment Practices Liability': 'Insurance covering employee-related lawsuits. Premiums are deductible.',

  'Fidelity Guarantee': 'Insurance covering employee theft or fraud. Premiums are deductible.',

  'Money Insurance': 'Insurance covering cash on premises or in transit. Premiums are deductible.',

  'Goods in Transit Insurance': 'Insurance covering products while being delivered. Premiums are deductible.',

  'Marine Insurance': 'Insurance covering ships and cargo. Essential for import/export businesses.',

  'Aviation Insurance': 'Insurance covering aircraft and related risks. Required by law for aviation businesses.',

  'Agricultural Insurance': 'Insurance covering crops and livestock. May be subsidized by government programs.',

  'Mortgage Insurance': 'Insurance covering loan default. Premiums may be deductible for business properties.',

  'Title Insurance': 'Insurance protecting property ownership rights. Premiums may be capitalized rather than deducted.',

  'Escrow': 'A third-party holding funds until conditions are met. Common in property transactions and may have tax timing implications.',

  'Trust': 'A legal arrangement where one party holds assets for another\'s benefit. Complex tax rules apply to trusts.',

  'Estate Planning': 'Organizing your assets to minimize tax when passing them to heirs. Includes wills, trusts, and gifts.',

  'Inheritance Tax': 'Tax on assets received from a deceased person. Nigeria does not currently have inheritance tax, but probate fees apply.',

  'Gift Tax': 'Tax on giving assets to others. Nigeria does not currently have gift tax, but large gifts may attract other taxes.',

  'Probate': 'The legal process of distributing a deceased person\'s estate. Required before assets can be transferred.',

  'Executor': 'The person appointed to carry out the terms of a will. Responsible for filing final tax returns and distributing assets.',

  'Administrator': 'Someone appointed by court to manage an estate when there is no will. Has similar duties to an executor.',

  'Letter of Administration': 'A court document giving someone authority to manage an estate without a will.',

  'Will': 'A legal document stating how your assets should be distributed after death. Should be kept up to date and properly witnessed.',

  'Codicil': 'An amendment to a will. Must be executed with the same formalities as the original will.',

  'Living Will': 'A document stating your wishes for medical treatment if you become unable to communicate.',

  'Power of Attorney for Tax Matters': 'Authorization for someone to handle your tax affairs. Must be specific and may need NRS approval.',

  'Tax Representative': 'A person authorized to deal with NRS on your behalf. Can be an accountant, lawyer, or family member.',

  'Tax Agent': 'A professional who prepares and files tax returns for others. Must be registered with a professional body.',

  'Chartered Accountant': 'A certified accounting professional. Can provide tax advice and represent clients before NRS.',

  'Tax Consultant': 'A specialist in tax planning and compliance. May or may not be a qualified accountant.',

  'Legal Practitioner': 'A qualified lawyer. Can provide legal tax advice and represent clients in tax tribunals and courts.',

  'Compliance Officer': 'A company employee responsible for ensuring tax and regulatory compliance.',

  'Internal Auditor': 'An employee who checks the company\'s financial and tax records for errors and fraud.',

  'External Auditor': 'An independent accountant who reviews the company\'s financial statements. Required for large companies.',

  'Forensic Accountant': 'A specialist in investigating financial fraud and disputes. May be engaged for complex tax investigations.',

  'Tax Investigator': 'An NRS official who examines taxpayers\' records for compliance and fraud.',

  'Revenue Officer': 'An NRS official responsible for assessing and collecting taxes in a specific area.',

  'Tax Collector': 'An official authorized to collect taxes. Can take enforcement action against non-compliant taxpayers.',

  'Court of Appeal': 'The court that hears appeals from the Tax Tribunal and Federal High Court on tax matters.',

  'Supreme Court': 'Nigeria\'s highest court. Final arbiter on tax disputes that reach it.',

  'Federal High Court': 'A court that hears serious tax cases, including criminal tax evasion.',

  'State High Court': 'A state-level court that hears tax cases within its jurisdiction.',

  'Magistrate Court': 'A lower court that handles minor tax offenses and preliminary matters.',

  'Area Court': 'A court in Northern Nigeria that handles certain tax matters under Sharia law.',

  'Customary Court': 'A court that applies traditional law. May hear tax disputes in some communities.',

  'Alternative Dispute Resolution': 'Methods of resolving tax disputes without going to court, including mediation and arbitration.',

  'Mediation': 'A neutral third party helps taxpayers and NRS reach agreement. Faster and cheaper than court.',

  'Arbitration': 'A neutral third party makes a binding decision on a tax dispute. More formal than mediation.',

  'Tax Amnesty Program': 'A government offer to waive penalties for taxpayers who declare previously hidden income.',

  'Voluntary Asset and Income Declaration Scheme': 'A Nigerian tax amnesty program that allowed declaration of hidden assets with reduced penalties.',

  'Whistleblower Policy': 'NRS rewards people who report tax evasion with a percentage of recovered taxes.',

  'Taxpayer Service Department': 'The NRS unit that helps taxpayers understand their obligations and resolve issues.',

  'Large Taxpayer Office': 'An NRS unit dedicated to big companies. Provides personalized service and closer monitoring.',

  'Medium Taxpayer Office': 'An NRS unit for medium-sized businesses.',

  'Small Taxpayer Office': 'An NRS unit for small businesses and individual taxpayers.',

  'Taxpayer Account': 'Your record with NRS showing all filings, payments, and correspondence.',

  'Taxpayer History': 'A record of your past compliance, disputes, and arrangements with NRS. Affects how NRS treats you.',

  'Compliance History': 'Your record of filing and paying taxes on time. Good history means lower audit risk.',

  'Risk Profile': 'NRS\'s assessment of how likely you are to underpay tax. Based on your industry, size, and compliance history.',

  'Audit Selection': 'How NRS chooses which taxpayers to audit. Based on risk profiling, random selection, and specific triggers.',

  'Audit Notification': 'The formal letter NRS sends before auditing you. Usually gives 14-30 days notice.',

  'Audit Scope': 'The specific taxes and periods NRS will examine during an audit.',

  'Audit Evidence': 'Documents and information NRS examines during an audit. Includes records, invoices, bank statements.',

  'Audit Finding': 'NRS\'s conclusion from an audit. May result in additional tax, penalties, or clearance.',

  'Audit Report': 'The formal document summarizing audit findings and recommendations.',

  'Management Letter': 'A letter from auditors to management about weaknesses in financial controls. Not a tax document but may trigger tax review.',

  'Qualified Audit Opinion': 'An auditor\'s report with reservations about the financial statements. May trigger NRS interest.',

  'Adverse Audit Opinion': 'An auditor\'s report stating financial statements are materially misstated. Almost certainly triggers NRS investigation.',

  'Disclaimer of Opinion': 'When auditors cannot form an opinion due to lack of information. Serious red flag for NRS.',

  'Going Concern': 'An auditor\'s assessment that a company can continue operating. If in doubt, may affect tax treatment of losses.',

  'Materiality': 'The threshold above which errors or omissions affect decisions. Used by auditors and NRS to focus on significant items.',

  'Substance Over Form': 'The principle that the economic reality of a transaction matters more than its legal form. NRS uses this to challenge tax avoidance.',

  'Revenue Neutrality': 'A tax change that raises the same total revenue as the old system, just distributed differently.',

  'Tax Freedom Day': 'The day of the year when you stop working for the government and start working for yourself. Calculated by dividing total taxes by income.',

  'Tax Wedge': 'The difference between what employers pay and what employees receive, due to taxes and social contributions.',

  'Laffer Curve': 'The theory that tax rates can be so high that reducing them increases revenue. Debated in tax policy.',

  'Optimal Taxation': 'The theory of designing tax systems to maximize welfare while raising required revenue.',

  'Pigouvian Tax': 'A tax on harmful activities to correct market failures. Carbon taxes are Pigouvian.',

  'Tax Morale': 'Willingness to pay taxes voluntarily. Affected by trust in government, fairness, and enforcement.',

  'Tax Culture': 'Social attitudes and norms around paying taxes. Important for voluntary compliance.',

  'Tax Education': 'Programs to help taxpayers understand their obligations. NRS and private organizations provide this.',

  'Tax Literacy': 'The level of understanding taxpayers have about tax laws and obligations. Low literacy increases non-compliance.',

  'Voluntary Compliance': 'Paying taxes correctly without being forced. The ideal state for a tax system.',

  'Enforced Compliance': 'Paying taxes because of audits, penalties, and other enforcement. Necessary but costly.',

  'Deterrence': 'The effect of enforcement on discouraging tax evasion. Higher penalties and audit probability increase deterrence.',

  'Tax Certainty': 'The predictability and clarity of tax rules. Important for business planning and investment.',

  'Tax Stability': 'Consistency of tax rules over time. Frequent changes make planning difficult.',

  'Tax Transparency': 'Clear and open communication about tax rules, rulings, and enforcement. Helps taxpayers comply.',

  'Taxpayer Rights': 'Legal protections for taxpayers, including the right to appeal, privacy, and fair treatment.',

  'Taxpayer Charter': 'A document setting out taxpayers\' rights and NRS\'s service commitments.',

  'Service Level Agreement': 'A commitment to provide certain services within specified timeframes.',

  'Complaint Mechanism': 'The process for taxpayers to complain about NRS service or decisions.',

  'Ombudsman': 'An independent official who investigates complaints about government agencies, including NRS.',

  'Freedom of Information': 'The right to access government information, including some tax rulings and guidance.',

  'Data Protection': 'Rules about how NRS collects, uses, and shares taxpayer information.',

  'Tax Secrecy': 'The legal obligation of NRS staff to keep taxpayer information confidential.',

  'Information Exchange': 'Sharing taxpayer information with other countries\' tax authorities.',

  'Spontaneous Exchange': 'Voluntary sharing of information about suspected tax evasion.',

  'Automatic Exchange': 'Systematic sharing of financial account information.',

  'Exchange on Request': 'Sharing information in response to a specific request from another tax authority.',

  'Harmful Tax Practice': 'A tax regime that unfairly attracts mobile income without real economic activity.',

  'Patent Box': 'A tax incentive that reduces tax on profits from patents and other intellectual property.',

  'Intellectual Property Regime': 'A tax regime for income from intellectual property. Must meet OECD standards to avoid being harmful.',

  'Substantial Activity Requirement': 'A rule that tax incentives require real economic activity, not just paper transactions.',

  'Nexus Approach': 'Linking tax benefits to actual research and development activities in a country.',

  'Research and Development Tax Credit': 'A tax credit for spending on research and development. Encourages innovation.',

  'Super Deduction': 'A deduction greater than 100% of the expense. For example, 130% deduction for R&D spending.',

  'Enhanced Capital Allowance': 'Accelerated depreciation for certain assets. Allows faster tax relief for investment.',

  'First-Year Allowance': 'A deduction for the full cost of an asset in the year of purchase.',

  'Annual Investment Allowance': 'A deduction for a specified amount of capital expenditure each year.',

  'Writing Down Allowance': 'Annual depreciation on the reducing balance of an asset pool.',

  'Small Pools Allowance': 'A provision allowing immediate write-off of small asset pools.',

  'Balancing Allowance': 'A deduction when disposing of an asset for less than its written-down value.',

  'Balancing Charge': 'Taxable income when disposing of an asset for more than its written-down value.',

  'Short-Life Asset': 'An asset expected to last less than a specified period, qualifying for faster depreciation.',

  'Long-Life Asset': 'An asset expected to last more than a specified period, with slower depreciation.',

  'Integral Feature': 'A building component like electrical or plumbing systems. May qualify for capital allowances.',

  'Fixtures': 'Items attached to land or buildings. May qualify for capital allowances.',

  'Plant and Machinery': 'Business equipment and machinery. Usually qualifies for capital allowances.',

  'Industrial Building': 'A building used for manufacturing or similar purposes. May qualify for special capital allowances.',

  'Commercial Building': 'A building used for business purposes. Usually does not qualify for capital allowances in Nigeria.',

  'Agricultural Building': 'A building used for farming. May qualify for special capital allowances.',

  'Hotel Building': 'A building used as a hotel. May qualify for special capital allowances.',

  'Mineral Exploration': 'Searching for mineral resources. Costs may qualify for special tax treatment.',

  'Mining': 'Extracting mineral resources. Subject to special tax rules and royalties.',

  'Petroleum Profit Tax': 'A special tax on oil and gas companies. Rate is 50-85% depending on the contract type.',

  'Production Sharing Contract': 'An agreement between government and oil companies on how production and profits are shared.',

  'Royalty': 'A payment to the government for extracting natural resources. Usually a percentage of production value.',

  'Rent': 'A payment for using property or resources. Deductible as a business expense.',

  'Premium': 'An upfront payment for a lease or right. May be capitalized or deducted over time.',

  'Service Charge': 'A payment for maintenance and services in a building. Usually deductible as an expense.',

  'Insurance Premium': 'Payment for insurance coverage. Deductible if the insurance is for business purposes.',

  'Insurance Claim': 'Payment received from an insurer. Taxable if it replaces taxable income.',

  'Indemnity': 'A payment to compensate for loss or damage. Tax treatment depends on what is being compensated.',

  'Damages': 'A payment for breach of contract or tort. Tax treatment depends on the nature of the claim.',

  'Compensation': 'A payment for loss or injury. Taxable if it replaces taxable income.',

  'Ex Gratia Payment': 'A voluntary payment without legal obligation. Taxable as income unless specifically exempt.',

  'Settlement': 'An agreement to resolve a dispute. Tax treatment depends on what the settlement is for.',

  'Covenant': 'A promise in a contract or deed.',

  'Easement': 'A right to use another\'s land.',

  'Tenancy': 'A right to occupy land for a term.',

  'Lease': 'A contract granting a tenancy.',

  'Forfeiture': 'The landlord\'s right to terminate a lease for breach.',

  'Franchise': 'A business arrangement where one party licenses another to use its brand and systems.',

  'Franchise Fee': 'The payment for a franchise.',

  'Royalty Fee': 'A continuing payment based on sales.',

  'Territory': 'The geographic area covered by a franchise.',

  'Joint Venture': 'A business arrangement where parties share profits and losses.',

  'Partnership': 'A business owned by two or more people.',

  'Partnership Agreement': 'The contract governing a partnership.',

  'Partner': 'A member of a partnership.',

  'Partnership Property': 'Property owned by the partnership.',

  'Partnership Capital': 'The total contributions of partners.',

  'Partnership Drawings': 'Amounts taken by partners from the partnership.',

  'Partnership Profit': 'The profit of the partnership, allocated to partners.',

  'Partnership Loss': 'The loss of the partnership, allocated to partners.',

  'Partnership Dissolution': 'The ending of a partnership.',

  'Partnership Goodwill': 'The value of a partnership\'s reputation and customer relationships.',

  'Partnership Buyout': 'One partner buying out another\'s interest.',

  'Partnership Admission': 'A new partner joining the partnership.',

  'Partnership Retirement': 'A partner leaving the partnership.',

  'Partnership Expulsion': 'Removing a partner from the partnership.',

  'Partnership Arbitration': 'Resolving partnership disputes through arbitration.',

  'Partnership Mediation': 'Resolving partnership disputes through mediation.',

  'Balance Sheet': 'A snapshot of your business\'s financial position: assets, liabilities, and equity at a specific date.',

  'Income Statement': 'A report showing your revenue, expenses, and profit over a period. Also called Profit & Loss statement.',

  'Cash Flow Statement': 'A report showing money coming in and going out. Different from profit because it includes loan repayments and asset purchases.',

  'Break-Even Point': 'The sales level where your business covers all costs but makes no profit. Below this, you lose money. Above it, you make profit.',

  'Working Capital': 'Current assets minus current liabilities. Shows whether you have enough short-term funds to pay bills and operate.',

  'Debt-to-Equity Ratio': 'Total debt divided by total equity. Lenders and NRS use this to assess financial health. Higher ratios mean more financial risk.',

  'Return on Investment': 'Profit divided by investment amount. Shows how efficiently your business uses money. Higher is better.',

  'Gross Margin': 'Gross profit divided by revenue, as a percentage. Shows how much you keep from each sale before operating expenses.',

  'Net Margin': 'Net profit divided by revenue, as a percentage. The ultimate measure of profitability.',

  'EBITDA': 'Earnings Before Interest, Tax, Depreciation, and Amortization. A measure of operating profit that ignores financing and accounting choices.',

  'Working Days': 'Business days excluding weekends and public holidays. Used to calculate deadlines and payment periods.',

  'Month-End': 'The last day of the month. Many tax deadlines and reporting periods end on month-end.',

  'WTO Agreement': 'The foundational treaty of the World Trade Organization. Sets rules for international trade, including some tax matters.',

  'GATT': 'The General Agreement on Tariffs and Trade. The predecessor to the WTO.',

  'Trade Facilitation Agreement': 'A WTO agreement to simplify customs procedures and reduce trade costs.',

  'Technical Barriers to Trade': 'WTO rules on product standards and regulations that may affect trade.',

  'Sanitary and Phytosanitary Measures': 'WTO rules on food safety and animal/plant health standards.',

  'Subsidies and Countervailing Measures': 'WTO rules on government subsidies and the duties that can be imposed in response.',

  'Anti-Dumping Agreement': 'WTO rules on when and how anti-dumping duties can be imposed.',

  'Agreement on Trade-Related Aspects of Intellectual Property Rights': 'WTO rules on intellectual property, including some tax provisions.',

  'General Agreement on Trade in Services': 'WTO rules on international trade in services. Includes some tax provisions.',

  'Agreement on Government Procurement': 'WTO rules on government purchasing. May include tax-related conditions.',

  'Information Technology Agreement': 'A WTO agreement eliminating duties on many technology products.',

  'Pharmaceutical Agreement': 'A WTO agreement eliminating duties on many medicines.',

  'Micro, Small and Medium Enterprises': 'Small businesses that may qualify for special tax regimes and incentives.',

  'Informal Sector': 'Businesses that are not registered or regulated. May include unregistered tax evaders.',

  'Tax Evasion': 'Illegal non-payment of taxes: hiding income, fake deductions, or not filing returns. Can result in fines and imprisonment.',

  'Tax Avoidance': 'Legal reduction of taxes through planning and using available deductions and incentives. Different from illegal evasion.',

  'Whistleblower': 'Someone who reports tax evasion to NRS. Nigeria has a program that rewards whistleblowers with a percentage of recovered taxes.',
};
