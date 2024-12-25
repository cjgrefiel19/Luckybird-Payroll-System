import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayPeriod } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface PayPeriodSelectProps {
  payPeriods: PayPeriod[];
  selectedPayPeriod: string | null;
  onPayPeriodSelect: (id: string) => void;
  onDeletePayPeriod: (id: string) => void;
}

export function PayPeriodSelect({
  payPeriods,
  selectedPayPeriod,
  onPayPeriodSelect,
  onDeletePayPeriod,
}: PayPeriodSelectProps) {
  return (
    <Select
      value={selectedPayPeriod || ""}
      onValueChange={onPayPeriodSelect}
    >
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="Select pay period" />
      </SelectTrigger>
      <SelectContent className="bg-background z-50">
        {payPeriods.map((period) => (
          <div key={period.id} className="flex items-center justify-between p-2">
            <SelectItem 
              value={period.id}
              className="flex-1"
            >
              {period.name} ({format(new Date(period.startDate), "MMM d")} - {format(new Date(period.endDate), "MMM d, yyyy")})
            </SelectItem>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeletePayPeriod(period.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}