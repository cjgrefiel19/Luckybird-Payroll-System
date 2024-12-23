import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIFT_TYPES, TEAM_MEMBERS } from "@/lib/constants";
import { AttendanceEntry, TeamMember } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { calculateTotalHours } from "@/lib/calculations";

const formSchema = z.object({
  date: z.date(),
  agentName: z.string(),
  timeIn: z.string(),
  timeOut: z.string(),
  shiftType: z.string(),
});

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
}

export function AttendanceForm({ onSubmit }: AttendanceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const selectedAgent = TEAM_MEMBERS.find(
    (member) => member.name === form.watch("agentName")
  );

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const member = TEAM_MEMBERS.find((m) => m.name === values.agentName);
    if (!member) return;

    const totalHours = calculateTotalHours(member.timeIn, member.timeOut);
    
    const entry: AttendanceEntry = {
      date: values.date,
      agentName: values.agentName,
      timeIn: member.timeIn,
      timeOut: member.timeOut,
      totalHours,
      hourlyRate: member.hourlyRate,
      shiftType: values.shiftType as any,
      otRate: 0, // Will be calculated in the table
      otPay: 0, // Will be calculated in the table
      dailyEarnings: 0, // Will be calculated in the table
    };

    onSubmit(entry);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 border rounded-lg p-4 bg-white"
      >
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Input
                    {...field}
                    value={selectedAgent?.timeIn || ""}
                    disabled
                  />
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
                  <Input
                    {...field}
                    value={selectedAgent?.timeOut || ""}
                    disabled
                  />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <Button type="submit" className="w-full">
          Add Entry
        </Button>
      </form>
    </Form>
  );
}