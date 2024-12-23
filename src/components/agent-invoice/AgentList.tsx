import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DirectoryEntry } from "@/lib/types";

interface AgentListProps {
  startDate?: Date;
  endDate?: Date;
  onSelectAgent: (agentName: string) => void;
  selectedAgent: string | null;
}

export function AgentList({ startDate, endDate, onSelectAgent, selectedAgent }: AgentListProps) {
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const [acceptedInvoices, setAcceptedInvoices] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Load directory data
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      setDirectoryData(JSON.parse(savedDirectory));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {directoryData.map((agent) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}