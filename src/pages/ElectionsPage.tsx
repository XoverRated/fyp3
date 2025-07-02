import { MainLayout } from "@/components/layout/MainLayout";
import { ElectionCard } from "@/components/elections/ElectionCard";
import { SectionHeading } from "@/components/common/SectionHeading";
// Tabs components are no longer needed
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
// Label is not used
// import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

const ElectionsPage = () => {
  // Mock election data - now only activeElections
  const activeElections = [
    {
      id: 1,
      title: "COICT Ex-COM Election",
      description: "Vote for COICT Ex-COM representatives for the upcoming term.",
      status: "Active" as const,
    },
    {
      id: 2,
      title: "UDSM-COICT Foreign Ambassadors Election",
      description: "Special election for UDSM-COICT Foreign Ambassador positions.",
      status: "Active" as const,
    },
  ];

  // upcomingElections and completedElections are removed

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Active Elections"
          subtitle="View and participate in currently active elections."
        />

        {activeElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeElections.map((election) => (
              <ElectionCard
                key={election.id}
                id={election.id}
                title={election.title}
                description={election.description}
                status={election.status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No active elections at the moment.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ElectionsPage;

