import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { AgentAttendanceTable } from "./AgentAttendanceTable";
import { AgentSummaryCards } from "./AgentSummaryCards";
import { AttendanceEntry } from "@/lib/types";

interface AgentDetailsProps {
  agentName: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries && startDate && endDate) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      const filteredEntries = parsedEntries.filter((entry: AttendanceEntry) => {
        const entryDate = new Date(entry.date);
        return (
          entry.agentName === agentName &&
          entryDate >= startDate &&
          entryDate <= endDate
        );
      });

      setEntries(filteredEntries);
    }
  }, [agentName, startDate, endDate]);

  const handleAccept = () => {
    if (!startDate || !endDate) return;
    
    setAccepted(true);
    const encodedAcceptanceKey = btoa(`${agentName}|${startDate.toISOString()}|${endDate.toISOString()}`);
    localStorage.setItem(`invoice-acceptance-${encodedAcceptanceKey}`, 'true');
    
    toast({
      title: "Invoice Accepted",
      description: "You have successfully accepted this invoice.",
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{agentName}</h3>
          {!accepted && (
            <Button onClick={handleAccept} className="bg-green-500 hover:bg-green-600">
              Accept
            </Button>
          )}
          {accepted && (
            <span className="text-green-500 font-semibold">Accepted</span>
          )}
        </div>

        <AgentSummaryCards filteredEntries={entries} />
        
        <div className="overflow-x-auto">
          <AgentAttendanceTable entries={entries} />
        </div>
      </CardContent>
    </Card>
  );
}