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
import { Badge } from "./ui/badge";

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
      margin: 1,
      filename: `${agentName}-invoice.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
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
          <div className="transform rotate-[-35deg] text-red-500/20 text-[20vw] font-black whitespace-nowrap select-none">
            PAID
          </div>
        </div>
      )}
      
      <Card>
        <CardContent className="p-6">
          <div id="invoice-content">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{agentName}</h2>
                <p className="text-muted-foreground">{position}</p>
              </div>
              <Badge variant={accepted ? "success" : "secondary"}>
                {accepted ? "Accepted" : "Pending"}
              </Badge>
            </div>

            <div className="space-y-6">
              {payPeriod && (
                <div className="text-sm text-muted-foreground">
                  Pay Period: {format(payPeriod.start, "PPP")} - {format(payPeriod.end, "PPP")}
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p>Total Working Hours: {totalHours.toFixed(2)}</p>
              </div>

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