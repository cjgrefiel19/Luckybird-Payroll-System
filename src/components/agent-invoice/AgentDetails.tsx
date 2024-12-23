import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { AgentSummaryCards } from "./AgentSummaryCards";
import { AgentAttendanceTable } from "./AgentAttendanceTable";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface AgentDetailsProps {
  agentName: string;
  startDate?: Date;
  endDate?: Date;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
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
          <AgentSummaryCards filteredEntries={filteredEntries} />
          <AgentAttendanceTable entries={filteredEntries} />
        </div>
      </CardContent>
    </Card>
  );
}