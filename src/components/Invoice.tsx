import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { DirectoryEntry } from "@/lib/types";
import { InvoiceWatermark } from "./agent-invoice/InvoiceWatermark";
import html2pdf from "html2pdf.js";

export function Invoice() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isPaid, setIsPaid] = useState(false);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      setDirectoryData(JSON.parse(savedDirectory));
    }
  }, []);

  useEffect(() => {
    if (!recordId) {
      navigate('/');
      return;
    }

    const savedRecords = localStorage.getItem('payrollRecords');
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const record = records.find((r: any) => r.id === recordId);
      
      if (record) {
        setStartDate(new Date(record.payPeriod.startDate));
        setEndDate(new Date(record.payPeriod.endDate));
        setIsPaid(record.status === 'Paid');
      } else {
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [recordId, navigate, toast]);

  const handleMarkAsPaid = () => {
    if (!recordId) return;
    
    setIsPaid(true);
    
    const savedRecords = localStorage.getItem('payrollRecords');
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const updatedRecords = records.map((record: any) =>
        record.id === recordId ? { ...record, status: 'Paid' } : record
      );
      localStorage.setItem('payrollRecords', JSON.stringify(updatedRecords));
    }

    toast({
      title: "Invoice Marked as Paid",
      description: "The invoice has been marked as paid successfully.",
    });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    const opt = {
      margin: [0.5, 0.5],
      filename: `invoice-${recordId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'landscape',
      }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!startDate || !endDate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice data...</div>
      </div>
    );
  }

  const getDirectoryInfo = (name: string) => {
    return directoryData.find(entry => 
      entry.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="w-full" style={{ 
        backgroundColor: 'rgba(135, 206, 235, 0.4)',
        margin: '0',
        padding: '0',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
      }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-6">
              <img 
                src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png"
                alt="LuckyBird Logo"
                className="w-24 h-24 object-contain mix-blend-multiply"
              />
              <div>
                <h1 className="text-3xl font-bold text-primary">LuckyBird</h1>
                <address className="not-italic text-muted-foreground mt-2">
                  732 N. Madelia St.<br />
                  Spokane, WA 99202<br />
                  +1 (509) 508-2229
                </address>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-2xl font-semibold mb-2">Payroll Invoice</h2>
              <p className="text-muted-foreground">
                Pay Period:<br />
                {format(startDate, "PP")} - {format(endDate, "PP")}
              </p>
              {directoryData.length > 0 && (
                <div className="mt-4 text-muted-foreground">
                  {getDirectoryInfo(recordId?.split('-')[0] || '')?.position}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isPaid && <InvoiceWatermark show={true} />}
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            <PayrollSummary startDate={startDate} endDate={endDate} />
            <NetPaySummary startDate={startDate} endDate={endDate} />
          </div>

          {!isPaid && (
            <div className="flex justify-end mt-8 gap-4">
              <Button onClick={handleMarkAsPaid} className="bg-green-500 hover:bg-green-600">
                Mark as Paid
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline">
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
