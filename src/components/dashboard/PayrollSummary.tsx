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

  const calculateTotalEarnings = (
    regularHours: number,
    otHoursByType: { [key: string]: number },
    hourlyRate: number,
    paidLeaves: number
  ) => {
    // Regular hours earnings
    const regularEarnings = regularHours * hourlyRate;

    // OT hours earnings
    const otEarnings = Object.entries(otHoursByType).reduce((total, [type, hours]) => {
      const multiplier = SHIFT_TYPES.find(st => st.type === type)?.multiplier || 1;
      return total + (hours * hourlyRate * multiplier);
    }, 0);

    // Paid leaves earnings (8 hours per day)
    const paidLeaveEarnings = paidLeaves * 8 * hourlyRate;

    return regularEarnings + otEarnings + paidLeaveEarnings;
  };

  const summaryData = TEAM_MEMBERS.map((member) => {
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

    const totalEarnings = calculateTotalEarnings(
      regularHours,
      otHoursByType,
      member.hourlyRate,
      paidLeaves
    );

    return {
      name: member.name,
      regularHours,
      otHours: totalOtHours,
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