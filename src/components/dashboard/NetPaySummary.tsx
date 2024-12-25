import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceEntry } from "@/lib/types";
import { NetPayCalculator } from "./NetPayCalculator";
import { NetPaySummaryProps } from "./types/netPay";

export function NetPaySummary({ startDate, endDate }: NetPaySummaryProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);

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

  return (
    <Card className="bg-white">
      <CardContent className="p-0">
        <div className="rounded-md overflow-hidden">
          <NetPayCalculator
            entries={entries}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </CardContent>
    </Card>
  );
}