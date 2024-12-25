import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { DirectoryEntry, AttendanceEntry } from "@/lib/types";
import { InvoiceWatermark } from "./agent-invoice/InvoiceWatermark";
import { InvoiceHeader } from "./agent-invoice/InvoiceHeader";
import { SummaryCards } from "./agent-invoice/SummaryCards";
import { InvoiceTable } from "./agent-invoice/InvoiceTable";
import html2pdf from "html2pdf.js";
import { FileDown } from "lucide-react";
import {
  calculateTotalHours,
  calculateOTHours,
  calculateHolidayHours,
  calculateLeaveDays,
  calculateTotalEarnings,
} from "@/utils/invoiceCalculations";

export function Invoice() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isPaid, setIsPaid] = useState(false);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      setDirectoryData(JSON.parse(savedDirectory));
    }

    // Load attendance entries
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
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

  const totalHours = calculateTotalHours(entries);
  const totalOTHours = calculateOTHours(entries);
  const holidayHours = calculateHolidayHours(entries);
  const leaveDays = calculateLeaveDays(entries);
  const totalEarnings = calculateTotalEarnings(entries);

  const agentName = recordId?.split('-')[0] || '';
  const position = getDirectoryInfo(agentName)?.position;

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <InvoiceHeader 
        agentName={agentName}
        startDate={startDate}
        endDate={endDate}
        position={position}
      />

      <div className="max-w-7xl mx-auto px-4" style={{ paddingTop: "calc(2rem + 200px)" }}>
        {isPaid && <InvoiceWatermark show={true} />}
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            <SummaryCards
              totalHours={totalHours}
              totalOTHours={totalOTHours}
              holidayHours={holidayHours}
              leaveDays={leaveDays}
              totalEarnings={totalEarnings}
            />
            
            <InvoiceTable entries={entries} />
          </div>

          {!isPaid && (
            <div className="flex justify-end mt-8 gap-4">
              <Button onClick={handleMarkAsPaid} className="bg-green-500 hover:bg-green-600">
                Mark as Paid
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                variant="outline"
                className="bg-[#0EA5E9] text-white hover:bg-[#0284C7] flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}