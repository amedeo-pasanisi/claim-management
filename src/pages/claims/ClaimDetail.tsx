
import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  File, 
  FolderClosed, 
  FolderOpen, 
  Users,
  FolderKanban, 
  FileText,
  RefreshCw,
  Clipboard,
  Download
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getClaimById, 
    deleteClaim, 
    getProjectById,
    getContractorById
  } = useApp();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showClaimFiles, setShowClaimFiles] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  // References
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null);

  if (!id) {
    navigate("/claims");
    return null;
  }
  
  const claim = getClaimById(id);
  
  if (!claim) {
    navigate("/claims");
    return null;
  }

  const contractor = getContractorById(claim.contractorId);
  const project = getProjectById(claim.projectId);

  const handleDelete = () => {
    deleteClaim(id);
    navigate("/claims");
  };

  const handleGenerateResponse = () => {
    setIsGeneratingResponse(true);
    setShowResponse(false);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setResponseText(
        `Response to claim "${claim.title}"\n\nAfter careful review of the submitted claim and all relevant documentation, we have determined the following:\n\n1. The claim has been thoroughly assessed against the project specifications and contract terms.\n\n2. Based on our analysis of the timeline and deliverables, we acknowledge receipt of your claim dated ${new Date().toLocaleDateString()}.\n\n3. We propose the following resolution strategy to address the concerns raised in your submission...\n\nPlease contact us with any questions regarding this response.`
      );
      setIsGeneratingResponse(false);
      setShowResponse(true);
      
      toast({
        title: "Response Generated",
        description: "Claim response has been generated successfully.",
      });
    }, 2000);
  };

  const handleCopyResponse = () => {
    if (responseText) {
      navigator.clipboard.writeText(responseText);
      toast({
        title: "Copied to Clipboard",
        description: "Response text has been copied to clipboard.",
      });
    }
  };

  const handleDownloadResponse = () => {
    if (responseText) {
      // Create a Blob with the response text
      const blob = new Blob([responseText], { type: 'text/plain' });
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${claim.title}_Response.txt`; // In a real app, this would be a PDF
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast({
        title: "Download Started",
        description: `${claim.title}_Response.pdf is being downloaded.`,
      });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">{claim.title}</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              <CardTitle>Claim Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Title</h3>
                <p>{claim.title}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Contractor</h3>
                  <Link 
                    to={`/contractors/${claim.contractorId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contractor?.name || "Unknown Contractor"}
                  </Link>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Project</h3>
                  <Link 
                    to={`/projects/${claim.projectId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {project?.title || "Unknown Project"}
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Claim File</h3>
                <div 
                  className="flex items-center p-2 border rounded bg-gray-50"
                >
                  <File className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm">{claim.claimFile?.name}</span>
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
                      Hide Context Files
                    </>
                  ) : (
                    <>
                      <FolderClosed className="mr-2 h-4 w-4 text-amber-600" />
                      Show Context Files ({claim.contextFiles.length})
                    </>
                  )}
                </Button>
                
                {showClaimFiles && (
                  <div className="border rounded-md p-4 space-y-2">
                    {claim.contextFiles.length === 0 ? (
                      <p className="text-gray-500">No additional context files attached</p>
                    ) : (
                      claim.contextFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-2 border rounded bg-gray-50"
                        >
                          <File className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Project Context Included</h3>
                  <Badge variant={claim.includedProjectContext ? "default" : "outline"}>
                    {claim.includedProjectContext ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Contractor Context Included</h3>
                  <Badge variant={claim.includedContractorContext ? "default" : "outline"}>
                    {claim.includedContractorContext ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                <CardTitle>Project</CardTitle>
              </div>
              <CardDescription>
                Associated project details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium">
                  {project?.title || "Unknown Project"}
                </h3>
                <p className="text-sm text-gray-500">
                  {project ? `${project.contextFiles.length} context files` : "No data available"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link to={`/projects/${claim.projectId}`}>
                    View Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                <CardTitle>Contractor</CardTitle>
              </div>
              <CardDescription>
                Associated contractor details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium">
                  {contractor?.name || "Unknown Contractor"}
                </h3>
                <p className="text-sm text-gray-500">
                  {contractor ? `${contractor.contextFiles.length} context files` : "No data available"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link to={`/contractors/${claim.contractorId}`}>
                    View Contractor
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              <CardTitle>Generate Claim Response</CardTitle>
            </div>
            {!isGeneratingResponse && !showResponse && (
              <Button 
                onClick={handleGenerateResponse}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Response
              </Button>
            )}
          </div>
          <CardDescription>
            Generate an automated response based on the claim and associated context
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGeneratingResponse ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
              <p className="text-gray-500">Generating claim response...</p>
            </div>
          ) : showResponse ? (
            <div className="space-y-4">
              <Textarea 
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="h-60 font-mono text-sm"
                ref={responseTextareaRef}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  className="flex items-center"
                  onClick={handleCopyResponse}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  className="flex items-center"
                  onClick={handleDownloadResponse}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as .TXT
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <FileText className="h-16 w-16 mb-4" />
              <p className="mb-2">No response generated yet</p>
              <p className="text-sm mb-4">Click the "Generate Response" button to create a response to this claim</p>
              <Button 
                onClick={handleGenerateResponse}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Response
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Claim"
        entityName={claim.title}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClaimDetail;
