
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ViewToggle from "@/components/ViewToggle";
import EntityCard from "@/components/EntityCard";
import EntityTable from "@/components/EntityTable";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const Contractors = () => {
  const navigate = useNavigate();
  const { contractors, deleteContractor, getProjectsByContractorId, getClaimsByContractorId } = useApp();
  const [view, setView] = useState<"card" | "table">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setContractorToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractorToDelete) {
      deleteContractor(contractorToDelete);
      setContractorToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const contractorToDeleteObj = contractorToDelete ? contractors.find(c => c.id === contractorToDelete) : null;
  const associatedClaims = contractorToDelete ? getClaimsByContractorId(contractorToDelete) : [];

  // Generate cascade message
  let cascadeMessage = "";
  if (associatedClaims.length > 0) {
    cascadeMessage = `This action will also delete ${associatedClaims.length} claim(s).`;
  }

  const tableColumns = [
    { key: "name", header: "Contractor Name" },
    { key: "createdAt", header: "Created" },
    { key: "projects", header: "Projects" },
    { key: "claims", header: "Claims" },
  ];

  const tableData = contractors.map(contractor => {
    const projects = getProjectsByContractorId(contractor.id);
    const claims = getClaimsByContractorId(contractor.id);
    
    return {
      id: contractor.id,
      name: contractor.name,
      createdAt: new Date(contractor.createdAt).toLocaleDateString(),
      projects: projects.length.toString(),
      claims: claims.length.toString(),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Contractors</h1>
        <Button asChild>
          <Link to="/contractors/new" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" /> New Contractor
          </Link>
        </Button>
      </div>

      <div className="flex justify-end">
        <ViewToggle view={view} setView={setView} />
      </div>

      {view === "card" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contractors.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-60 border rounded-lg bg-gray-50">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">No contractors yet</h3>
                <p className="text-gray-500 mb-4">Create your first contractor to get started</p>
                <Button asChild>
                  <Link to="/contractors/new">Create Contractor</Link>
                </Button>
              </div>
            </div>
          ) : (
            contractors.map((contractor) => {
              const projects = getProjectsByContractorId(contractor.id);
              const claims = getClaimsByContractorId(contractor.id);
              return (
                <EntityCard
                  key={contractor.id}
                  id={contractor.id}
                  title={contractor.name}
                  type="contractor"
                  metadata={[
                    `Created: ${new Date(contractor.createdAt).toLocaleDateString()}`,
                    `Projects: ${projects.length}`,
                    `Claims: ${claims.length}`,
                    `Context Files: ${contractor.contextFiles.length}`,
                  ]}
                  onView={(id) => navigate(`/contractors/${id}`)}
                  onEdit={(id) => navigate(`/contractors/${id}/edit`)}
                  onDelete={handleDeleteClick}
                />
              );
            })
          )}
        </div>
      ) : (
        <EntityTable
          columns={tableColumns}
          data={tableData}
          entityType="contractor"
          onView={(id) => navigate(`/contractors/${id}`)}
          onEdit={(id) => navigate(`/contractors/${id}/edit`)}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Contractor"
        entityName={contractorToDeleteObj?.name || ""}
        onConfirm={confirmDelete}
        cascadeMessage={cascadeMessage}
      />
    </div>
  );
};

export default Contractors;
