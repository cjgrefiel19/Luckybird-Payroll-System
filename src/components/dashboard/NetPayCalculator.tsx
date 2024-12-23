import { useState, useEffect } from "react";
import { NetPayData, DirectoryEntry, AttendanceEntry } from "@/lib/types";
import { calculateTotalEarnings, filterEntriesByDateRange } from "./utils/netPayCalculations";
import { NetPayCalculatorProps } from "./types/netPay";
import { NetPayTableRow } from "./NetPayTableRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";

export function NetPayCalculator({ entries, startDate, endDate }: NetPayCalculatorProps) {
  const [netPayData, setNetPayData] = useState<NetPayData[]>([]);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    const savedNetPayData = localStorage.getItem('netPayData');
    if (savedNetPayData) {
      setNetPayData(JSON.parse(savedNetPayData));
    }

    // Load directory data
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      const directory = JSON.parse(savedDirectory);
      setDirectoryData(directory);
      
      // Initialize netPayData if it doesn't exist
      if (!savedNetPayData) {
        const initialData = directory.map((member: DirectoryEntry) => ({
          agentName: member.name,
          deductions: 0,
          reimbursements: 0,
        }));
        setNetPayData(initialData);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('netPayData', JSON.stringify(netPayData));
  }, [netPayData]);

  const filteredEntries = filterEntriesByDateRange(entries, startDate, endDate);
  const activeAgents = [...new Set(filteredEntries.map(entry => entry.agentName))];

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

  const summaryData = directoryData
    .filter(member => activeAgents.includes(member.name))
    .map((member) => {
      const memberEntries = filteredEntries.filter(
        (entry) => entry.agentName === member.name
      );
      const totalEarnings = calculateTotalEarnings(memberEntries, member.name);
      const netPayInfo = netPayData.find(
        (data) => data.agentName === member.name
      ) || {
        deductions: 0,
        reimbursements: 0,
      };

      return {
        name: member.name,
        totalEarnings,
        deductions: netPayInfo.deductions,
        reimbursements: netPayInfo.reimbursements,
        netPay: totalEarnings + netPayInfo.reimbursements - netPayInfo.deductions,
      };
    });

  // Calculate totals
  const totals = summaryData.reduce(
    (acc, curr) => ({
      totalEarnings: acc.totalEarnings + curr.totalEarnings,
      deductions: acc.deductions + curr.deductions,
      reimbursements: acc.reimbursements + curr.reimbursements,
      netPay: acc.netPay + curr.netPay,
    }),
    { totalEarnings: 0, deductions: 0, reimbursements: 0, netPay: 0 }
  );

  return (
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
          <NetPayTableRow
            key={row.name}
            {...row}
            onDeductionsChange={(value) => handleDeductionsChange(row.name, value)}
            onReimbursementsChange={(value) => handleReimbursementsChange(row.name, value)}
          />
        ))}
        <TableRow className="font-bold bg-muted/50">
          <TableCell className="text-center">TOTAL</TableCell>
          <TableCell className="text-center">{formatCurrency(totals.totalEarnings)}</TableCell>
          <TableCell className="text-center">{formatCurrency(totals.deductions)}</TableCell>
          <TableCell className="text-center">{formatCurrency(totals.reimbursements)}</TableCell>
          <TableCell className="text-center">{formatCurrency(totals.netPay)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}