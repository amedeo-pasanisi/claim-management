
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import ViewToggle from "@/components/ViewToggle";
import EntityTable from "@/components/EntityTable";
import EntityCard from "@/components/EntityCard";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const Countries = () => {
  const navigate = useNavigate();
  const { countries, deleteCountry } = useApp();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [countryToDelete, setCountrtToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const countryToDeleteObj = countryToDelete ? countries.find(c => c.id === countryToDelete) : null;

  const columns = [
    { key: "flag", header: "Flag" },
    { key: "name", header: "Country" },
    { key: "code", header: "Code" },
    { key: "contextFiles", header: "Context Files" },
    { key: "createdAt", header: "Created" },
  ];

  const handleDeleteClick = (id: string) => {
    setCountrtToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const formatCountryData = (country: any) => ({
    ...country,
    flag: country.flag,
    contextFiles: `${country.contextFiles?.length || 0} files`,
    createdAt: new Date(country.createdAt).toLocaleDateString(),
  });

  const confirmDelete = () => {
    if (countryToDelete) {
      deleteCountry(countryToDelete);
      setCountrtToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

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
          <ViewToggle view={viewMode} setView={setViewMode} />
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
              columns={columns}
              data={countries.map(formatCountryData)}
              entityType="country"
              onView={(id) => navigate(`/countries/${id}`)}
              onEdit={(id) => navigate(`/countries/${id}/edit`)}
              onDelete={handleDeleteClick}
            />
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {countries.map((country) => (
                  <EntityCard
                    key={country.id}
                    id={country.id}
                    title={country.name}
                    type="country"
                    metadata={[
                      `Created: ${new Date(country.createdAt).toLocaleDateString()}`,
                      // `Contractor: ${contractor?.name || "Unknown"}`,
                      // `Project: ${project?.title || "Unknown"}`,
                      `Context Files: ${country.contextFiles.length}`,
                    ]}
                    onView={(id) => navigate(`/countries/${id}`)}
                    onEdit={(id) => navigate(`/countries/${id}/edit`)}
                    onDelete={handleDeleteClick}
                    // entity={formatCountryData(country)}
                    // subtitle={`${country.code} • ${country.contextFiles?.length || 0} files`}
                    // icon={country.flag}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Country"
        entityName={countryToDeleteObj?.name || ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Countries;
