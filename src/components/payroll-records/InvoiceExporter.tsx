import { PayrollRecord } from "@/lib/types";
import { PayrollSummary } from "../dashboard/PayrollSummary";
import { NetPaySummary } from "../dashboard/NetPaySummary";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";

export async function exportToPDF(record: PayrollRecord) {
  // Create a temporary container
  const container = document.createElement('div');
  container.className = 'p-8 bg-white';
  
  // Add header section
  const header = document.createElement('div');
  header.className = 'flex justify-between items-start mb-12';
  header.innerHTML = `
    <div class="flex items-start gap-6">
      <img 
        src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png"
        alt="LuckyBird Logo"
        class="w-24 h-24 object-contain"
        crossorigin="anonymous"
      />
      <div>
        <h1 class="text-3xl font-bold">LuckyBird</h1>
        <div class="text-gray-600 mt-2">
          <p>732 N. Madelia St.</p>
          <p>Spokane, WA 99202</p>
          <p>+1 (509) 508-2229</p>
        </div>
      </div>
    </div>
    <div class="text-right">
      <h2 class="text-2xl font-bold mb-2">Payroll Invoice</h2>
      <p class="text-gray-600">
        Pay Period:<br/>
        ${format(record.payPeriod.startDate, "MMM d, yyyy")} - ${format(record.payPeriod.endDate, "MMM d, yyyy")}
      </p>
    </div>
  `;
  container.appendChild(header);

  // Add PayrollSummary
  const summaryContainer = document.createElement('div');
  summaryContainer.className = 'mb-8';
  const payrollSummary = document.createElement('div');
  payrollSummary.innerHTML = `
    <div class="bg-[#E5F6FD] p-6 rounded-lg mb-8">
      <h3 class="text-xl font-semibold mb-4">Payroll Summary</h3>
      ${await renderComponent(
        <PayrollSummary 
          startDate={record.payPeriod.startDate} 
          endDate={record.payPeriod.endDate}
        />
      )}
    </div>
  `;
  summaryContainer.appendChild(payrollSummary);
  container.appendChild(summaryContainer);

  // Add NetPaySummary
  const netPayContainer = document.createElement('div');
  netPayContainer.className = 'mb-8';
  const netPaySummary = document.createElement('div');
  netPaySummary.innerHTML = `
    <div class="bg-[#E5F6FD] p-6 rounded-lg">
      <h3 class="text-xl font-semibold mb-4">Overall Net Pay Summary</h3>
      ${await renderComponent(
        <NetPaySummary 
          startDate={record.payPeriod.startDate} 
          endDate={record.payPeriod.endDate}
        />
      )}
    </div>
  `;
  netPayContainer.appendChild(netPaySummary);
  container.appendChild(netPayContainer);

  // Configure PDF options
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
      format: 'letter', 
      orientation: 'landscape'
    }
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