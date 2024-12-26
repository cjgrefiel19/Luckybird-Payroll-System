import { Tabs } from "@/components/ui/tabs";
import { useEffect } from "react";
import { migrateLocalStorageToSupabase } from "@/utils/migrateLocalStorage";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    const migrate = async () => {
      const success = await migrateLocalStorageToSupabase();
      if (success) {
        toast({
          title: "Migration Complete",
          description: "Your data has been successfully migrated to the cloud",
        });
      }
    };

    migrate();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 bg-background z-50 border-b">
        <div className="container mx-auto py-6">
          <DashboardHeader />
          
          <Tabs defaultValue="dashboard">
            <DashboardTabs />
            <DashboardContent />
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;