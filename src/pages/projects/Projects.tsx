
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ViewToggle from "@/components/ViewToggle";
import EntityCard from "@/components/EntityCard";
import EntityTable from "@/components/EntityTable";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, deleteProject, getContractorsByProjectId, getClaimsByProjectId } = useApp();
  const [view, setView] = useState<"card" | "table">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setProjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const projectToDeleteObj = projectToDelete ? projects.find(p => p.id === projectToDelete) : null;
  const associatedContractors = projectToDelete ? getContractorsByProjectId(projectToDelete) : [];
  const associatedClaims = projectToDelete ? getClaimsByProjectId(projectToDelete) : [];

  // Generate cascade message
  let cascadeMessage = "";
  if (projectToDeleteObj) {
    const messages = [];
    if (associatedClaims.length > 0) {
      messages.push(`${associatedClaims.length} claim(s)`);
    }
    if (associatedContractors.length > 0) {
      const singleProjectContractors = associatedContractors.filter(c => c.projectIds.length === 1);
      if (singleProjectContractors.length > 0) {
        messages.push(`${singleProjectContractors.length} contractor(s) with no other projects`);
      }
    }
    if (messages.length > 0) {
      cascadeMessage = `This action will also delete ${messages.join(" and ")}.`;
    }
  }

  const tableColumns = [
    { key: "title", header: "Project Title" },
    { key: "createdAt", header: "Created" },
    { key: "contractors", header: "Contractors" },
    { key: "claims", header: "Claims" },
  ];

  const tableData = projects.map(project => {
    const contractors = getContractorsByProjectId(project.id);
    const claims = getClaimsByProjectId(project.id);
    
    return {
      id: project.id,
      title: project.title,
      createdAt: new Date(project.createdAt).toLocaleDateString(),
      contractors: contractors.length.toString(),
      claims: claims.length.toString(),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button asChild>
          <Link to="/projects/new" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" /> New Project
          </Link>
        </Button>
      </div>

      <div className="flex justify-end">
        <ViewToggle view={view} setView={setView} />
      </div>

      {view === "card" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-60 border rounded-lg bg-gray-50">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-4">Create your first project to get started</p>
                <Button asChild>
                  <Link to="/projects/new">Create Project</Link>
                </Button>
              </div>
            </div>
          ) : (
            projects.map((project) => {
              const contractors = getContractorsByProjectId(project.id);
              const claims = getClaimsByProjectId(project.id);
              return (
                <EntityCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  type="project"
                  metadata={[
                    `Created: ${new Date(project.createdAt).toLocaleDateString()}`,
                    `Contractors: ${contractors.length}`,
                    `Claims: ${claims.length}`,
                    `Context Files: ${project.contextFiles.length}`,
                  ]}
                  onView={(id) => navigate(`/projects/${id}`)}
                  onEdit={(id) => navigate(`/projects/${id}/edit`)}
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
          entityType="project"
          onView={(id) => navigate(`/projects/${id}`)}
          onEdit={(id) => navigate(`/projects/${id}/edit`)}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Project"
        entityName={projectToDeleteObj?.title || ""}
        onConfirm={confirmDelete}
        cascadeMessage={cascadeMessage}
      />
    </div>
  );
};

export default Projects;
