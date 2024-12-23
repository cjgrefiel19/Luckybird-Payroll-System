import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

interface SavePayPeriodProps {
  onSavePayPeriod: (name: string) => void;
}

export function SavePayPeriod({ onSavePayPeriod }: SavePayPeriodProps) {
  const [newPayPeriodName, setNewPayPeriodName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (newPayPeriodName.trim()) {
      onSavePayPeriod(newPayPeriodName.trim());
      setNewPayPeriodName("");
      setShowSaveInput(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showSaveInput ? (
        <>
          <Input
            placeholder="Enter pay period name"
            value={newPayPeriodName}
            onChange={(e) => setNewPayPeriodName(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave}>Save</Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowSaveInput(false);
              setNewPayPeriodName("");
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowSaveInput(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Save Period
        </Button>
      )}
    </div>
  );
}