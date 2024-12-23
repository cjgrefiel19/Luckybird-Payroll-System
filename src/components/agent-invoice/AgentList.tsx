import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DirectoryEntry, AttendanceEntry } from "@/lib/types";
import { isWithinInterval } from "date-fns";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

export function AgentList({ startDate, endDate, onSelectAgent, selectedAgent }: AgentListProps) {
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const [acceptedInvoices, setAcceptedInvoices] = useState<{ [key: string]: boolean }>({});
  const [filteredAgents, setFilteredAgents] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    // Load directory data
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      const directory = JSON.parse(savedDirectory);
      setDirectoryData(directory);
    }

    // Load accepted invoices status
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

  useEffect(() => {
    if (startDate && endDate) {
      // Load attendance entries
      const savedEntries = localStorage.getItem('attendanceEntries');
      if (savedEntries) {
        const entries: AttendanceEntry[] = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));

        // Filter entries within date range
        const filteredEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return isWithinInterval(entryDate, { start: startDate, end: endDate });
        });

        // Get unique agent names from filtered entries
        const agentNames = [...new Set(filteredEntries.map(entry => entry.agentName))];

        // Filter directory data to only show agents with entries in the date range
        const activeAgents = directoryData.filter(agent => 
          agentNames.includes(agent.name)
        );

        setFilteredAgents(activeAgents);
      }
    } else {
      setFilteredAgents([]);
    }
  }, [startDate, endDate, directoryData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => onSelectAgent(agent.name)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedAgent === agent.name
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className={`text-sm ${
                      selectedAgent === agent.name 
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}>
                      {agent.position}
                    </div>
                  </div>
                  <Badge variant={acceptedInvoices[agent.name] ? "success" : "secondary"}>
                    {acceptedInvoices[agent.name] ? "Accepted" : "Pending"}
                  </Badge>
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