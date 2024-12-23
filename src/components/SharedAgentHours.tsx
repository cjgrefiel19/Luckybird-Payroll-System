import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "./ui/use-toast";
import html2pdf from 'html2pdf.js';
import { InvoiceWatermark } from "./agent-invoice/InvoiceWatermark";
import { InvoiceHeader } from "./agent-invoice/InvoiceHeader";
import { InvoiceAgentDetails } from "./agent-invoice/InvoiceAgentDetails";
import { InvoiceSummary } from "./agent-invoice/InvoiceSummary";
import { InvoiceActions } from "./agent-invoice/InvoiceActions";

export function SharedAgentHours() {
  const { agentId } = useParams();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [agentName, setAgentName] = useState("");
  const [position, setPosition] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [payPeriod, setPayPeriod] = useState<{ start: Date; end: Date } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!agentId) return;

    // Check if invoice was previously accepted
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      // Filter entries for this agent
      const agentEntries = parsedEntries.filter((entry: AttendanceEntry) => {
        const entryFirstName = entry.agentName.split(' ')[0].toLowerCase();
        const agentFirstName = atob(agentId).split('|')[0].split(' ')[0].toLowerCase();
        return entryFirstName === agentFirstName;
      });

      // Calculate total hours
      const total = agentEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
      setTotalHours(total);

      // Find pay period range
      if (agentEntries.length > 0) {
        const dates = agentEntries.map(entry => entry.date);
        const startDate = new Date(Math.min(...dates.map(date => date.getTime())));
        const endDate = new Date(Math.max(...dates.map(date => date.getTime())));
        setPayPeriod({ start: startDate, end: endDate });
      }

      setEntries(agentEntries);
    }

    // Decode agent info from ID
    const decodedInfo = atob(agentId).split('|');
    setAgentName(decodedInfo[0]);
    setPosition(decodedInfo[1]);

    // Check acceptance status with date range
    if (payPeriod) {
      const encodedAcceptanceKey = btoa(`${decodedInfo[0]}|${decodedInfo[1]}|${format(payPeriod.start, 'yyyy-MM-dd')}|${format(payPeriod.end, 'yyyy-MM-dd')}`);
      const savedAcceptance = localStorage.getItem(`invoice-acceptance-${encodedAcceptanceKey}`);
      if (savedAcceptance) {
        setAccepted(true);
      }
    }
  }, [agentId, payPeriod]);

  const handleAccept = () => {
    if (!payPeriod) return;
    
    setAccepted(true);
    if (agentId) {
      const encodedAcceptanceKey = btoa(`${agentName}|${position}|${format(payPeriod.start, 'yyyy-MM-dd')}|${format(payPeriod.end, 'yyyy-MM-dd')}`);
      localStorage.setItem(`invoice-acceptance-${encodedAcceptanceKey}`, 'true');
    }
    toast({
      title: "Invoice Accepted",
      description: "You have successfully accepted this invoice.",
    });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    const opt = {
      margin: 0.5,
      filename: `${agentName}-invoice.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      toast({
        title: "PDF Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });
    });
  };

  if (!agentId) {
    return <div>Invalid link</div>;
  }

  return (
    <div className="container mx-auto py-8 relative">
      <InvoiceWatermark show={accepted} />
      
      <Card>
        <CardContent className="p-6">
          <div id="invoice-content" className="space-y-8">
            <InvoiceHeader logo="/lovable-uploads/35d5de7b-23b9-4504-a609-8dc8d8d07555.png" />
            <InvoiceAgentDetails 
              agentName={agentName}
              position={position}
              payPeriod={payPeriod}
            />
            <InvoiceSummary totalHours={totalHours} />
            <div className="overflow-x-auto">
              <AgentAttendanceTable entries={entries} />
            </div>
          </div>

          <InvoiceActions 
            onAccept={handleAccept}
            onDownload={handleDownloadPDF}
            accepted={accepted}
          />
        </CardContent>
      </Card>
    </div>
  );
}
