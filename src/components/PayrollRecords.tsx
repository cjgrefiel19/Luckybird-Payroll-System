import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { PayrollRecord } from "@/lib/types";
import { Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function PayrollRecords() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedRecords = localStorage.getItem('payrollRecords');
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords).map((record: any) => ({
        ...record,
        payPeriod: {
          startDate: new Date(record.payPeriod.startDate),
          endDate: new Date(record.payPeriod.endDate),
        },
        createdAt: new Date(record.createdAt),
      }));
      setRecords(parsedRecords);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payrollRecords', JSON.stringify(records));
  }, [records]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "The payroll record has been deleted successfully.",
    });
  };

  const handleCommentChange = (id: string, comment: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, comments: comment } : record
      )
    );
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Pay Period</TableHead>
                <TableHead className="text-center">Generated Link</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Comments/Notes</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-center">
                    {format(record.payPeriod.startDate, "PP")} -{" "}
                    {format(record.payPeriod.endDate, "PP")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="link"
                      className="gap-2"
                      onClick={() => window.open(record.generatedLink, '_blank')}
                    >
                      View Invoice <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        record.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      value={record.comments}
                      onChange={(e) =>
                        handleCommentChange(record.id, e.target.value)
                      }
                      className="text-center"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}