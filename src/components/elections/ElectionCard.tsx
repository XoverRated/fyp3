import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

interface ElectionCardProps {
  id: number;
  title: string;
  description: string;
  status: "Active" | "Upcoming" | "Completed";
}

export const ElectionCard = ({
  id,
  title,
  description,
  status,
}: ElectionCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="bg-vote-light pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-vote-blue">{title}</CardTitle>
          </div>
          <Badge className={getStatusColor()}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-grow flex flex-col">
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        <div className="mt-auto">
          <Link to={`/elections/${id}`}>
            <Button className="w-full bg-vote-blue hover:bg-vote-teal transition-colors">
              {status === "Active" ? (
                "Vote / View Results"
              ) : status === "Upcoming" ? (
                "View Details"
              ) : (
                "View Results"
              )}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
