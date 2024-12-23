import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { AgentSummaryCards } from "./agent-invoice/AgentSummaryCards";

export function SharedAgentHours() {
  const { agentId } = useParams();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [agentName, setAgentName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [accepted, setAccepted] = useState(false);
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

  if (!agentId || !startDate || !endDate) {
    return <div>Invalid link</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{agentName}</h2>
              <p className="text-sm text-muted-foreground">
                Pay Period: {format(startDate, "PPP")} - {format(endDate, "PPP")}
              </p>
            </div>
            {!accepted && (
              <Button onClick={handleAccept} className="bg-green-500 hover:bg-green-600">
                Accept Invoice
              </Button>
            )}
            {accepted && (
              <span className="text-green-500 font-semibold">Invoice Accepted</span>
            )}
          </div>

          <AgentSummaryCards filteredEntries={entries} />
          
          <div className="overflow-x-auto">
            <AgentAttendanceTable entries={entries} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}