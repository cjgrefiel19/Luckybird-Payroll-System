import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import { TeamScheduleForm } from "../TeamScheduleForm";
import { Pencil, Trash2 } from "lucide-react";
import { TeamMember } from "@/lib/types";

interface TeamScheduleTableProps {
  members: TeamMember[];
  onEdit: (data: TeamMember, index: number) => void;
  onDelete: (index: number) => void;
}

export function TeamScheduleTable({ members, onEdit, onDelete }: TeamScheduleTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent Name</TableHead>
            <TableHead>Time In</TableHead>
            <TableHead>Time Out</TableHead>
            <TableHead>Workdays</TableHead>
            <TableHead>Rest Days</TableHead>
            <TableHead className="text-right">Monthly Rate</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member, index) => (
            <TableRow key={member.name + index}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.timeIn}</TableCell>
              <TableCell>{member.timeOut}</TableCell>
              <TableCell>{member.workdays}</TableCell>
              <TableCell>{member.restDays}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(member.monthlyRate)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(member.hourlyRate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <TeamScheduleForm
                    member={member}
                    onSubmit={(data) => onEdit(data, index)}
                    trigger={
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}