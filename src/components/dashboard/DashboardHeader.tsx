import { Link } from "react-router-dom";

export function DashboardHeader() {
  return (
    <div className="flex items-start mb-8 gap-4">
      <div className="flex items-center gap-4">
        <img 
          src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png" 
          alt="LuckyBird Logo" 
          className="w-24 h-24 object-contain self-center"
        />
        <div className="text-left flex flex-col justify-center h-24">
          <h1 className="text-2xl font-bold text-primary">LuckyBird</h1>
          <address className="not-italic text-muted-foreground">
            732 N. Madelia St.<br />
            Spokane, WA 99202<br />
            +1 (509) 508-2229
          </address>
        </div>
      </div>
    </div>
  );
}