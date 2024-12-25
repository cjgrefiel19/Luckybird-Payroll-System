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
    <Card className="bg-[#33C3F0]/50">
      <CardHeader>
        <CardTitle className="text-black">Payroll Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-black">Agent Name</TableHead>
                <TableHead className="text-center text-black">Regular Working Hours</TableHead>
                <TableHead className="text-center text-black">OT Hours</TableHead>
                <TableHead className="text-center text-black">Hourly Rate</TableHead>
                <TableHead className="text-center text-black">Paid Leaves</TableHead>
                <TableHead className="text-center text-black">Unpaid Days</TableHead>
                <TableHead className="text-center text-black">Total Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="text-center font-medium text-black">{row.name}</TableCell>
                  <TableCell className="text-center text-black">
                    {row.regularHours.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-black">
                    {row.otHours.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-black">
                    {formatCurrency(row.hourlyRate)}
                  </TableCell>
                  <TableCell className="text-center text-black">{row.paidLeaves}</TableCell>
                  <TableCell className="text-center text-black">{row.unpaidDays}</TableCell>
                  <TableCell className="text-center text-black">{row.totalDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}