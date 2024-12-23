import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { TEAM_MEMBERS } from "@/lib/constants";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

export function AgentList({ startDate, endDate, onSelectAgent, selectedAgent }: AgentListProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    const savedDirectory = localStorage.getItem('directoryData');
    
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
    }
    
    if (savedDirectory) {
      setDirectoryData(JSON.parse(savedDirectory));
    }
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const uniqueAgents = [...new Set(filteredEntries.map(entry => entry.agentName))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {uniqueAgents.map((agentName) => {
            const directoryEntry = directoryData.find(entry => entry.name === agentName);
            const position = directoryEntry?.position || "Position not specified";
            
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
                <div className="font-medium">{agentName}</div>
                <div className="text-sm text-muted-foreground">
                  {position}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}