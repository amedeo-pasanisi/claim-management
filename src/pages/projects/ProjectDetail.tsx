
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, File, FolderClosed, FolderOpen, Users, FileText } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { projectsApi } from "@/lib/api";
import { ProjectWithCountryContractorsClaimsContext } from "@/types/api";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteProject } = useApp();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showProjectFiles, setShowProjectFiles] = useState(false);
  const [project, setProject] = useState<ProjectWithCountryContractorsClaimsContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        navigate("/projects");
        return;
      }

      try {
        setLoading(true);
        const projectData = await projectsApi.getById(id);
        setProject(projectData);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Failed to load project details');
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (!id) {
    navigate("/projects");
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error || 'Project not found'}</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteProject(id);
    navigate("/projects");
  };

  // Generate cascade message
  let cascadeMessage = "";
  const messages = [];
  if (project.claims.length > 0) {
    messages.push(`${project.claims.length} claim(s)`);
  }
  if (project.contractors.length > 0) {
    // Note: We can't determine single-project contractors from this API response
    // so we'll show a generic message
    messages.push(`relationships with ${project.contractors.length} contractor(s)`);
  }
  if (messages.length > 0) {
    cascadeMessage = `This action will also delete ${messages.join(" and ")}.`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-gray-500">
              Created on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={() => navigate(`/projects/${id}/edit`)}
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
              <FolderClosed className="h-5 w-5 mr-2 text-blue-600" />
              <CardTitle>Project Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Title</h3>
                <p>{project.name}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Country</h3>
                <p>{project.country.name}</p>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center mb-2"
                  onClick={() => setShowProjectFiles(!showProjectFiles)}
                >
                  {showProjectFiles ? (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4 text-blue-600" />
                      Hide Context Files
                    </>
                  ) : (
                    <>
                      <FolderClosed className="mr-2 h-4 w-4 text-blue-600" />
                      Show Context Files ({project.contextFiles.length})
                    </>
                  )}
                </Button>
                
                {showProjectFiles && (
                  <div className="border rounded-md p-4 space-y-2">
                    {project.contextFiles.length === 0 ? (
                      <p className="text-gray-500">No context files attached</p>
                    ) : (
                      project.contextFiles.map((file, index) => {
                        const fileName = file.path.split('/').pop() || file.path;
                        return (
                          <div 
                            key={file.id} 
                            className="flex items-center p-2 border rounded bg-gray-50"
                          >
                            <File className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm">{fileName}</span>
                          </div>
                        );
                      })
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
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  <CardTitle>Contractors</CardTitle>
                </div>
                <Badge variant="outline">{project.contractors.length}</Badge>
              </div>
              <CardDescription>Contractors associated with this project</CardDescription>
            </CardHeader>
            <CardContent>
              {project.contractors.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No contractors associated</p>
                  <Button asChild size="sm">
                    <Link to="/contractors/new">Add Contractor</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {project.contractors.map((contractor) => (
                    <Link 
                      key={contractor.id}
                      to={`/contractors/${contractor.id}`}
                      className="block p-2 border rounded hover:bg-gray-50"
                    >
                      {contractor.name}
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
                <Badge variant="outline">{project.claims.length}</Badge>
              </div>
              <CardDescription>Claims associated with this project</CardDescription>
            </CardHeader>
            <CardContent>
              {project.claims.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No claims associated</p>
                  <Button asChild size="sm">
                    <Link to="/claims/new">Add Claim</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {project.claims.map((claim) => (
                    <Link 
                      key={claim.id}
                      to={`/claims/${claim.id}`}
                      className="block p-2 border rounded hover:bg-gray-50"
                    >
                      {claim.name}
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
        entityType="Project"
        entityName={project.name}
        onConfirm={handleDelete}
        cascadeMessage={cascadeMessage}
      />
    </div>
  );
};

export default ProjectDetail;
