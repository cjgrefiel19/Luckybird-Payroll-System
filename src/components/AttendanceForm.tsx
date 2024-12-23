import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AttendanceEntry, TeamMember } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { calculateTotalHours } from "@/lib/calculations";
import { AttendanceFormFields, formSchema, FormFields } from "./attendance/AttendanceFormFields";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TEAM_MEMBERS } from "@/lib/constants";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

export function AttendanceForm({ onSubmit, editingEntry }: AttendanceFormProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const { toast } = useToast();
  
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeIn: "",
      timeOut: "",
      shiftType: "Regular Shift",
    }
  });

  // Watch for changes in the selected agent
  const selectedAgentName = form.watch("agentName");

  // Auto-populate time fields when agent is selected
  useEffect(() => {
    if (selectedAgentName) {
      const member = teamMembers.find(m => m.name === selectedAgentName);
      if (member) {
        form.setValue("timeIn", member.timeIn);
        form.setValue("timeOut", member.timeOut);
      }
    }
  }, [selectedAgentName, form, teamMembers]);

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

  const handleSubmit = (values: FormFields) => {
    const member = teamMembers.find((m) => m.name === values.agentName);
    if (!member) {
      toast({
        title: "Error",
        description: "Please select a valid agent",
        variant: "destructive",
      });
      return;
    }

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
        <AttendanceFormFields form={form} teamMembers={teamMembers} />
        <Button type="submit" className="w-full">
          {editingEntry ? "Update Entry" : "Add Entry"}
        </Button>
      </form>
    </Form>
  );
}