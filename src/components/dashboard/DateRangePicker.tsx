import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PayPeriod } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
  payPeriods: PayPeriod[];
  selectedPayPeriod: string | null;
  onPayPeriodSelect: (id: string | null) => void;
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
  const [newPayPeriodName, setNewPayPeriodName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (newPayPeriodName.trim()) {
      onSavePayPeriod(newPayPeriodName.trim());
      setNewPayPeriodName("");
      setShowSaveInput(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, periodId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeletePayPeriod(periodId);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <Select
          value={selectedPayPeriod || ""}
          onValueChange={(value) => {
            const period = payPeriods.find((p) => p.id === value);
            if (period) {
              onStartDateChange(period.startDate);
              onEndDateChange(period.endDate);
              onPayPeriodSelect(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select pay period" />
          </SelectTrigger>
          <SelectContent>
            {payPeriods.map((period) => (
              <SelectItem 
                key={period.id} 
                value={period.id} 
                className="flex items-center justify-between pr-8"
              >
                <span>{period.name}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={(e) => handleDelete(e, period.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete pay period</p>
                  </TooltipContent>
                </Tooltip>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="flex items-center gap-2">
        {showSaveInput ? (
          <>
            <Input
              placeholder="Enter pay period name"
              value={newPayPeriodName}
              onChange={(e) => setNewPayPeriodName(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleSave}>Save</Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveInput(false);
                setNewPayPeriodName("");
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowSaveInput(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Save Period
          </Button>
        )}
      </div>
    </div>
  );
}