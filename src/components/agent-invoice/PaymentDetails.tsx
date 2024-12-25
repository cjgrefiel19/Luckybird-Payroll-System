import { Card, CardContent } from "../ui/card";
import { formatCurrency } from "@/lib/calculations";

interface PaymentDetailsProps {
  deductions: number;
  reimbursements: number;
  finalPay: number;
}

export function PaymentDetails({ deductions, reimbursements, finalPay }: PaymentDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Deductions</h3>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(deductions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Reimbursements</h3>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(reimbursements)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Final Pay</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(finalPay)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}