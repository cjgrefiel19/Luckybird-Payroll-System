import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AttendanceEntry, TeamMember } from "@/lib/types";
import { AttendanceFormFields } from "./attendance/AttendanceFormFields";
import { useEffect, useState } from "react";
import { TEAM_MEMBERS } from "@/lib/constants";
import { useScheduleFetch } from "@/hooks/useScheduleFetch";
import { useAttendanceForm } from "@/hooks/useAttendanceForm";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

export function AttendanceForm({ onSubmit, editingEntry }: AttendanceFormProps) {
  const [teamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const { fetchSchedule } = useScheduleFetch();
  const { form, handleSubmit } = useAttendanceForm({ onSubmit, editingEntry });
  
  // Watch for changes in the selected agent
  const selectedAgentName = form.watch("agentName");

  // Auto-populate time fields when agent is selected
  useEffect(() => {
    const updateSchedule = async () => {
      if (!selectedAgentName) return;
      
      console.log("Fetching schedule for agent:", selectedAgentName);
      const schedule = await fetchSchedule(selectedAgentName);
      
      if (schedule) {
        console.log("Setting form values with schedule:", schedule);
        form.setValue("timeIn", schedule.time_in);
        form.setValue("timeOut", schedule.time_out);
      }
    };

    updateSchedule();
  }, [selectedAgentName, form, fetchSchedule]);

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