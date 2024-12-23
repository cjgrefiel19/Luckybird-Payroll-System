import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEAM_MEMBERS } from "@/lib/constants";
import { formatCurrency } from "@/lib/calculations";

export function TeamSchedule() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Team Schedule</h2>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {TEAM_MEMBERS.map((member) => (
              <TableRow key={member.name}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}