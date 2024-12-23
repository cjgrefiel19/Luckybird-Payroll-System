import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { calculateTotalHours } from "@/lib/calculations";
import { AttendanceFormFields, formSchema, FormFields } from "./attendance/AttendanceFormFields";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

const defaultDirectoryData: DirectoryEntry[] = [
  { name: "Cherrie Ferrer", position: "Team Leader, Operations" },
  { name: "Chrisjie Grefiel", position: "Director, Account Operations" },
  { name: "Jobelle Fortuna", position: "Finance Specialist" },
  { name: "Mhel Malit", position: "Sr. Operation Specialist" },
  { name: "Gilbert Condino", position: "Team Leader, Sourcing" },
];

export function AttendanceForm({ onSubmit, editingEntry }: AttendanceFormProps) {
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      setDirectoryData(JSON.parse(savedDirectory));
    } else {
      // Initialize with default data if none exists
      localStorage.setItem('directoryData', JSON.stringify(defaultDirectoryData));
      setDirectoryData(defaultDirectoryData);
      toast({
        title: "Directory Initialized",
        description: "Default directory data has been loaded.",
      });
    }
  }, [toast]);

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeIn: "",
      timeOut: "",
      shiftType: "Regular Shift",
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

  const selectedAgent = directoryData.find(
    (member) => member.name === form.watch("agentName")
  );

  const handleSubmit = (values: FormFields) => {
    const member = directoryData.find((m) => m.name === values.agentName);
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
      hourlyRate: getHourlyRate(member.name),
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

  // Helper function to get hourly rate based on agent name
  const getHourlyRate = (name: string): number => {
    const rateMap: { [key: string]: number } = {
      "Cherrie Ferrer": 5.38,
      "Chrisjie Grefiel": 8.75,
      "Jobelle Fortuna": 5.00,
      "Mhel Malit": 4.69,
      "Gilbert Condino": 5.63,
    };
    return rateMap[name] || 0;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 border rounded-lg p-4 bg-white"
      >
        <AttendanceFormFields form={form} selectedAgent={selectedAgent} directoryData={directoryData} />
        <Button type="submit" className="w-full">
          {editingEntry ? "Update Entry" : "Add Entry"}
        </Button>
      </form>
    </Form>
  );
}