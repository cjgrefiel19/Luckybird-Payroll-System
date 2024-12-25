import { useState, useEffect } from "react";
import { NetPayData } from "@/lib/types";
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
import { TEAM_MEMBERS } from "@/lib/constants";

export function NetPayCalculator({ entries, startDate, endDate }: NetPayCalculatorProps) {
  const [netPayData, setNetPayData] = useState<NetPayData[]>([]);

  useEffect(() => {
    const savedNetPayData = localStorage.getItem('netPayData');
    if (savedNetPayData) {
      setNetPayData(JSON.parse(savedNetPayData));
    } else {
      const initialData = TEAM_MEMBERS.map((member) => ({
        agentName: member.name,
        deductions: 0,
        reimbursements: 0,
      }));
      setNetPayData(initialData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('netPayData', JSON.stringify(netPayData));
  }, [netPayData]);

  const filteredEntries = filterEntriesByDateRange(entries, startDate, endDate);
  const activeAgents = [...new Set(filteredEntries.map(entry => entry.agentName))];

  const handleDeductionsChange = (agentName: string, value: string) => {
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    const numValue = sanitizedValue === '' ? 0 : parseFloat(sanitizedValue);
    
    if (!isNaN(numValue)) {
      setNetPayData((prev) =>
        prev.map((data) =>
          data.agentName === agentName
            ? { ...data, deductions: numValue }
            : data
        )
      );
    }
  };

  const handleReimbursementsChange = (agentName: string, value: string) => {
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    const numValue = sanitizedValue === '' ? 0 : parseFloat(sanitizedValue);
    
    if (!isNaN(numValue)) {
      setNetPayData((prev) =>
        prev.map((data) =>
          data.agentName === agentName
            ? { ...data, reimbursements: numValue }
            : data
        )
      );
    }
  };

  const summaryData = TEAM_MEMBERS
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
        <TableRow className="bg-gray-100/80">
          <TableHead className="text-left py-4 px-6 text-gray-900 font-semibold">Agent Name</TableHead>
          <TableHead className="text-center py-4 px-6 text-gray-900 font-semibold">Total Earnings</TableHead>
          <TableHead className="text-center py-4 px-6 text-gray-900 font-semibold">Deductions</TableHead>
          <TableHead className="text-center py-4 px-6 text-gray-900 font-semibold">Reimbursements</TableHead>
          <TableHead className="text-center py-4 px-6 text-gray-900 font-semibold">Net Pay</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaryData.map((row, index) => (
          <TableRow 
            key={row.name}
            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
          >
            <TableCell className="py-4 px-6">{row.name}</TableCell>
            <TableCell className="text-center py-4 px-6">{formatCurrency(row.totalEarnings)}</TableCell>
            <TableCell className="text-center py-4 px-6">
              <Input
                type="text"
                inputMode="decimal"
                value={row.deductions === 0 ? '' : row.deductions.toString()}
                onChange={(e) => handleDeductionsChange(row.name, e.target.value)}
                className="w-32 mx-auto text-center h-10"
                placeholder="0.00"
              />
            </TableCell>
            <TableCell className="text-center py-4 px-6">
              <Input
                type="text"
                inputMode="decimal"
                value={row.reimbursements === 0 ? '' : row.reimbursements.toString()}
                onChange={(e) => handleReimbursementsChange(row.name, e.target.value)}
                className="w-32 mx-auto text-center h-10"
                placeholder="0.00"
              />
            </TableCell>
            <TableCell className="text-center py-4 px-6">{formatCurrency(row.netPay)}</TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold bg-gray-100/50">
          <TableCell className="text-center py-4 px-6">TOTAL</TableCell>
          <TableCell className="text-center py-4 px-6">{formatCurrency(totals.totalEarnings)}</TableCell>
          <TableCell className="text-center py-4 px-6">{formatCurrency(totals.deductions)}</TableCell>
          <TableCell className="text-center py-4 px-6">{formatCurrency(totals.reimbursements)}</TableCell>
          <TableCell className="text-center py-4 px-6">{formatCurrency(totals.netPay)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
