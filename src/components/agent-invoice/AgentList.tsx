import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { isWithinInterval } from "date-fns";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

interface AgentInfo {
  fullName: string;
  position: string;
  firstName: string;
  hasEntries: boolean;
}

export function AgentList({ 
  startDate, 
  endDate, 
  onSelectAgent, 
  selectedAgent 
}: AgentListProps) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [acceptedInvoices, setAcceptedInvoices] = useState<{ [key: string]: boolean }>({});

  // Load directory data
  useEffect(() => {
    const loadAgentInfo = () => {
      const savedDirectory = localStorage.getItem('directoryData');
      if (!savedDirectory) return;

      const directoryData: DirectoryEntry[] = JSON.parse(savedDirectory);
      const agentInfo: AgentInfo[] = directoryData.map(entry => ({
        fullName: entry.name,
        position: entry.position,
        firstName: entry.name.split(' ')[0],
        hasEntries: false
      }));

      setAgents(agentInfo);
    };

    loadAgentInfo();
  }, []);

  // Load accepted invoices status
  useEffect(() => {
    const loadAcceptedStatus = () => {
      const allKeys = Object.keys(localStorage);
      const acceptanceKeys = allKeys.filter(key => key.startsWith('invoice-acceptance-'));
      const acceptedStatus: { [key: string]: boolean } = {};

      acceptanceKeys.forEach(key => {
        const encodedInfo = key.replace('invoice-acceptance-', '');
        try {
          const decodedInfo = atob(encodedInfo);
          const [agentName] = decodedInfo.split('|');
          acceptedStatus[agentName] = true;
        } catch (e) {
          console.error('Error decoding acceptance key:', e);
        }
      });

      setAcceptedInvoices(acceptedStatus);
    };

    loadAcceptedStatus();
  }, []);

  // Update agents with attendance data
  useEffect(() => {
    if (startDate && endDate) {
      const savedEntries = localStorage.getItem('attendanceEntries');
      if (!savedEntries) return;

      const entries: AttendanceEntry[] = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      // Filter entries within date range
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });

      // Create a set of first names from filtered entries
      const activeFirstNames = new Set(
        filteredEntries.map(entry => entry.agentName.split(' ')[0])
      );

      // Update agents with hasEntries flag
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          hasEntries: activeFirstNames.has(agent.firstName)
        }))
      );
    } else {
      setAgents(prev => prev.map(agent => ({ ...agent, hasEntries: false })));
    }
  }, [startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {agents.length > 0 ? (
            agents
              .filter(agent => agent.hasEntries)
              .map((agent) => (
                <button
                  key={agent.fullName}
                  onClick={() => onSelectAgent(agent.fullName)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedAgent === agent.fullName
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{agent.fullName}</div>
                      <Badge variant={acceptedInvoices[agent.fullName] ? "success" : "secondary"}>
                        {acceptedInvoices[agent.fullName] ? "Accepted" : "Pending"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {agent.position}
                    </div>
                  </div>
                </button>
              ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {startDate && endDate 
                ? "No agents found for the selected date range" 
                : "Please select a date range"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}