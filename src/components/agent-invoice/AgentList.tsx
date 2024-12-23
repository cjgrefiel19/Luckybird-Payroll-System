import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceEntry } from "@/lib/types";
import { TEAM_MEMBERS } from "@/lib/constants";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

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

  const uniqueAgents = [...new Set(filteredEntries.map(entry => entry.agentName))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {uniqueAgents.map((agentName) => {
            const member = TEAM_MEMBERS.find(m => m.name === agentName);
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
                {member && (
                  <div className="text-sm text-muted-foreground">
                    {member.position || "Position not specified"}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}