import { useState, useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceEntry, DirectoryEntry, PayPeriod } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { isWithinInterval } from "date-fns";
import { TEAM_MEMBERS } from "@/lib/constants";
import { AttendanceHeader } from "./attendance/AttendanceHeader";
import html2pdf from "html2pdf.js";

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

  const handleExport = () => {
    const element = document.getElementById('attendance-content');
    if (!element) return;

    const opt = {
      margin: [0.5, 0.5],
      filename: `attendance-report-${startDate?.toISOString().split('T')[0]}-${endDate?.toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'landscape',
      }
    };

    html2pdf().set(opt).from(element).save();
    
    toast({
      title: "Success",
      description: "Attendance report exported successfully",
    });
  };

  const filteredEntries = entries.filter((entry) => {
    let matchesDateRange = true;
    let matchesAgent = true;

    if (startDate && endDate) {
      matchesDateRange = isWithinInterval(new Date(entry.date), {
        start: startDate,
        end: endDate,
      });
    }

    if (selectedAgent !== "all") {
      matchesAgent = entry.agentName === selectedAgent;
    }

    return matchesDateRange && matchesAgent;
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Daily Attendance</h2>
      
      <AttendanceHeader
        startDate={startDate}
        endDate={endDate}
        selectedAgent={selectedAgent}
        payPeriods={payPeriods}
        selectedPayPeriod={selectedPayPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onAgentChange={setSelectedAgent}
        onPayPeriodSelect={setSelectedPayPeriod}
        onSavePayPeriod={handleSavePayPeriod}
        onDeletePayPeriod={handleDeletePayPeriod}
        onExport={handleExport}
        directoryData={directoryData}
        entries={entries}
      />

      <div id="attendance-content">
        <AttendanceForm onSubmit={handleSubmit} editingEntry={editingEntry} />
        <AttendanceTable 
          entries={filteredEntries} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  );
}
