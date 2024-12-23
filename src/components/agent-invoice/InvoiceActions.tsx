import { Button } from "../ui/button";
import { Check, FileText } from "lucide-react";

interface InvoiceActionsProps {
  onAccept: () => void;
  onDownload: () => void;
  accepted: boolean;
}

export function InvoiceActions({ onAccept, onDownload, accepted }: InvoiceActionsProps) {
  return (
    <div className="mt-6 flex gap-4 justify-end">
      <Button
        onClick={onAccept}
        disabled={accepted}
        className="gap-2"
      >
        <Check className="h-4 w-4" />
        {accepted ? "Accepted" : "Accept"}
      </Button>
      <Button
        onClick={onDownload}
        variant="outline"
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}