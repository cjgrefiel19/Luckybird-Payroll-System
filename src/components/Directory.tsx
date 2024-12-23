import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface DirectoryEntry {
  name: string;
  position: string;
}

const directoryData: DirectoryEntry[] = [
  {
    name: "Chrisjie Grefiel",
    position: "Director, Account Operations",
  },
  {
    name: "Gilbert Condino",
    position: "Team Leader, Sourcing",
  },
  {
    name: "Mhel Malit",
    position: "Sr. Operation Specialist",
  },
  {
    name: "Cherrie Ferrer",
    position: "Team Leader, Operations",
  },
  {
    name: "Jobelle Fortuna",
    position: "Finance Specialist",
  },
];

export function Directory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DirectoryEntry;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: keyof DirectoryEntry) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedAndFilteredData = [...directoryData]
    .filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-center cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Agent Name
                {sortConfig?.key === "name" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="text-center cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("position")}
              >
                Position
                {sortConfig?.key === "position" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredData.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="text-center font-medium">
                  {entry.name}
                </TableCell>
                <TableCell className="text-center">{entry.position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}