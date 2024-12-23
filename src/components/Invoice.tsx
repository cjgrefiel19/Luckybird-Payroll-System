import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { DirectoryEntry } from "@/lib/types";
import { InvoiceWatermark } from "./agent-invoice/InvoiceWatermark";

export function Invoice() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isPaid, setIsPaid] = useState(false);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load directory data
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

  if (!startDate || !endDate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice data...</div>
      </div>
    );
  }

  // Find directory entry for the current record
  const getDirectoryInfo = (name: string) => {
    return directoryData.find(entry => 
      entry.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <div className="p-4 space-y-4 relative">
      {isPaid && <InvoiceWatermark />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payroll Invoice</h1>
          {directoryData.length > 0 && (
            <div className="mt-2 text-gray-600">
              {getDirectoryInfo(recordId?.split('-')[0] || '')?.position}
            </div>
          )}
        </div>
        <p className="text-lg">
          Pay Period: {format(startDate, "PP")} - {format(endDate, "PP")}
        </p>
      </div>

      <div className="space-y-6">
        <PayrollSummary startDate={startDate} endDate={endDate} />
        <NetPaySummary startDate={startDate} endDate={endDate} />
      </div>

      {!isPaid && (
        <div className="flex justify-end mt-6">
          <Button onClick={handleMarkAsPaid} className="bg-green-500 hover:bg-green-600">
            Mark as Paid
          </Button>
        </div>
      )}
    </div>
  );
}
