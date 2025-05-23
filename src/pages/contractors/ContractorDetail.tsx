
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, File, FolderClosed, FolderOpen, FolderKanban, FileText } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const ContractorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getContractorById, 
    deleteContractor, 
    getProjectsByContractorId,
    getClaimsByContractorId
  } = useApp();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showContractorFiles, setShowContractorFiles] = useState(false);

  if (!id) {
    navigate("/contractors");
    return null;
  }
  
  const contractor = getContractorById(id);
  
  if (!contractor) {
    navigate("/contractors");
    return null;
  }

  const projects = getProjectsByContractorId(id);
  const claims = getClaimsByContractorId(id);

  const handleDelete = () => {
    deleteContractor(id);
    navigate("/contractors");
  };

  // Generate cascade message
  let cascadeMessage = "";
  if (claims.length > 0) {
    cascadeMessage = `This action will also delete ${claims.length} claim(s).`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate("/contractors")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contractor.name}</h1>
            <p className="text-gray-500">
              Created on {new Date(contractor.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={() => navigate(`/contractors/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <FolderClosed className="h-5 w-5 mr-2 text-green-600" />
              <CardTitle>Contractor Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Name</h3>
                <p>{contractor.name}</p>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center mb-2"
                  onClick={() => setShowContractorFiles(!showContractorFiles)}
                >
                  {showContractorFiles ? (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4 text-green-600" />
                      Hide Context Files
                    </>
                  ) : (
                    <>
                      <FolderClosed className="mr-2 h-4 w-4 text-green-600" />
                      Show Context Files ({contractor.contextFiles?.length})
                    </>
                  )}
                </Button>
                
                {showContractorFiles && (
                  <div className="border rounded-md p-4 space-y-2">
                    {contractor.contextFiles?.length === 0 ? (
                      <p className="text-gray-500">No context files attached</p>
                    ) : (
                      contractor.contextFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-2 border rounded bg-gray-50"
                        >
                          <File className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle>Projects</CardTitle>
                </div>
                <Badge variant="outline">{projects.length}</Badge>
              </div>
              <CardDescription>Projects associated with this contractor</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No projects associated</p>
                  <Button asChild size="sm">
                    <Link to="/projects/new">Add Project</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <Link 
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block p-2 border rounded hover:bg-gray-50"
                    >
                      {project.title}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-amber-600" />
                  <CardTitle>Claims</CardTitle>
                </div>
                <Badge variant="outline">{claims.length}</Badge>
              </div>
              <CardDescription>Claims associated with this contractor</CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No claims associated</p>
                  <Button asChild size="sm">
                    <Link to="/claims/new">Add Claim</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {claims.map((claim) => (
                    <Link 
                      key={claim.id}
                      to={`/claims/${claim.id}`}
                      className="block p-2 border rounded hover:bg-gray-50"
                    >
                      {claim.title}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Contractor"
        entityName={contractor.name}
        onConfirm={handleDelete}
        cascadeMessage={cascadeMessage}
      />
    </div>
  );
};

export default ContractorDetail;
