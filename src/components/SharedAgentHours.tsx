import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "./ui/use-toast";
import { AgentSummaryCards } from "./agent-invoice/AgentSummaryCards";
import { InvoiceHeader } from "./agent-invoice/InvoiceHeader";
import { InvoiceActions } from "./agent-invoice/InvoiceActions";
import { formatCurrency } from "@/lib/calculations";
import html2pdf from 'html2pdf.js';

export function SharedAgentHours() {
  const { agentId } = useParams();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [agentName, setAgentName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [accepted, setAccepted] = useState(false);
  const [deductions, setDeductions] = useState(0);
  const [reimbursements, setReimbursements] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!agentId) return;

    // Decode agent info from ID
    const [name, start, end] = atob(agentId).split('|');
    setAgentName(name);
    setStartDate(new Date(start));
    setEndDate(new Date(end));

    // Load entries for this agent
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      // Filter entries for this agent and date range
      const filteredEntries = parsedEntries.filter((entry: AttendanceEntry) => {
        const entryDate = new Date(entry.date);
        return (
          entry.agentName === name &&
          entryDate >= new Date(start) &&
          entryDate <= new Date(end)
        );
      });

      setEntries(filteredEntries);
    }

    // Load net pay data
    const savedNetPayData = localStorage.getItem('netPayData');
    if (savedNetPayData) {
      const netPayData = JSON.parse(savedNetPayData);
      const agentData = netPayData.find((data: any) => data.agentName === name);
      if (agentData) {
        setDeductions(agentData.deductions || 0);
        setReimbursements(agentData.reimbursements || 0);
      }
    }

    // Check if already accepted
    const acceptanceKey = `invoice-acceptance-${agentId}`;
    const savedAcceptance = localStorage.getItem(acceptanceKey);
    if (savedAcceptance) {
      setAccepted(true);
    }
  }, [agentId]);

  const handleAccept = () => {
    if (!agentId) return;
    
    setAccepted(true);
    localStorage.setItem(`invoice-acceptance-${agentId}`, 'true');
    
    toast({
      title: "Invoice Accepted",
      description: "You have successfully accepted this invoice.",
    });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `invoice-${agentName}-${format(startDate!, "yyyy-MM-dd")}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    
    toast({
      title: "Success",
      description: "Invoice downloaded successfully",
    });
  };

  const getWorkDaysBreakdown = () => {
    const breakdown = entries.reduce((acc, entry) => {
      const type = entry.shiftType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([type, count]) => ({
      type,
      count
    }));
  };

  const calculateFinalPay = () => {
    const totalEarnings = entries.reduce((sum, entry) => {
      let multiplier = 1;
      if (entry.shiftType === 'Regular OT') multiplier = 1.25;
      else if (entry.shiftType === 'Rest Day OT') multiplier = 1.30;
      else if (entry.shiftType === 'Special Holidays') multiplier = 1.30;
      else if (entry.shiftType === 'Regular Holidays') multiplier = 2.00;
      
      return sum + (entry.totalHours * entry.hourlyRate * multiplier);
    }, 0);

    return totalEarnings - deductions + reimbursements;
  };

  if (!agentId || !startDate || !endDate) {
    return <div>Invalid link</div>;
  }

  const workDaysBreakdown = getWorkDaysBreakdown();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6 space-y-6" id="invoice-content">
          <InvoiceHeader logo="/lovable-uploads/721bca4a-5642-4aa3-b371-870b16bf31fb.png" />
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{agentName}</h2>
              <p className="text-sm text-muted-foreground">
                Pay Period: {format(startDate, "PPP")} - {format(endDate, "PPP")}
              </p>
            </div>
            {accepted && (
              <span className="text-green-500 font-semibold">Invoice Accepted</span>
            )}
          </div>

          <AgentSummaryCards filteredEntries={entries} />
          
          <div className="overflow-x-auto">
            <AgentAttendanceTable entries={entries} />
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Work Days Breakdown</h3>
              <div className="space-y-2">
                {workDaysBreakdown.map(({ type, count }) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{type}:</span>
                    <span className="font-medium">{count} day{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Deductions</h3>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(deductions)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Reimbursements</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(reimbursements)}
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Final Pay</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(calculateFinalPay())}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <InvoiceActions
        onAccept={handleAccept}
        onDownload={handleDownloadPDF}
        accepted={accepted}
      />
    </div>
  );
}