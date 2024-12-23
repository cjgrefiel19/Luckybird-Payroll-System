import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { AgentSummaryCards } from "./AgentSummaryCards";
import { AgentAttendanceTable } from "./AgentAttendanceTable";
import { isWithinInterval } from "date-fns";

interface AgentDetailsProps {
  agentName: string;
  startDate?: Date;
  endDate?: Date;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
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
    // First check if the agent name matches (case-insensitive)
    const matchesAgent = entry.agentName.toLowerCase() === agentName.toLowerCase();
    
    // Then check if the date is within range (if dates are provided)
    let withinDateRange = true;
    if (startDate && endDate) {
      withinDateRange = isWithinInterval(new Date(entry.date), {
        start: startDate,
        end: endDate
      });
    }
    
    return matchesAgent && withinDateRange;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

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