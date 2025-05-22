
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ViewToggle from "@/components/ViewToggle";
import EntityCard from "@/components/EntityCard";
import EntityTable from "@/components/EntityTable";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const Claims = () => {
  const navigate = useNavigate();
  const { claims, deleteClaim, getContractorById, getProjectById } = useApp();
  const [view, setView] = useState<"card" | "table">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setClaimToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (claimToDelete) {
      deleteClaim(claimToDelete);
      setClaimToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const claimToDeleteObj = claimToDelete ? claims.find(c => c.id === claimToDelete) : null;

  const tableColumns = [
    { key: "title", header: "Claim Title" },
    { key: "createdAt", header: "Created" },
    { key: "contractor", header: "Contractor" },
    { key: "project", header: "Project" },
  ];

  const tableData = claims.map(claim => {
    const contractor = getContractorById(claim.contractorId);
    const project = getProjectById(claim.projectId);
    
    return {
      id: claim.id,
      title: claim.title,
      createdAt: new Date(claim.createdAt).toLocaleDateString(),
      contractor: contractor?.name || "Unknown",
      project: project?.title || "Unknown",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Claims</h1>
        <Button asChild>
          <Link to="/claims/new" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" /> New Claim
          </Link>
        </Button>
      </div>

      <div className="flex justify-end">
        <ViewToggle view={view} setView={setView} />
      </div>

      {view === "card" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {claims.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-60 border rounded-lg bg-gray-50">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">No claims yet</h3>
                <p className="text-gray-500 mb-4">Create your first claim to get started</p>
                <Button asChild>
                  <Link to="/claims/new">Create Claim</Link>
                </Button>
              </div>
            </div>
          ) : (
            claims.map((claim) => {
              const contractor = getContractorById(claim.contractorId);
              const project = getProjectById(claim.projectId);
              return (
                <EntityCard
                  key={claim.id}
                  id={claim.id}
                  title={claim.title}
                  type="claim"
                  metadata={[
                    `Created: ${new Date(claim.createdAt).toLocaleDateString()}`,
                    `Contractor: ${contractor?.name || "Unknown"}`,
                    `Project: ${project?.title || "Unknown"}`,
                    `Context Files: ${claim.contextFiles.length}`,
                  ]}
                  onView={(id) => navigate(`/claims/${id}`)}
                  onEdit={(id) => navigate(`/claims/${id}/edit`)}
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
          entityType="claim"
          onView={(id) => navigate(`/claims/${id}`)}
          onEdit={(id) => navigate(`/claims/${id}/edit`)}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Claim"
        entityName={claimToDeleteObj?.title || ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Claims;
