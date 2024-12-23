import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEAM_MEMBERS, SHIFT_TYPES } from "@/lib/constants";
import { AttendanceEntry } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface PayrollSummaryProps {
  startDate?: Date;
  endDate?: Date;
}

export function PayrollSummary({ startDate, endDate }: PayrollSummaryProps) {
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

  const filteredEntries = entries.filter((entry) => {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  // Get unique agent names from filtered entries
  const activeAgents = [...new Set(filteredEntries.map(entry => entry.agentName))];

  const summaryData = TEAM_MEMBERS
    .filter(member => activeAgents.includes(member.name))
    .map((member) => {
      const memberEntries = filteredEntries.filter(
        (entry) => entry.agentName === member.name
      );

      const regularHours = memberEntries
        .filter((entry) => entry.shiftType === "Regular Shift")
        .reduce((sum, entry) => sum + entry.totalHours, 0);

      // Group OT hours by type
      const otHoursByType = memberEntries
        .filter((entry) =>
          ["Regular OT", "Rest Day OT", "Special Holidays", "Regular Holidays"].includes(
            entry.shiftType
          )
        )
        .reduce((acc, entry) => {
          acc[entry.shiftType] = (acc[entry.shiftType] || 0) + entry.totalHours;
          return acc;
        }, {} as { [key: string]: number });

      const totalOtHours = Object.values(otHoursByType).reduce(
        (sum, hours) => sum + hours,
        0
      );

      const paidLeaves = memberEntries.filter((entry) =>
        ["Paid SL", "Paid Leave"].includes(entry.shiftType)
      ).length;

      const unpaidDays = memberEntries.filter((entry) =>
        ["UnPaid Leave", "UnPaid SL"].includes(entry.shiftType)
      ).length;

      const totalDays = memberEntries.filter((entry) =>
        ["Regular Shift", "Paid SL", "Paid Leave"].includes(entry.shiftType)
      ).length;

      return {
        name: member.name,
        regularHours,
        otHours: totalOtHours,
        hourlyRate: member.hourlyRate,
        paidLeaves,
        unpaidDays,
        totalDays,
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Agent Name</TableHead>
              <TableHead className="text-center">Regular Working Hours</TableHead>
              <TableHead className="text-center">OT Hours</TableHead>
              <TableHead className="text-center">Hourly Rate</TableHead>
              <TableHead className="text-center">Paid Leaves</TableHead>
              <TableHead className="text-center">Unpaid Days</TableHead>
              <TableHead className="text-center">Total Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="text-center font-medium">{row.name}</TableCell>
                <TableCell className="text-center">
                  {row.regularHours.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {row.otHours.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {formatCurrency(row.hourlyRate)}
                </TableCell>
                <TableCell className="text-center">{row.paidLeaves}</TableCell>
                <TableCell className="text-center">{row.unpaidDays}</TableCell>
                <TableCell className="text-center">{row.totalDays}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}