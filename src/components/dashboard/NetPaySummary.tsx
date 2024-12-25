import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-[#33C3F0]/50">
      <CardHeader>
        <CardTitle className="text-black">Overall Net Pay Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-md overflow-hidden">
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