import { useState, useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "./dashboard/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isWithinInterval } from "date-fns";

export function DailyAttendance() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<AttendanceEntry | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const { toast } = useToast();

  // Load directory data
  useEffect(() => {
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      const parsedDirectory = JSON.parse(savedDirectory);
      setDirectoryData(parsedDirectory);
      console.log('Loaded directory data:', parsedDirectory);
    }
  }, []);

  // Load entries from localStorage on component mount
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

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('attendanceEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (entry: AttendanceEntry) => {
    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) => (e === editingEntry ? entry : e))
      );
      setEditingEntry(null);
      toast({
        title: "Entry Updated",
        description: `Attendance entry for ${entry.agentName} has been updated successfully.`,
      });
    } else {
      setEntries((prev) => [entry, ...prev]);
      toast({
        title: "Entry Added",
        description: `Attendance entry for ${entry.agentName} has been added successfully.`,
      });
    }
  };

  const handleEdit = (entry: AttendanceEntry) => {
    setEditingEntry(entry);
  };

  const handleDelete = (entry: AttendanceEntry) => {
    setEntries((prev) => prev.filter((e) => e !== entry));
    toast({
      title: "Entry Deleted",
      description: `Attendance entry for ${entry.agentName} has been deleted.`,
    });
  };

  const filteredEntries = entries.filter((entry) => {
    let matchesDateRange = true;
    let matchesAgent = true;

    // Filter by date range if both dates are selected
    if (startDate && endDate) {
      matchesDateRange = isWithinInterval(new Date(entry.date), {
        start: startDate,
        end: endDate,
      });
    }

    // Filter by agent if one is selected
    if (selectedAgent !== "all") {
      matchesAgent = entry.agentName === selectedAgent;
    }

    return matchesDateRange && matchesAgent;
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Daily Attendance</h2>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              payPeriods={[]}
              selectedPayPeriod={null}
              onPayPeriodSelect={() => {}}
              onSavePayPeriod={() => {}}
              onDeletePayPeriod={() => {}}
            />
            <Select
              value={selectedAgent}
              onValueChange={setSelectedAgent}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {directoryData.map((member) => (
                  <SelectItem key={member.name} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <AttendanceForm onSubmit={handleSubmit} editingEntry={editingEntry} />
      <AttendanceTable 
        entries={filteredEntries} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}