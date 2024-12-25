import { Card, CardContent } from "../ui/card";
import { AttendanceEntry } from "@/lib/types";

interface InvoiceBreakdownProps {
  entries: AttendanceEntry[];
}

export function InvoiceBreakdown({ entries }: InvoiceBreakdownProps) {
  const getWorkDaysBreakdown = () => {
    const breakdown = entries.reduce((acc, entry) => {
      const type = entry.shiftType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([type, count]) => ({
      type,
      count
    }));
  };

  const workDaysBreakdown = getWorkDaysBreakdown();

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Work Days Breakdown</h3>
        <div className="space-y-2">
          {workDaysBreakdown.map(({ type, count }) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-muted-foreground">{type}:</span>
              <span className="font-medium">{count} day{count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}