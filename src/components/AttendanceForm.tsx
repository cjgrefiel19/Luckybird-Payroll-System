import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TEAM_MEMBERS } from "@/lib/constants";
import { AttendanceEntry } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { calculateTotalHours } from "@/lib/calculations";
import { AttendanceFormFields, formSchema, FormFields } from "./attendance/AttendanceFormFields";
import { useEffect } from "react";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

export function AttendanceForm({ onSubmit, editingEntry }: AttendanceFormProps) {
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeIn: "",
      timeOut: "",
    }
  });

  useEffect(() => {
    if (editingEntry) {
      form.reset({
        date: editingEntry.date,
        agentName: editingEntry.agentName,
        timeIn: editingEntry.timeIn,
        timeOut: editingEntry.timeOut,
        shiftType: editingEntry.shiftType,
      });
    }
  }, [editingEntry, form]);

  const selectedAgent = TEAM_MEMBERS.find(
    (member) => member.name === form.watch("agentName")
  );

  const handleSubmit = (values: FormFields) => {
    const member = TEAM_MEMBERS.find((m) => m.name === values.agentName);
    if (!member) return;

    const totalHours = calculateTotalHours(values.timeIn, values.timeOut);
    
    const entry: AttendanceEntry = {
      date: values.date,
      agentName: values.agentName,
      timeIn: values.timeIn,
      timeOut: values.timeOut,
      totalHours,
      hourlyRate: member.hourlyRate,
      shiftType: values.shiftType as any,
      otRate: 0,
      otPay: 0,
      dailyEarnings: 0,
    };

    onSubmit(entry);
    if (!editingEntry) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 border rounded-lg p-4 bg-white"
      >
        <AttendanceFormFields form={form} selectedAgent={selectedAgent} />
        <Button type="submit" className="w-full">
          {editingEntry ? "Update Entry" : "Add Entry"}
        </Button>
      </form>
    </Form>
  );
}