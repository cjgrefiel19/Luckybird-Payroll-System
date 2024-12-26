import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeamMember } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { formSchema, FormSchema } from "./TeamScheduleFormSchema";

interface UseTeamScheduleFormProps {
  member?: TeamMember;
  onSubmit: (data: TeamMember) => Promise<void>;
  onClose: () => void;
}

export function useTeamScheduleForm({ member, onSubmit, onClose }: UseTeamScheduleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: member || {
      name: "",
      timeIn: "",
      timeOut: "",
      workdays: "",
      restDays: "",
      monthlyRate: 0,
      hourlyRate: 0,
      position: "",
    },
  });

  const handleSubmit = async (values: FormSchema) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values as TeamMember);
      onClose();
      toast({
        title: `${member ? "Updated" : "Added"} successfully`,
        description: `Team member has been ${member ? "updated" : "added"}.`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: `Failed to ${member ? "update" : "add"} team member. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}