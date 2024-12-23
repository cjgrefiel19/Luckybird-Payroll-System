import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";

export function Invoice() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payroll Invoice</h1>
        <p className="text-lg">
          Pay Period: {format(startDate, "PP")} - {format(endDate, "PP")}
        </p>
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