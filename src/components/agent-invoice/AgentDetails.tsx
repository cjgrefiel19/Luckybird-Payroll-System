import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { AgentAttendanceTable } from "./AgentAttendanceTable";
import { AgentSummaryCards } from "./AgentSummaryCards";
import { AttendanceEntry } from "@/lib/types";
import { Input } from "../ui/input";
import { Link, Copy } from "lucide-react";
import { isWithinInterval } from "date-fns";

interface AgentDetailsProps {
  agentName: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
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
          isWithinInterval(entryDate, { start: startDate, end: endDate })
        );
      });

      setEntries(filteredEntries);
    }
  }, [agentName, startDate, endDate]);

  const handleGenerateLink = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
        variant: "destructive",
      });
      return;
    }

    const encodedAgentInfo = btoa(`${agentName}|${startDate.toISOString()}|${endDate.toISOString()}`);
    const sharedUrl = `/shared/agent/${encodedAgentInfo}`;
    const baseUrl = window.location.origin;
    const fullUrl = baseUrl + sharedUrl;
    setGeneratedLink(fullUrl);

    toast({
      title: "Success",
      description: "Shareable link generated successfully",
    });
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    }
  };

  const handleViewInvoice = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{agentName}</h3>
          <div className="flex items-center gap-4">
            <Button onClick={handleGenerateLink} className="gap-2">
              <Link className="h-4 w-4" />
              Generate Shareable Link
            </Button>
          </div>
        </div>

        {generatedLink && (
          <div className="flex gap-2 items-center">
            <Input
              value={generatedLink}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              onClick={handleViewInvoice}
            >
              View Invoice
            </Button>
          </div>
        )}

        <AgentSummaryCards filteredEntries={entries} />
        
        <div className="overflow-x-auto">
          <AgentAttendanceTable entries={entries} />
        </div>
      </CardContent>
    </Card>
  );
}