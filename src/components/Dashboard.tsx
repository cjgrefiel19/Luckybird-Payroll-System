import { useState, useEffect } from "react";
import { DateRangePicker } from "./dashboard/DateRangePicker";
import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { PayPeriod } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "lucide-react";

export function Dashboard() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pay periods from localStorage
  useEffect(() => {
    const savedPayPeriods = localStorage.getItem('payPeriods');
    if (savedPayPeriods) {
      const parsed = JSON.parse(savedPayPeriods).map((period: any) => ({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      }));
      setPayPeriods(parsed);
    }
  }, []);

  // Save pay periods to localStorage
  useEffect(() => {
    localStorage.setItem('payPeriods', JSON.stringify(payPeriods));
  }, [payPeriods]);

  const handleSavePayPeriod = (name: string) => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
      });
      return;
    }

    const newPayPeriod: PayPeriod = {
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
    };

    setPayPeriods((prev) => [...prev, newPayPeriod]);
    toast({
      title: "Success",
      description: "Pay period saved successfully",
    });
  };

  const handleDeletePayPeriod = (id: string) => {
    setPayPeriods((prev) => prev.filter((period) => period.id !== id));
    if (selectedPayPeriod === id) {
      setSelectedPayPeriod(null);
      setStartDate(undefined);
      setEndDate(undefined);
    }
    toast({
      title: "Success",
      description: "Pay period deleted successfully",
    });
  };

  const handleGenerateLink = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
      });
      return;
    }

    const recordId = crypto.randomUUID();
    const baseUrl = window.location.origin;
    const invoiceUrl = `${baseUrl}/invoice/${recordId}`;

    // Save record to localStorage
    const savedRecords = localStorage.getItem('payrollRecords') || '[]';
    const records = JSON.parse(savedRecords);
    records.push({
      id: recordId,
      payPeriod: {
        startDate,
        endDate,
      },
      generatedLink: invoiceUrl,
      status: 'Pending',
      comments: '',
      createdAt: new Date(),
    });
    localStorage.setItem('payrollRecords', JSON.stringify(records));

    toast({
      title: "Success",
      description: "Shareable link generated and saved to Payroll Records",
    });

    // Open invoice in new tab
    window.open(invoiceUrl, '_blank');
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      <Card>
        <CardContent className="pt-6">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            payPeriods={payPeriods}
            selectedPayPeriod={selectedPayPeriod}
            onPayPeriodSelect={setSelectedPayPeriod}
            onSavePayPeriod={handleSavePayPeriod}
            onDeletePayPeriod={handleDeletePayPeriod}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleGenerateLink} className="gap-2">
          <Link className="h-4 w-4" />
          Generate Shareable Link
        </Button>
      </div>

      <PayrollSummary startDate={startDate} endDate={endDate} />
      <NetPaySummary startDate={startDate} endDate={endDate} />
    </div>
  );
}
