import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceEntry } from "@/lib/types";
import { isWithinInterval } from "date-fns";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

export function AgentList({ 
  startDate, 
  endDate, 
  onSelectAgent, 
  selectedAgent 
}: AgentListProps) {
  const [agents, setAgents] = useState<string[]>([]);
  const [acceptedInvoices, setAcceptedInvoices] = useState<{ [key: string]: boolean }>({});

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

  // Load and filter agents based on attendance entries
  useEffect(() => {
    if (startDate && endDate) {
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
        const uniqueAgents = Array.from(new Set(filteredEntries.map(entry => entry.agentName)));
        setAgents(uniqueAgents);
      }
    } else {
      setAgents([]);
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
            agents.map((agent) => (
              <button
                key={agent}
                onClick={() => onSelectAgent(agent)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedAgent === agent
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{agent}</div>
                  <Badge variant={acceptedInvoices[agent] ? "success" : "secondary"}>
                    {acceptedInvoices[agent] ? "Accepted" : "Pending"}
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