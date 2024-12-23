import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/calculations";
import { NetPayTableRowProps } from "./types/netPay";

export function NetPayTableRow({
  name,
  totalEarnings,
  deductions,
  reimbursements,
  netPay,
  onDeductionsChange,
  onReimbursementsChange,
}: NetPayTableRowProps) {
  return (
    <TableRow>
      <TableCell className="text-center font-medium">{name}</TableCell>
      <TableCell className="text-center">
        {formatCurrency(totalEarnings)}
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="text"
          inputMode="decimal"
          value={deductions === 0 ? '' : deductions.toString()}
          onChange={(e) => onDeductionsChange(e.target.value)}
          className="w-32 mx-auto text-center"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="text"
          inputMode="decimal"
          value={reimbursements === 0 ? '' : reimbursements.toString()}
          onChange={(e) => onReimbursementsChange(e.target.value)}
          className="w-32 mx-auto text-center"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="text-center">
        {formatCurrency(netPay)}
      </TableCell>
    </TableRow>
  );
}