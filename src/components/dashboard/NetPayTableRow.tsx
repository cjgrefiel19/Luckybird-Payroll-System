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
          type="number"
          value={deductions === 0 ? '' : deductions}
          onChange={(e) => onDeductionsChange(e.target.value)}
          className="w-32 mx-auto text-center"
          min="0"
          step="0.01"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="number"
          value={reimbursements === 0 ? '' : reimbursements}
          onChange={(e) => onReimbursementsChange(e.target.value)}
          className="w-32 mx-auto text-center"
          min="0"
          step="0.01"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="text-center">
        {formatCurrency(netPay)}
      </TableCell>
    </TableRow>
  );
}