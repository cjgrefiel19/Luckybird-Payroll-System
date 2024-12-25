import { useState, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { PayrollRecord } from "@/lib/types";
import { Trash2, ExternalLink, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2pdf from "html2pdf.js";
import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";

export function PayrollRecords() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedRecords = localStorage.getItem('payrollRecords');
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords).map((record: any) => ({
        ...record,
        payPeriod: {
          startDate: new Date(record.payPeriod.startDate),
          endDate: new Date(record.payPeriod.endDate),
        },
        createdAt: new Date(record.createdAt),
      }));
      setRecords(parsedRecords);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payrollRecords', JSON.stringify(records));
  }, [records]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "The payroll record has been deleted successfully.",
    });
  };

  const handleCommentChange = (id: string, comment: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, comments: comment } : record
      )
    );
  };

  const handleExport = async (record: PayrollRecord) => {
    // Create a temporary div to render the invoice content
    const tempDiv = document.createElement('div');
    tempDiv.className = 'p-4 space-y-4 relative max-w-[1200px] mx-auto';
    
    // Create the invoice content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'bg-white rounded-lg shadow-lg p-8';
    
    // Add header content
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
    
    // Render PayrollSummary
    const payrollSummary = document.createElement('div');
    payrollSummary.appendChild(
      await renderComponent(
        <PayrollSummary 
          startDate={record.payPeriod.startDate} 
          endDate={record.payPeriod.endDate} 
        />
      )
    );
    
    // Render NetPaySummary
    const netPaySummary = document.createElement('div');
    netPaySummary.appendChild(
      await renderComponent(
        <NetPaySummary 
          startDate={record.payPeriod.startDate} 
          endDate={record.payPeriod.endDate} 
        />
      )
    );
    
    summaryDiv.appendChild(payrollSummary);
    summaryDiv.appendChild(netPaySummary);
    contentDiv.appendChild(summaryDiv);
    tempDiv.appendChild(contentDiv);
    
    // Configure PDF export options
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

    try {
      await html2pdf().set(opt).from(tempDiv).save();
      toast({
        title: "Success",
        description: "Invoice exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export invoice",
        variant: "destructive",
      });
    }
  };

  // Helper function to render React components to HTML
  const renderComponent = async (component: React.ReactElement): Promise<HTMLElement> => {
    const tempContainer = document.createElement('div');
    const root = ReactDOM.createRoot(tempContainer);
    root.render(component);
    
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return tempContainer;
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Pay Period</TableHead>
                <TableHead className="text-center">Generated Link</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Comments/Notes</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-center">
                    {format(record.payPeriod.startDate, "PP")} -{" "}
                    {format(record.payPeriod.endDate, "PP")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="link"
                      className="gap-2"
                      onClick={() => window.open(record.generatedLink, '_blank')}
                    >
                      View Invoice <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        record.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      value={record.comments}
                      onChange={(e) =>
                        handleCommentChange(record.id, e.target.value)
                      }
                      className="text-center"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleExport(record)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}