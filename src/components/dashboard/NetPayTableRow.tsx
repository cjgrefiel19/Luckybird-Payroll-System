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
  const handleDeductionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '0' : e.target.value;
    onDeductionsChange(value);
  };

  const handleReimbursementsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '0' : e.target.value;
    onReimbursementsChange(value);
  };

  return (
    <TableRow>
      <TableCell className="text-center font-medium">{name}</TableCell>
      <TableCell className="text-center">
        {formatCurrency(totalEarnings)}
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="number"
          value={deductions || ''}
          onChange={handleDeductionsChange}
          className="w-32 mx-auto text-center"
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="number"
          value={reimbursements || ''}
          onChange={handleReimbursementsChange}
          className="w-32 mx-auto text-center"
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell className="text-center">
        {formatCurrency(netPay)}
      </TableCell>
    </TableRow>
  );
}