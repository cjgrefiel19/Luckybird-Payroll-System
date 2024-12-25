import { PayrollRecord } from "@/lib/types";
import { PayrollSummary } from "../dashboard/PayrollSummary";
import { NetPaySummary } from "../dashboard/NetPaySummary";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import * as ReactDOMServer from 'react-dom/server';

export async function renderInvoiceContent(record: PayrollRecord): Promise<HTMLElement> {
  const tempDiv = document.createElement('div');
  tempDiv.className = 'p-4 space-y-4 relative max-w-[1200px] mx-auto';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'bg-white rounded-lg shadow-lg p-8';
  
  const headerDiv = document.createElement('div');
  headerDiv.className = 'flex justify-between items-start mb-8 border-b pb-6';
  headerDiv.innerHTML = `
    <div class="flex items-center gap-6">
      <img 
        src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png"
        alt="LuckyBird Logo"
        class="w-24 h-24 object-contain"
        crossOrigin="anonymous"
      />
      <div>
        <h1 class="text-3xl font-bold text-primary">LuckyBird</h1>
        <address class="not-italic text-muted-foreground mt-2">
          732 N. Madelia St.<br />
          Spokane, WA 99202<br />
          +1 (509) 508-2229
        </address>
      </div>
    </div>
    <div class="text-right">
      <h2 class="text-2xl font-semibold mb-2">Payroll Invoice</h2>
      <p class="text-muted-foreground">
        Pay Period:<br />
        ${format(record.payPeriod.startDate, "PP")} - ${format(record.payPeriod.endDate, "PP")}
      </p>
    </div>
  `;
  
  contentDiv.appendChild(headerDiv);

  // Create container for PayrollSummary and NetPaySummary
  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'space-y-8';

  // Render PayrollSummary component
  const payrollSummaryDiv = document.createElement('div');
  const payrollSummaryHtml = ReactDOMServer.renderToString(
    <PayrollSummary 
      startDate={record.payPeriod.startDate} 
      endDate={record.payPeriod.endDate} 
    />
  );
  payrollSummaryDiv.innerHTML = payrollSummaryHtml;

  // Render NetPaySummary component
  const netPaySummaryDiv = document.createElement('div');
  const netPaySummaryHtml = ReactDOMServer.renderToString(
    <NetPaySummary 
      startDate={record.payPeriod.startDate} 
      endDate={record.payPeriod.endDate} 
    />
  );
  netPaySummaryDiv.innerHTML = netPaySummaryHtml;

  summaryDiv.appendChild(payrollSummaryDiv);
  summaryDiv.appendChild(netPaySummaryDiv);
  contentDiv.appendChild(summaryDiv);
  tempDiv.appendChild(contentDiv);

  return tempDiv;
}

export async function exportToPDF(record: PayrollRecord) {
  const content = await renderInvoiceContent(record);
  
  const opt = {
    margin: 1,
    filename: `invoice-${record.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      letterRendering: true,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait',
    }
  };

  return html2pdf().set(opt).from(content).save();
}