import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEAM_MEMBERS } from "@/lib/constants";
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

  const summaryData = TEAM_MEMBERS.map((member) => {
    const memberEntries = filteredEntries.filter(
      (entry) => entry.agentName === member.name
    );

    const regularHours = memberEntries
      .filter((entry) => entry.shiftType === "Regular Shift")
      .reduce((sum, entry) => sum + entry.totalHours, 0);

    const otHours = memberEntries
      .filter((entry) =>
        [
          "Regular OT",
          "Rest Day OT",
          "Special Holidays",
          "Regular Holidays",
        ].includes(entry.shiftType)
      )
      .reduce((sum, entry) => sum + entry.totalHours, 0);

    const paidLeaves = memberEntries.filter((entry) =>
      ["Paid SL", "Paid Leave"].includes(entry.shiftType)
    ).length;

    const unpaidDays = memberEntries.filter((entry) =>
      ["UnPaid Leave", "UnPaid SL"].includes(entry.shiftType)
    ).length;

    const totalDays = memberEntries.filter((entry) =>
      ["Regular Shift", "Paid SL", "Paid Leave"].includes(entry.shiftType)
    ).length;

    const totalEarnings = memberEntries.reduce(
      (sum, entry) => sum + entry.dailyEarnings,
      0
    );

    return {
      name: member.name,
      regularHours,
      otHours,
      hourlyRate: member.hourlyRate,
      paidLeaves,
      unpaidDays,
      totalDays,
      totalEarnings,
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
              <TableHead>Agent Name</TableHead>
              <TableHead className="text-right">Regular Working Hours</TableHead>
              <TableHead className="text-right">OT Hours</TableHead>
              <TableHead className="text-right">Hourly Rate</TableHead>
              <TableHead className="text-right">Paid Leaves</TableHead>
              <TableHead className="text-right">Unpaid Days</TableHead>
              <TableHead className="text-right">Total Days</TableHead>
              <TableHead className="text-right">Total Earnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">
                  {row.regularHours.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.otHours.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.hourlyRate)}
                </TableCell>
                <TableCell className="text-right">{row.paidLeaves}</TableCell>
                <TableCell className="text-right">{row.unpaidDays}</TableCell>
                <TableCell className="text-right">{row.totalDays}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.totalEarnings)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}