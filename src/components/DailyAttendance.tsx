import { useState, useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export function DailyAttendance() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<AttendanceEntry | null>(null);
  const { toast } = useToast();

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date) // Convert date string back to Date object
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

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Daily Attendance</h2>
      <AttendanceForm onSubmit={handleSubmit} editingEntry={editingEntry} />
      <AttendanceTable 
        entries={entries} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}