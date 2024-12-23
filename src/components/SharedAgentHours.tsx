import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { Check, FileText } from "lucide-react";
import { useToast } from "./ui/use-toast";
import html2pdf from 'html2pdf.js';

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
    // Save acceptance status with date range
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
      {accepted && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
          <div className="transform rotate-[-35deg] text-red-500/20 text-[40vw] font-black whitespace-nowrap select-none">
            PAID
          </div>
        </div>
      )}
      
      <Card>
        <CardContent className="p-6">
          <div id="invoice-content" className="space-y-8">
            {/* Header with Logo and Company Details */}
            <div className="flex items-start justify-between border-b pb-6">
              <div className="flex flex-col items-start">
                <img 
                  src="/lovable-uploads/35d5de7b-23b9-4504-a609-8dc8d8d07555.png" 
                  alt="LuckyBird Logo" 
                  className="h-24 w-24 object-contain mb-4"
                />
                <h1 className="text-2xl font-bold">LuckyBird</h1>
                <div className="text-muted-foreground mt-2">
                  <p>732 N. Madelia St.</p>
                  <p>Spokane, WA 99202</p>
                  <p>+1 (509) 508-2229</p>
                </div>
              </div>
            </div>

            {/* Agent Details and Pay Period */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{agentName}</h2>
              <p className="text-lg text-muted-foreground">{position}</p>
              {payPeriod && (
                <p className="text-sm text-muted-foreground">
                  Pay Period: {format(payPeriod.start, "PPP")} - {format(payPeriod.end, "PPP")}
                </p>
              )}
            </div>

            {/* Summary Box */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p>Total Working Hours: {totalHours.toFixed(2)}</p>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <AgentAttendanceTable entries={entries} />
            </div>
          </div>

          <div className="mt-6 flex gap-4 justify-end">
            <Button
              onClick={handleAccept}
              disabled={accepted}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {accepted ? "Accepted" : "Accept"}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}