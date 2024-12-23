import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SHIFT_TYPES, TEAM_MEMBERS } from "@/lib/constants";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = z.object({
  date: z.date(),
  agentName: z.string(),
  timeIn: z.string(),
  timeOut: z.string(),
  shiftType: z.string().default("Regular Shift"),
});

type FormFields = z.infer<typeof formSchema>;

interface AttendanceFormFieldsProps {
  form: UseFormReturn<FormFields>;
  selectedAgent: typeof TEAM_MEMBERS[0] | undefined;
}

export function AttendanceFormFields({ form, selectedAgent }: AttendanceFormFieldsProps) {
  useEffect(() => {
    if (selectedAgent) {
      form.setValue("timeIn", selectedAgent.timeIn);
      form.setValue("timeOut", selectedAgent.timeOut);
      form.setValue("shiftType", "Regular Shift");
    }
  }, [selectedAgent, form]);

  return (
    <>
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="agentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent Name</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member.name} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="timeIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time In</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeOut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Out</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="shiftType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shift Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "Regular Shift"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SHIFT_TYPES.map((shift) => (
                  <SelectItem key={shift.type} value={shift.type}>
                    {shift.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </>
  );
}

export { formSchema };
export type { FormFields };