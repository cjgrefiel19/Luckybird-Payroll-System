import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "../dashboard/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { DirectoryEntry } from "@/lib/types";

interface AttendanceHeaderProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  selectedAgent: string;
  payPeriods: any[];
  selectedPayPeriod: string | null;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onAgentChange: (value: string) => void;
  onPayPeriodSelect: (value: string | null) => void;
  onSavePayPeriod: (name: string) => void;
  onDeletePayPeriod: (id: string) => void;
  onExport: () => void;
  directoryData: DirectoryEntry[];
  entries: any[];
}

export function AttendanceHeader({
  startDate,
  endDate,
  selectedAgent,
  payPeriods,
  selectedPayPeriod,
  onStartDateChange,
  onEndDateChange,
  onAgentChange,
  onPayPeriodSelect,
  onSavePayPeriod,
  onDeletePayPeriod,
  onExport,
  directoryData,
  entries,
}: AttendanceHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
              payPeriods={payPeriods}
              selectedPayPeriod={selectedPayPeriod}
              onPayPeriodSelect={onPayPeriodSelect}
              onSavePayPeriod={onSavePayPeriod}
              onDeletePayPeriod={onDeletePayPeriod}
            />
            <Button onClick={onExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <Select
            value={selectedAgent}
            onValueChange={onAgentChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {[...new Set([...directoryData.map(member => member.name), ...entries.map(entry => entry.agentName)])].map((agentName) => (
                <SelectItem key={agentName} value={agentName}>
                  {agentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}