import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";

export function SharedAgentHours() {
  const { agentId } = useParams();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [agentName, setAgentName] = useState("");
  const [position, setPosition] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [payPeriod, setPayPeriod] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (!agentId) return;

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
  }, [agentId]);

  if (!agentId) {
    return <div>Invalid link</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{agentName}</h2>
            <p className="text-muted-foreground">{position}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}