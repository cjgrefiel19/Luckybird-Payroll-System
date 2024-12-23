import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PayPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { PayPeriodSelect } from "./PayPeriodSelect";
import { SavePayPeriod } from "./SavePayPeriod";

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
  payPeriods: PayPeriod[];
  selectedPayPeriod: string | null;
  onPayPeriodSelect: (id: string) => void;
  onSavePayPeriod: (name: string) => void;
  onDeletePayPeriod: (id: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  payPeriods,
  selectedPayPeriod,
  onPayPeriodSelect,
  onSavePayPeriod,
  onDeletePayPeriod,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <PayPeriodSelect
          payPeriods={payPeriods}
          selectedPayPeriod={selectedPayPeriod}
          onPayPeriodSelect={(value) => {
            const period = payPeriods.find((p) => p.id === value);
            if (period) {
              onStartDateChange(period.startDate);
              onEndDateChange(period.endDate);
              onPayPeriodSelect(value);
            }
          }}
          onDeletePayPeriod={onDeletePayPeriod}
        />
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>End date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <SavePayPeriod onSavePayPeriod={onSavePayPeriod} />
    </div>
  );
}