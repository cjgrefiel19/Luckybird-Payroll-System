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
import { PayrollRecord } from "@/lib/types";
import { format } from "date-fns";
import { Trash2, ExternalLink, Download } from "lucide-react";

interface PayrollTableProps {
  records: PayrollRecord[];
  onDelete: (id: string) => void;
  onCommentChange: (id: string, comment: string) => void;
  onExport: (record: PayrollRecord) => void;
}

export function PayrollTable({ records, onDelete, onCommentChange, onExport }: PayrollTableProps) {
  return (
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
                onChange={(e) => onCommentChange(record.id, e.target.value)}
                className="text-center"
              />
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onExport(record)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(record.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}