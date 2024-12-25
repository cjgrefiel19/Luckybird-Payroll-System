import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollRecord } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { PayrollTable } from "./payroll-records/PayrollTable";
import { exportToPDF } from "./payroll-records/InvoiceExporter";

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
    try {
      await exportToPDF(record);
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

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <PayrollTable
            records={records}
            onDelete={handleDelete}
            onCommentChange={handleCommentChange}
            onExport={handleExport}
          />
        </CardContent>
      </Card>
    </div>
  );
}