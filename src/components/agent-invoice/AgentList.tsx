import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

const agentDirectory = [
  { name: "Chrisjie Grefiel", position: "Director, Account Operations" },
  { name: "Gilbert Condino", position: "Team Leader, Sourcing" },
  { name: "Mhel Malit", position: "Sr. Operation Specialist" },
  { name: "Cherrie Ferrer", position: "Team Leader, Operations" },
  { name: "Jobelle Fortuna", position: "Finance Specialist" }
];

export function AgentList({ startDate, endDate, onSelectAgent, selectedAgent }: AgentListProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
    }
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const uniqueAgents = [...new Set(filteredEntries.map(entry => {
    const directoryEntry = agentDirectory.find(dir => 
      entry.agentName.toLowerCase().includes(dir.name.split(' ')[0].toLowerCase())
    );
    return directoryEntry ? directoryEntry.name : entry.agentName;
  }))];

  const getInvoiceStatus = (agentName: string) => {
    const firstName = agentName.split(' ')[0].toLowerCase();
    const encodedInfo = btoa(`${agentName}|${agentDirectory.find(dir => dir.name === agentName)?.position || ''}`);
    const isAccepted = localStorage.getItem(`invoice-acceptance-${encodedInfo}`);
    return isAccepted ? "accepted" : "pending";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {uniqueAgents.map((agentName) => {
            const directoryEntry = agentDirectory.find(dir => 
              dir.name.toLowerCase() === agentName.toLowerCase()
            );
            const status = getInvoiceStatus(agentName);
            
            return (
              <button
                key={agentName}
                onClick={() => onSelectAgent(agentName)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedAgent === agentName
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {directoryEntry?.name || agentName}
                    </div>
                    {directoryEntry && (
                      <div className={`text-sm ${
                        selectedAgent === agentName 
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}>
                        {directoryEntry.position}
                      </div>
                    )}
                  </div>
                  <Badge variant={status === "accepted" ? "success" : "secondary"}>
                    {status === "accepted" ? "Accepted" : "Pending"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}