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
          agentName: entry.agentName.trim() // Normalize agent names by trimming whitespace
        }));
        setEntries(parsedEntries);
        console.log('Total entries loaded:', parsedEntries.length);
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
    // Normalize agent names for comparison
    const normalizedEntryName = entry.agentName.toLowerCase().trim();
    const normalizedSelectedName = agentName.toLowerCase().trim();
    const matchesAgent = normalizedEntryName === normalizedSelectedName;
    
    // Then check if the date is within range (if dates are provided)
    let withinDateRange = true;
    if (startDate && endDate) {
      const entryDate = startOfDay(new Date(entry.date));
      const periodStart = startOfDay(startDate);
      const periodEnd = endOfDay(endDate);
      
      withinDateRange = isWithinInterval(entryDate, {
        start: periodStart,
        end: periodEnd
      });
    }
    
    // Log filtering details for debugging
    if (matchesAgent) {
      console.log(`Entry for ${entry.agentName} on ${entry.date}:`, 
        withinDateRange ? 'within date range' : 'outside date range',
        'Entry date:', entry.date,
        'Start date:', startDate,
        'End date:', endDate
      );
    }
    
    return matchesAgent && withinDateRange;
  }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending

  // Log filtered results
  console.log(`Found ${filteredEntries.length} entries for ${agentName} in selected date range`);

  const directoryEntry = directoryData.find(entry => 
    entry.name.toLowerCase().trim() === agentName.toLowerCase().trim()
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