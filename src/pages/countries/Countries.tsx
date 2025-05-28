
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import ViewToggle from "@/components/ViewToggle";
import EntityTable from "@/components/EntityTable";
import EntityCard from "@/components/EntityCard";

const Countries = () => {
  const { countries } = useApp();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const columns = [
    { key: "flag", label: "Flag" },
    { key: "name", label: "Country" },
    { key: "code", label: "Code" },
    { key: "contextFiles", label: "Context Files" },
    { key: "createdAt", label: "Created" },
  ];

  const formatCountryData = (country: any) => ({
    ...country,
    flag: country.flag,
    contextFiles: `${country.contextFiles?.length || 0} files`,
    createdAt: new Date(country.createdAt).toLocaleDateString(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Countries</h1>
          <p className="text-gray-600 mt-2">
            Manage your countries and their associated context files
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Link to="/countries/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </Link>
        </div>
      </div>

      {countries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🌍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No countries yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first country entry.
          </p>
          <Link to="/countries/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Country
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {viewMode === "table" ? (
            <EntityTable
              data={countries.map(formatCountryData)}
              columns={columns}
              entityType="countries"
            />
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {countries.map((country) => (
                  <EntityCard
                    key={country.id}
                    entity={formatCountryData(country)}
                    entityType="countries"
                    title={country.name}
                    subtitle={`${country.code} • ${country.contextFiles?.length || 0} files`}
                    icon={country.flag}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Countries;
