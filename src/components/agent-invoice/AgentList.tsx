import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
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
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [acceptedInvoices, setAcceptedInvoices] = useState<{ [key: string]: boolean }>({});

  // Load attendance entries
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

  // Get unique agents with entries in the date range
  const getAgentsInDateRange = () => {
    if (!startDate || !endDate || !entries.length) return [];

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });

    const uniqueAgents = Array.from(new Set(filteredEntries.map(entry => entry.agentName)));
    return uniqueAgents;
  };

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

  const agents = getAgentsInDateRange();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {agents.length > 0 ? (
            agents.map((agentName) => (
              <button
                key={agentName}
                onClick={() => onSelectAgent(agentName)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedAgent === agentName
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{agentName}</div>
                    <Badge variant={acceptedInvoices[agentName] ? "success" : "secondary"}>
                      {acceptedInvoices[agentName] ? "Accepted" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {startDate && endDate ? "No agents found in selected date range" : "Select a date range"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}