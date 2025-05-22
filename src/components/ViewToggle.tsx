
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewToggleProps = {
  view: "card" | "table";
  setView: (view: "card" | "table") => void;
};

const ViewToggle = ({ view, setView }: ViewToggleProps) => {
  return (
    <div className="flex space-x-2 items-center">
      <span className="text-sm text-gray-500 mr-2">View:</span>
      <div className="bg-gray-100 rounded-md p-1 flex">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center rounded-md px-3 py-1.5 ${
            view === "table"
              ? "bg-white shadow-sm text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setView("table")}
        >
          <List className="w-4 h-4 mr-1" />
          <span className="text-sm">Table</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center rounded-md px-3 py-1.5 ${
            view === "card"
              ? "bg-white shadow-sm text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setView("card")}
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          <span className="text-sm">Card</span>
        </Button>
      </div>
    </div>
  );
};

export default ViewToggle;
