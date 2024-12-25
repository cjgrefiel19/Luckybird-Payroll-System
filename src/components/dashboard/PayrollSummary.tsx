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
    if (!startDate || !endDate) return false;
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

      const otHours = memberEntries
        .filter((entry) =>
          ["Regular OT", "Rest Day OT", "Special Holidays", "Regular Holidays"].includes(
            entry.shiftType
          )
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

      return {
        name: member.name,
        regularHours,
        otHours,
        hourlyRate: member.hourlyRate,
        paidLeaves,
        unpaidDays,
        totalDays,
      };
    });

  return (
    <Card className="bg-[#33C3F0]/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Payroll Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="text-left font-semibold">Agent Name</TableHead>
                <TableHead className="text-center font-semibold">Regular Working Hours</TableHead>
                <TableHead className="text-center font-semibold">OT Hours</TableHead>
                <TableHead className="text-center font-semibold">Hourly Rate</TableHead>
                <TableHead className="text-center font-semibold">Paid Leaves</TableHead>
                <TableHead className="text-center font-semibold">Unpaid Days</TableHead>
                <TableHead className="text-center font-semibold">Total Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((row) => (
                <TableRow key={row.name} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-center">{row.regularHours.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{row.otHours.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{formatCurrency(row.hourlyRate)}</TableCell>
                  <TableCell className="text-center">{row.paidLeaves}</TableCell>
                  <TableCell className="text-center">{row.unpaidDays}</TableCell>
                  <TableCell className="text-center">{row.totalDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}