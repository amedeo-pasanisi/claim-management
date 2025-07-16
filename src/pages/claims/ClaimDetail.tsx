
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, File, FolderClosed, FolderOpen, Users, FolderKanban, FileText } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { claimsApi } from "@/lib/api";
import { ClaimWithProjectContractorContextFiles } from "@/types/api";

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteClaim } = useApp();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showClaimFiles, setShowClaimFiles] = useState(false);
  const [showContractorFiles, setShowContractorFiles] = useState(false);
  const [showProjectFiles, setShowProjectFiles] = useState(false);
  const [claim, setClaim] = useState<ClaimWithProjectContractorContextFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) {
        navigate("/claims");
        return;
      }

      try {
        setLoading(true);
        const claimData = await claimsApi.getById(id);
        setClaim(claimData);
      } catch (err) {
        console.error('Failed to fetch claim:', err);
        setError('Failed to load claim details');
        navigate("/claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id, navigate]);

  if (!id) {
    navigate("/claims");
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error || 'Claim not found'}</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteClaim(id);
    navigate("/claims");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate("/claims")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{claim.name}</h1>
            <p className="text-gray-500">
              Created on {new Date(claim.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={() => navigate(`/claims/${id}/edit`)}
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
              <FolderClosed className="h-5 w-5 mr-2 text-amber-600" />
              <CardTitle>Claim Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Title</h3>
                <p>{claim.name}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Project</h3>
                <Link 
                  to={`/projects/${claim.project.id}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {claim.project.name}
                </Link>
              </div>

              <div>
                <h3 className="font-medium mb-1">Contractor</h3>
                <Link 
                  to={`/contractors/${claim.contractor.id}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {claim.contractor.name}
                </Link>
              </div>

              <div>
                <h3 className="font-medium mb-1">Main Claim File</h3>
                <div className="border rounded-md p-4">
                  <div className="flex items-center p-2 border rounded bg-gray-50">
                    <FileText className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">
                      {claim.claimFile.path.split('/').pop() || claim.claimFile.path}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Uploaded {new Date(claim.claimFile.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center mb-2"
                  onClick={() => setShowClaimFiles(!showClaimFiles)}
                >
                  {showClaimFiles ? (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4 text-amber-600" />
                      Hide Claim Context Files
                    </>
                  ) : (
                    <>
                      <FolderClosed className="mr-2 h-4 w-4 text-amber-600" />
                      Show Claim Context Files ({claim.contextFiles.length})
                    </>
                  )}
                </Button>
                
                {showClaimFiles && (
                  <div className="border rounded-md p-4 space-y-2">
                    {claim.contextFiles.length === 0 ? (
                      <p className="text-gray-500">No context files attached</p>
                    ) : (
                      claim.contextFiles.map((file) => {
                        const fileName = file.path.split('/').pop() || file.path;
                        return (
                          <div 
                            key={file.id} 
                            className="flex items-center p-2 border rounded bg-gray-50"
                          >
                            <File className="h-4 w-4 text-amber-600 mr-2" />
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
              <div className="flex items-center">
                <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                <CardTitle>Associated Project</CardTitle>
              </div>
              <CardDescription>Project this claim belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                to={`/projects/${claim.project.id}`}
                className="block p-2 border rounded hover:bg-gray-50 mb-2"
              >
                {claim.project.name}
              </Link>
              
              {/* Project context files */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center w-full"
                onClick={() => setShowProjectFiles(!showProjectFiles)}
              >
                {showProjectFiles ? (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4 text-blue-600" />
                    Hide Project Files
                  </>
                ) : (
                  <>
                    <FolderClosed className="mr-2 h-4 w-4 text-blue-600" />
                    Show Project Files
                  </>
                )}
              </Button>
              
              {showProjectFiles && (
                <div className="mt-2 border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                  {claim.project.contextFiles?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No project context files</p>
                  ) : (
                    claim.project.contextFiles?.map((file) => {
                      const fileName = file.path.split('/').pop() || file.path;
                      return (
                        <div key={file.id} className="flex items-center p-1 text-sm">
                          <File className="h-3 w-3 text-blue-600 mr-1" />
                          <span className="truncate">{fileName}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                <CardTitle>Associated Contractor</CardTitle>
              </div>
              <CardDescription>Contractor this claim belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                to={`/contractors/${claim.contractor.id}`}
                className="block p-2 border rounded hover:bg-gray-50 mb-2"
              >
                {claim.contractor.name}
              </Link>
              
              {/* Contractor context files */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center w-full"
                onClick={() => setShowContractorFiles(!showContractorFiles)}
              >
                {showContractorFiles ? (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4 text-green-600" />
                    Hide Contractor Files
                  </>
                ) : (
                  <>
                    <FolderClosed className="mr-2 h-4 w-4 text-green-600" />
                    Show Contractor Files
                  </>
                )}
              </Button>
              
              {showContractorFiles && (
                <div className="mt-2 border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                  {claim.contractor.contextFiles?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No contractor context files</p>
                  ) : (
                    claim.contractor.contextFiles?.map((file) => {
                      const fileName = file.path.split('/').pop() || file.path;
                      return (
                        <div key={file.id} className="flex items-center p-1 text-sm">
                          <File className="h-3 w-3 text-green-600 mr-1" />
                          <span className="truncate">{fileName}</span>
                        </div>
                      );
                    })
                  );
                }}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Claim"
        entityName={claim.name}
        onConfirm={handleDelete}
        cascadeMessage=""
      />
    </div>
  );
};

export default ClaimDetail;
