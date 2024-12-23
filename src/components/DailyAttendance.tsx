import { useState } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export function DailyAttendance() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const { toast } = useToast();

  const handleSubmit = (entry: AttendanceEntry) => {
    setEntries((prev) => [entry, ...prev]);
    toast({
      title: "Entry Added",
      description: `Attendance entry for ${entry.agentName} has been added successfully.`,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Daily Attendance</h2>
      <AttendanceForm onSubmit={handleSubmit} />
      <AttendanceTable entries={entries} />
    </div>
  );
}