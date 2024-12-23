import { useState, useEffect } from "react";
import { TEAM_MEMBERS } from "@/lib/constants";
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
} from "@/components/ui/table";

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
      </TableBody>
    </Table>
  );
}