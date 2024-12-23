import { useState, useEffect } from "react";
import { DateRangePicker } from "./dashboard/DateRangePicker";
import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { PayPeriod } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { Card, CardContent } from "./ui/card";

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

      <PayrollSummary startDate={startDate} endDate={endDate} />
      <NetPaySummary startDate={startDate} endDate={endDate} />
    </div>
  );
}