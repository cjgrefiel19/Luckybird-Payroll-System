import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { AttendanceEntry } from "@/lib/types";

interface AgentSummaryCardsProps {
  filteredEntries: AttendanceEntry[];
}

export function AgentSummaryCards({ filteredEntries }: AgentSummaryCardsProps) {
  const totalWorkingHours = filteredEntries.reduce(
    (sum, entry) => sum + entry.totalHours,
    0
  );

  const totalOTHours = filteredEntries
    .filter(entry => entry.shiftType.includes('OT'))
    .reduce((sum, entry) => sum + entry.totalHours, 0);

  const holidayHours = filteredEntries
    .filter(entry => 
      entry.shiftType.includes('Holiday') || 
      entry.shiftType.includes('Special')
    )
    .reduce((sum, entry) => sum + entry.totalHours, 0);

  const leaveDays = filteredEntries
    .filter(entry => entry.shiftType.includes('Leave'))
    .length;

  const totalEarnings = filteredEntries.reduce(
    (sum, entry) => {
      let multiplier = 1;
      if (entry.shiftType === 'Regular OT') multiplier = 1.25;
      else if (entry.shiftType === 'Rest Day OT') multiplier = 1.30;
      else if (entry.shiftType === 'Special Holidays') multiplier = 1.30;
      else if (entry.shiftType === 'Regular Holidays') multiplier = 2.00;
      
      return sum + (entry.totalHours * entry.hourlyRate * multiplier);
    },
    0
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">
            {totalWorkingHours.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Total Hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">
            {totalOTHours.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Total OT Hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">
            {holidayHours.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Holiday Hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">{leaveDays}</div>
          <p className="text-sm text-muted-foreground">Leave Days</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">
            {formatCurrency(totalEarnings)}
          </div>
          <p className="text-sm text-muted-foreground">Total Earnings</p>
        </CardContent>
      </Card>
    </div>
  );
}