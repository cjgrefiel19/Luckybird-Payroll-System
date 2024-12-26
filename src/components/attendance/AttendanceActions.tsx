import { AttendanceEntry } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import html2pdf from "html2pdf.js";

export function useAttendanceActions() {
  const { toast } = useToast();

  const handleSavePayPeriod = (name: string, startDate: Date | undefined, endDate: Date | undefined, setPayPeriods: (fn: (prev: any[]) => any[]) => void) => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
      });
      return;
    }

    const newPayPeriod = {
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
    };

    setPayPeriods((prev) => [...prev, newPayPeriod]);
    toast({
      title: "Success",
      description: "Pay period saved successfully",
    });
  };

  const handleDeletePayPeriod = (
    id: string,
    setPayPeriods: (fn: (prev: any[]) => any[]) => void,
    selectedPayPeriod: string | null,
    setSelectedPayPeriod: (value: string | null) => void,
    setStartDate: (date: Date | undefined) => void,
    setEndDate: (date: Date | undefined) => void
  ) => {
    setPayPeriods((prev) => prev.filter((period) => period.id !== id));
    if (selectedPayPeriod === id) {
      setSelectedPayPeriod(null);
      setStartDate(undefined);
      setEndDate(undefined);
    }
    toast({
      title: "Success",
      description: "Pay period deleted successfully",
    });
  };

  const handleExport = () => {
    const element = document.getElementById('attendance-content');
    if (!element) return;

    const opt = {
      margin: [0.5, 0.5],
      filename: 'attendance-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'landscape',
      }
    };

    html2pdf().set(opt).from(element).save();
    
    toast({
      title: "Success",
      description: "Attendance report exported successfully",
    });
  };

  return {
    handleSavePayPeriod,
    handleDeletePayPeriod,
    handleExport,
  };
}