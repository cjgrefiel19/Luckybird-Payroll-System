import { useState, useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceEntry, DirectoryEntry, PayPeriod } from "@/lib/types";
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
import { TEAM_MEMBERS } from "@/lib/constants";

export function DailyAttendance() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<AttendanceEntry | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
  const { toast } = useToast();

  // Load directory data and team members
  useEffect(() => {
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      const parsedDirectory = JSON.parse(savedDirectory);
      setDirectoryData(parsedDirectory);
    }

    // Add team members to directory if they don't exist
    const teamMemberNames = TEAM_MEMBERS.map(member => ({
      name: member.name,
      position: member.position || 'Agent'
    }));
    setDirectoryData(prevData => {
      const existingNames = new Set(prevData.map(d => d.name));
      const newMembers = teamMemberNames.filter(member => !existingNames.has(member.name));
      return [...prevData, ...newMembers];
    });
  }, []);

  // Load pay periods from localStorage
  useEffect(() => {
    const savedPayPeriods = localStorage.getItem('payPeriods');
    if (savedPayPeriods) {
      try {
        const parsed = JSON.parse(savedPayPeriods).map((period: any) => ({
          ...period,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
        }));
        setPayPeriods(parsed);
        
        // If there's no selected period but we have pay periods, select the last one
        if (!selectedPayPeriod && parsed.length > 0) {
          const lastPeriod = parsed[parsed.length - 1];
          setSelectedPayPeriod(lastPeriod.id);
          setStartDate(lastPeriod.startDate);
          setEndDate(lastPeriod.endDate);
        }
      } catch (error) {
        console.error('Error parsing pay periods:', error);
      }
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

  const handleSavePayPeriod = (name: string) => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
      });
      return;
    }

    const newPayPeriod: PayPeriod = {
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
    };

    setPayPeriods((prev) => [...prev, newPayPeriod]);
    toast({
      title: "Success",
      description: "Pay period saved successfully",
    });
  };

  const handleDeletePayPeriod = (id: string) => {
    setPayPeriods((prev) => prev.filter((period) => period.id !== id));
    if (selectedPayPeriod === id) {
      setSelectedPayPeriod(null);
      setStartDate(undefined);
      setEndDate(undefined);
    }
    toast({
      title: "Success",
      description: "Pay period deleted successfully",
    });
  };

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
              payPeriods={payPeriods}
              selectedPayPeriod={selectedPayPeriod}
              onPayPeriodSelect={setSelectedPayPeriod}
              onSavePayPeriod={handleSavePayPeriod}
              onDeletePayPeriod={handleDeletePayPeriod}
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
                {[...new Set([...directoryData.map(member => member.name), ...entries.map(entry => entry.agentName)])].map((agentName) => (
                  <SelectItem key={agentName} value={agentName}>
                    {agentName}
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
