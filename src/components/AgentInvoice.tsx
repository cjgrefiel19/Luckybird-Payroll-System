import { useState, useEffect } from "react";
import { DateRangePicker } from "./dashboard/DateRangePicker";
import { AgentList } from "./agent-invoice/AgentList";
import { AgentDetails } from "./agent-invoice/AgentDetails";
import { Card, CardContent } from "./ui/card";
import { PayPeriod } from "@/lib/types";
import { useToast } from "./ui/use-toast";

export function AgentInvoice() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
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
    setSelectedPayPeriod(newPayPeriod.id); // Add this line to select the newly created period
    toast({
      title: "Success",
      description: "Pay period saved successfully",
    });
    console.log('New pay period saved:', newPayPeriod); // Add debug log
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
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Agent Invoice</h2>
      
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <AgentList
            startDate={startDate}
            endDate={endDate}
            onSelectAgent={setSelectedAgent}
            selectedAgent={selectedAgent}
          />
        </div>
        <div className="md:col-span-2">
          {selectedAgent && (
            <AgentDetails
              agentName={selectedAgent}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
