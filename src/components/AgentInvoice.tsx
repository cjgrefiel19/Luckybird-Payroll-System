import { useState, useEffect } from "react";
import { DateRangePicker } from "./dashboard/DateRangePicker";
import { AgentList } from "./agent-invoice/AgentList";
import { AgentDetails } from "./agent-invoice/AgentDetails";
import { Card, CardContent } from "./ui/card";
import { PayPeriod } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function AgentInvoice() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pay periods from Supabase
  useEffect(() => {
    const fetchPayPeriods = async () => {
      try {
        const { data, error } = await supabase
          .from('payroll_records')
          .select('*');

        if (error) throw error;

        const transformedPeriods = data.map(record => ({
          id: record.id,
          name: `Pay Period ${new Date(record.start_date).toLocaleDateString()} - ${new Date(record.end_date).toLocaleDateString()}`,
          startDate: new Date(record.start_date),
          endDate: new Date(record.end_date),
        }));

        setPayPeriods(transformedPeriods);
      } catch (error) {
        console.error('Error fetching pay periods:', error);
        toast({
          title: "Error",
          description: "Failed to load pay periods",
          variant: "destructive",
        });
      }
    };

    fetchPayPeriods();
  }, []);

  const handleSavePayPeriod = async (name: string) => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payroll_records')
        .insert({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          pay_date: new Date().toISOString().split('T')[0],
          total_amount: 0,
          notes: name,
        })
        .select()
        .single();

      if (error) throw error;

      const newPayPeriod: PayPeriod = {
        id: data.id,
        name,
        startDate,
        endDate,
      };

      setPayPeriods(prev => [...prev, newPayPeriod]);
      setSelectedPayPeriod(newPayPeriod.id);
      
      toast({
        title: "Success",
        description: "Pay period saved successfully",
      });
    } catch (error) {
      console.error('Error saving pay period:', error);
      toast({
        title: "Error",
        description: "Failed to save pay period",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayPeriod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayPeriods(prev => prev.filter(period => period.id !== id));
      if (selectedPayPeriod === id) {
        setSelectedPayPeriod(null);
        setStartDate(undefined);
        setEndDate(undefined);
      }

      toast({
        title: "Success",
        description: "Pay period deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting pay period:', error);
      toast({
        title: "Error",
        description: "Failed to delete pay period",
        variant: "destructive",
      });
    }
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