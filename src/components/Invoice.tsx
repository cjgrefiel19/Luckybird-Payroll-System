import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";

interface InvoiceProps {
  startDate?: Date;
  endDate?: Date;
  recordId: string;
}

export function Invoice({ startDate, endDate, recordId }: InvoiceProps) {
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedRecords = localStorage.getItem('payrollRecords');
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const record = records.find((r: any) => r.id === recordId);
      if (record) {
        setIsPaid(record.status === 'Paid');
      }
    }
  }, [recordId]);

  const handleMarkAsPaid = () => {
    setIsPaid(true);
    
    // Update record status in localStorage
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

  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payroll Invoice</h1>
        {startDate && endDate && (
          <p className="text-lg">
            Pay Period: {format(startDate, "PP")} - {format(endDate, "PP")}
          </p>
        )}
      </div>

      {isPaid && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="transform rotate-[-35deg] border-8 border-red-500 rounded p-4">
            <span className="text-6xl font-bold text-red-500">PAID</span>
          </div>
        </div>
      )}

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