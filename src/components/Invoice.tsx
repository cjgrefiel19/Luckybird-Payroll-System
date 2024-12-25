import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { DirectoryEntry, AttendanceEntry } from "@/lib/types";
import { InvoiceWatermark } from "./agent-invoice/InvoiceWatermark";
import html2pdf from "html2pdf.js";
import { FileDown } from "lucide-react";
import {
  calculateTotalHours,
  calculateOTHours,
  calculateHolidayHours,
  calculateLeaveDays,
  calculateTotalEarnings,
  calculateDailyEarnings
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

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <div 
        className="absolute top-0 w-screen" 
        style={{ 
          backgroundColor: 'rgba(135, 206, 235, 0.4)',
          left: '50%',
          right: '50%',
          transform: 'translateX(-50%)',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          paddingBottom: '2rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-primary">
            Agent Invoice View - {recordId?.split('-')[0]}
          </h1>
          
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
                {format(startDate!, "PP")} - {format(endDate!, "PP")}
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

      <div className="max-w-7xl mx-auto px-4" style={{ paddingTop: "calc(2rem + 200px)" }}>
        {isPaid && <InvoiceWatermark show={true} />}
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-[#8E9196] p-4 rounded-lg">
                <div className="text-2xl font-bold text-black text-center">
                  {totalHours?.toFixed(2)}
                </div>
                <p className="text-sm text-black text-center">Total Hours</p>
              </div>
              <div className="bg-[#8A898C] p-4 rounded-lg">
                <div className="text-2xl font-bold text-black text-center">
                  {totalOTHours?.toFixed(2)}
                </div>
                <p className="text-sm text-black text-center">Total OT Hours</p>
              </div>
              <div className="bg-[#999999] p-4 rounded-lg">
                <div className="text-2xl font-bold text-black text-center">
                  {holidayHours?.toFixed(2)}
                </div>
                <p className="text-sm text-black text-center">Holiday Hours</p>
              </div>
              <div className="bg-[#8E9196] p-4 rounded-lg">
                <div className="text-2xl font-bold text-black text-center">
                  {leaveDays}
                </div>
                <p className="text-sm text-black text-center">Leave Days</p>
              </div>
              <div className="bg-[#8A898C] p-4 rounded-lg">
                <div className="text-2xl font-bold text-black text-center">
                  ${totalEarnings?.toFixed(2)}
                </div>
                <p className="text-sm text-black text-center">Total Earnings</p>
              </div>
            </div>

            <div className="mt-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f2f2f2]">
                    <th className="p-3 text-left border-b">Date</th>
                    <th className="p-3 text-left border-b">Time In</th>
                    <th className="p-3 text-left border-b">Time Out</th>
                    <th className="p-3 text-left border-b">Total Hours</th>
                    <th className="p-3 text-left border-b">Shift Type</th>
                    <th className="p-3 text-right border-b">Hourly Rate</th>
                    <th className="p-3 text-right border-b">Daily Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {entries?.map((entry, index) => (
                    <tr 
                      key={index}
                      className="bg-[rgba(211,211,211,0.1)] border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{format(new Date(entry.date), "PP")}</td>
                      <td className="p-3">{entry.timeIn}</td>
                      <td className="p-3">{entry.timeOut}</td>
                      <td className="p-3">{entry.totalHours.toFixed(2)}</td>
                      <td className="p-3">{entry.shiftType}</td>
                      <td className="p-3 text-right">${entry.hourlyRate.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        ${calculateDailyEarnings(
                          entry.hourlyRate,
                          entry.totalHours,
                          entry.shiftType
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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