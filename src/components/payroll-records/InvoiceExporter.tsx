import { PayrollSummary } from "../dashboard/PayrollSummary";
import { NetPaySummary } from "../dashboard/NetPaySummary";
import { PayrollRecord } from "@/lib/types";
import { format } from "date-fns";
import html2pdf from 'html2pdf.js';

export async function exportToPDF(record: PayrollRecord) {
  // First page container
  const firstPage = document.createElement('div');
  firstPage.className = 'p-8 bg-white min-h-screen';
  firstPage.style.pageBreakAfter = 'always';
  
  // Header section
  const header = document.createElement('div');
  header.className = 'flex justify-between items-start mb-12';
  header.innerHTML = `
    <div class="flex items-center gap-6">
      <img 
        src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png"
        alt="LuckyBird Logo"
        class="w-24 h-24 object-contain"
        crossorigin="anonymous"
      />
      <div>
        <h1 class="text-3xl font-bold text-[#33C3F0]">LuckyBird</h1>
        <div class="text-gray-600 mt-2">
          732 N. Madelia St.<br/>
          Spokane, WA 99202<br/>
          +1 (509) 508-2229
        </div>
      </div>
    </div>
    <div class="text-right">
      <h2 class="text-2xl font-semibold mb-2">Payroll Invoice</h2>
      <p class="text-gray-600">
        Pay Period:<br/>
        ${format(record.payPeriod.startDate, "MMM d, yyyy")} - ${format(record.payPeriod.endDate, "MMM d, yyyy")}
      </p>
    </div>
  `;
  firstPage.appendChild(header);

  // Payroll Summary section with title
  const summaryTitle = document.createElement('h3');
  summaryTitle.className = 'text-xl font-semibold mb-4 text-gray-800';
  summaryTitle.textContent = 'Payroll Summary';
  firstPage.appendChild(summaryTitle);

  // Add PayrollSummary component
  const summaryContainer = document.createElement('div');
  summaryContainer.className = 'mb-12 bg-[#33C3F0]/5 rounded-lg p-8';
  summaryContainer.innerHTML = await renderComponent(
    <PayrollSummary 
      startDate={record.payPeriod.startDate} 
      endDate={record.payPeriod.endDate}
    />
  );
  firstPage.appendChild(summaryContainer);

  // Second page container
  const secondPage = document.createElement('div');
  secondPage.className = 'p-8 bg-white min-h-screen';
  secondPage.style.pageBreakBefore = 'always';

  // Net Pay Summary title for second page
  const netPayTitle = document.createElement('h3');
  netPayTitle.className = 'text-xl font-semibold mb-4 text-gray-800';
  netPayTitle.textContent = 'Overall Net Pay Summary';
  secondPage.appendChild(netPayTitle);

  // Add NetPaySummary component to second page
  const netPayContainer = document.createElement('div');
  netPayContainer.className = 'bg-[#33C3F0]/5 rounded-lg p-8';
  netPayContainer.style.breakInside = 'avoid';
  netPayContainer.innerHTML = await renderComponent(
    <NetPaySummary 
      startDate={record.payPeriod.startDate} 
      endDate={record.payPeriod.endDate}
    />
  );
  secondPage.appendChild(netPayContainer);

  // Create a wrapper for both pages
  const container = document.createElement('div');
  container.appendChild(firstPage);
  container.appendChild(secondPage);

  // Configure PDF options for legal size and landscape orientation
  const opt = {
    margin: [0.5, 0.5],
    filename: `payroll-invoice-${format(record.payPeriod.startDate, "yyyy-MM-dd")}.pdf`,
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
      format: 'legal', 
      orientation: 'landscape'
    },
    pagebreak: { mode: 'avoid-all' }
  };

  // Generate PDF
  return html2pdf().set(opt).from(container).save();
}

// Helper function to render React components to HTML string
async function renderComponent(component: React.ReactElement): Promise<string> {
  const tempDiv = document.createElement('div');
  const root = document.createElement('div');
  tempDiv.appendChild(root);
  
  return new Promise((resolve) => {
    import('react-dom/client').then((ReactDOM) => {
      const reactRoot = ReactDOM.createRoot(root);
      reactRoot.render(component);
      
      // Wait for rendering to complete
      setTimeout(() => {
        const html = root.innerHTML;
        reactRoot.unmount();
        resolve(html);
      }, 100);
    });
  });
}