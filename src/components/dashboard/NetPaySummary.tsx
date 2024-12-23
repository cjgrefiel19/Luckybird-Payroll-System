import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEAM_MEMBERS } from "@/lib/constants";
import { AttendanceEntry, NetPayData } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface NetPaySummaryProps {
  startDate?: Date;
  endDate?: Date;
}

export function NetPaySummary({ startDate, endDate }: NetPaySummaryProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [netPayData, setNetPayData] = useState<NetPayData[]>([]);

  // Load attendance entries
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

  // Load net pay data
  useEffect(() => {
    const savedNetPayData = localStorage.getItem('netPayData');
    if (savedNetPayData) {
      setNetPayData(JSON.parse(savedNetPayData));
    } else {
      // Initialize with default values for each team member
      const initialData = TEAM_MEMBERS.map((member) => ({
        agentName: member.name,
        deductions: 0,
        reimbursements: 0,
      }));
      setNetPayData(initialData);
    }
  }, []);

  // Save net pay data when it changes
  useEffect(() => {
    localStorage.setItem('netPayData', JSON.stringify(netPayData));
  }, [netPayData]);

  const filteredEntries = entries.filter((entry) => {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const handleDeductionsChange = (agentName: string, value: string) => {
    setNetPayData((prev) =>
      prev.map((data) =>
        data.agentName === agentName
          ? { ...data, deductions: parseFloat(value) || 0 }
          : data
      )
    );
  };

  const handleReimbursementsChange = (agentName: string, value: string) => {
    setNetPayData((prev) =>
      prev.map((data) =>
        data.agentName === agentName
          ? { ...data, reimbursements: parseFloat(value) || 0 }
          : data
      )
    );
  };

  // Calculate total earnings for each agent based on filtered entries
  const calculateTotalEarnings = (agentName: string) => {
    return filteredEntries
      .filter((entry) => entry.agentName === agentName)
      .reduce((sum, entry) => sum + entry.dailyEarnings, 0);
  };

  // Get unique agent names from filtered entries
  const activeAgents = [...new Set(filteredEntries.map(entry => entry.agentName))];

  const summaryData = TEAM_MEMBERS
    .filter(member => activeAgents.includes(member.name))
    .map((member) => {
      const totalEarnings = calculateTotalEarnings(member.name);

      const netPayInfo = netPayData.find(
        (data) => data.agentName === member.name
      ) || {
        deductions: 0,
        reimbursements: 0,
      };

      const netPay =
        totalEarnings + netPayInfo.reimbursements - netPayInfo.deductions;

      return {
        name: member.name,
        totalEarnings,
        deductions: netPayInfo.deductions,
        reimbursements: netPayInfo.reimbursements,
        netPay,
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Net Pay Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Agent Name</TableHead>
              <TableHead className="text-center">Total Earnings</TableHead>
              <TableHead className="text-center">Deductions</TableHead>
              <TableHead className="text-center">Reimbursements</TableHead>
              <TableHead className="text-center">Net Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="text-center font-medium">{row.name}</TableCell>
                <TableCell className="text-center">
                  {formatCurrency(row.totalEarnings)}
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    value={
                      netPayData.find((data) => data.agentName === row.name)
                        ?.deductions || 0
                    }
                    onChange={(e) =>
                      handleDeductionsChange(row.name, e.target.value)
                    }
                    className="w-32 mx-auto text-center"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    value={
                      netPayData.find((data) => data.agentName === row.name)
                        ?.reimbursements || 0
                    }
                    onChange={(e) =>
                      handleReimbursementsChange(row.name, e.target.value)
                    }
                    className="w-32 mx-auto text-center"
                  />
                </TableCell>
                <TableCell className="text-center">
                  {formatCurrency(row.netPay)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}