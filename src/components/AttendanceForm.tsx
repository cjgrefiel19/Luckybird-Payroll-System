import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AttendanceEntry, TeamMember } from "@/lib/types";
import { AttendanceFormFields } from "./attendance/AttendanceFormFields";
import { useState, useEffect } from "react";
import { TEAM_MEMBERS } from "@/lib/constants";
import { useAttendanceForm } from "@/hooks/useAttendanceForm";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

export function AttendanceForm({ onSubmit, editingEntry }: AttendanceFormProps) {
  const [teamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const { form, handleSubmit } = useAttendanceForm({ onSubmit, editingEntry });

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