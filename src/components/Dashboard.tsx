import { useState, useEffect } from "react";
import { DateRangePicker } from "./dashboard/DateRangePicker";
import { PayrollSummary } from "./dashboard/PayrollSummary";
import { NetPaySummary } from "./dashboard/NetPaySummary";
import { PayPeriod } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link, Copy } from "lucide-react";
import { Input } from "./ui/input";

export function Dashboard() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pay periods and selected dates from localStorage
  useEffect(() => {
    const savedPayPeriods = localStorage.getItem('payPeriods');
    const savedSelectedPeriod = localStorage.getItem('selectedPayPeriod');
    const savedStartDate = localStorage.getItem('startDate');
    const savedEndDate = localStorage.getItem('endDate');

    if (savedPayPeriods) {
      const parsed = JSON.parse(savedPayPeriods).map((period: any) => ({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      }));
      setPayPeriods(parsed);
    }

    if (savedSelectedPeriod) {
      setSelectedPayPeriod(savedSelectedPeriod);
    }

    if (savedStartDate) {
      setStartDate(new Date(savedStartDate));
    }

    if (savedEndDate) {
      setEndDate(new Date(savedEndDate));
    }
  }, []);

  // Save pay periods to localStorage
  useEffect(() => {
    localStorage.setItem('payPeriods', JSON.stringify(payPeriods));
  }, [payPeriods]);

  // Save selected pay period and dates to localStorage
  useEffect(() => {
    if (selectedPayPeriod) {
      localStorage.setItem('selectedPayPeriod', selectedPayPeriod);
    } else {
      localStorage.removeItem('selectedPayPeriod');
    }
  }, [selectedPayPeriod]);

  useEffect(() => {
    if (startDate) {
      localStorage.setItem('startDate', startDate.toISOString());
    } else {
      localStorage.removeItem('startDate');
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      localStorage.setItem('endDate', endDate.toISOString());
    } else {
      localStorage.removeItem('endDate');
    }
  }, [endDate]);

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
      localStorage.removeItem('selectedPayPeriod');
      localStorage.removeItem('startDate');
      localStorage.removeItem('endDate');
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
        variant: "destructive",
      });
      return;
    }

    const recordId = crypto.randomUUID();
    const invoiceUrl = `/invoice/${recordId}`;

    // Save record to localStorage
    const savedRecords = localStorage.getItem('payrollRecords') || '[]';
    const records = JSON.parse(savedRecords);
    records.push({
      id: recordId,
      payPeriod: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      generatedLink: invoiceUrl,
      status: 'Pending',
      comments: '',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('payrollRecords', JSON.stringify(records));

    // Generate absolute URL
    const baseUrl = window.location.origin;
    const fullUrl = baseUrl + invoiceUrl;
    setGeneratedLink(fullUrl);

    toast({
      title: "Success",
      description: "Shareable link generated and saved to Payroll Records",
    });
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    }
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

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleGenerateLink} className="gap-2">
            <Link className="h-4 w-4" />
            Generate Shareable Link
          </Button>
        </div>

        {generatedLink && (
          <div className="flex gap-2 items-center">
            <Input
              value={generatedLink}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <PayrollSummary startDate={startDate} endDate={endDate} />
      <NetPaySummary startDate={startDate} endDate={endDate} />
    </div>
  );
};
