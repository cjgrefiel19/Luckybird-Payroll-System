import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { AgentSummaryCards } from "./AgentSummaryCards";
import { AgentAttendanceTable } from "./AgentAttendanceTable";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Link, Copy } from "lucide-react";

interface AgentDetailsProps {
  agentName: string;
  startDate?: Date;
  endDate?: Date;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    const savedDirectory = localStorage.getItem('directoryData');
    
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error parsing attendance entries:', error);
        toast({
          title: "Error",
          description: "Failed to load attendance records",
          variant: "destructive",
        });
      }
    }
    
    if (savedDirectory) {
      try {
        setDirectoryData(JSON.parse(savedDirectory));
      } catch (error) {
        console.error('Error parsing directory data:', error);
      }
    }
  }, [toast]);

  const filteredEntries = entries.filter((entry) => {
    // Get first name of the selected agent
    const selectedFirstName = agentName.split(' ')[0].toLowerCase();
    // Get first name of the entry
    const entryFirstName = entry.agentName.split(' ')[0].toLowerCase();
    
    const matchesAgent = entryFirstName === selectedFirstName;
    
    let withinDateRange = true;
    if (startDate && endDate) {
      const entryDate = startOfDay(entry.date);
      const periodStart = startOfDay(startDate);
      const periodEnd = endOfDay(endDate);
      
      withinDateRange = isWithinInterval(entryDate, {
        start: periodStart,
        end: periodEnd
      });
    }
    
    return matchesAgent && withinDateRange;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const directoryEntry = directoryData.find(entry => 
    entry.name.toLowerCase() === agentName.toLowerCase()
  );

  const handleGenerateLink = () => {
    // Create a base64 encoded string of agent info
    const agentInfo = `${agentName}|${directoryEntry?.position || ''}`;
    const encodedInfo = btoa(agentInfo);
    
    // Generate absolute URL
    const baseUrl = window.location.origin;
    const shareableUrl = `${baseUrl}/shared/agent/${encodedInfo}`;
    
    setGeneratedLink(shareableUrl);
    
    toast({
      title: "Link Generated",
      description: "Shareable link has been generated successfully",
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

  if (!startDate || !endDate) {
    return (
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{directoryEntry?.name || agentName}</h2>
          {directoryEntry && (
            <p className="text-muted-foreground">{directoryEntry.position}</p>
          )}
        </div>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please select a date range to view attendance records.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (filteredEntries.length === 0) {
    return (
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{directoryEntry?.name || agentName}</h2>
          {directoryEntry && (
            <p className="text-muted-foreground">{directoryEntry.position}</p>
          )}
        </div>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No attendance records found for this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">{directoryEntry?.name || agentName}</h2>
        {directoryEntry && (
          <p className="text-muted-foreground">{directoryEntry.position}</p>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-end space-x-4">
            <Button onClick={handleGenerateLink} className="gap-2">
              <Link className="h-4 w-4" />
              Generate Shareable Link
            </Button>
            {generatedLink && (
              <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            )}
          </div>

          <AgentSummaryCards filteredEntries={filteredEntries} />
          <AgentAttendanceTable entries={filteredEntries} />
        </div>
      </CardContent>
    </Card>
  );
}