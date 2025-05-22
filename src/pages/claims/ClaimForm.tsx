
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import ContextFileUploader from "@/components/ContextFileUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const ClaimForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    addClaim, 
    updateClaim, 
    getClaimById, 
    contractors, 
    getProjectsByContractorId, 
    getProjectById, 
    getContractorById 
  } = useApp();
  const isEditing = !!id;

  // Form state
  const [title, setTitle] = useState("");
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [includedProjectContext, setIncludedProjectContext] = useState(true);
  const [includedContractorContext, setIncludedContractorContext] = useState(true);
  
  // Available projects based on selected contractor
  const [availableProjects, setAvailableProjects] = useState<Array<{id: string; title: string}>>([]);
  
  // Validation errors
  const [titleError, setTitleError] = useState("");
  const [contractorError, setContractorError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [claimFileError, setClaimFileError] = useState("");

  // Load claim data when editing
  useEffect(() => {
    if (isEditing) {
      const claim = getClaimById(id);
      if (claim) {
        setTitle(claim.title);
        setSelectedContractorId(claim.contractorId);
        setSelectedProjectId(claim.projectId);
        if (claim.claimFile) {
          setClaimFile(claim.claimFile);
        }
        setContextFiles(claim.contextFiles);
        setIncludedProjectContext(claim.includedProjectContext);
        setIncludedContractorContext(claim.includedContractorContext);
      } else {
        navigate("/claims", { replace: true });
      }
    }
  }, [id, isEditing, getClaimById, navigate]);

  // Update available projects when contractor changes
  useEffect(() => {
    if (selectedContractorId) {
      const contractorProjects = getProjectsByContractorId(selectedContractorId);
      setAvailableProjects(contractorProjects.map(p => ({ id: p.id, title: p.title })));
      
      // Reset selected project if not in available projects
      if (selectedProjectId && !contractorProjects.some(p => p.id === selectedProjectId)) {
        setSelectedProjectId("");
      }
      
      // Auto-select project if there's only one
      if (contractorProjects.length === 1 && !selectedProjectId) {
        setSelectedProjectId(contractorProjects[0].id);
      }
    } else {
      setAvailableProjects([]);
      setSelectedProjectId("");
    }
  }, [selectedContractorId, getProjectsByContractorId, selectedProjectId]);

  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError("Claim title is required");
      isValid = false;
    } else {
      setTitleError("");
    }

    if (!selectedContractorId) {
      setContractorError("A contractor must be selected");
      isValid = false;
    } else {
      setContractorError("");
    }

    if (!selectedProjectId) {
      setProjectError("A project must be selected");
      isValid = false;
    } else {
      setProjectError("");
    }

    if (!claimFile) {
      setClaimFileError("A claim file must be uploaded");
      isValid = false;
    } else {
      setClaimFileError("");
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !claimFile) {
      return;
    }

    const claimData = {
      title,
      contractorId: selectedContractorId,
      projectId: selectedProjectId,
      claimFile,
      contextFiles,
      includedProjectContext,
      includedContractorContext,
    };

    if (isEditing && id) {
      const existingClaim = getClaimById(id);
      if (existingClaim) {
        updateClaim({
          ...existingClaim,
          ...claimData,
        });
      }
    } else {
      addClaim(claimData);
    }

    navigate("/claims");
  };

  const handleClaimFileChange = (files: File[]) => {
    if (files.length > 0) {
      setClaimFile(files[0]);
      setClaimFileError("");
    } else {
      setClaimFile(null);
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
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Claim" : "New Claim"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Claim Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError("");
                  }}
                  placeholder="Enter claim title"
                  className={titleError ? "border-red-500" : ""}
                />
                {titleError && <p className="text-sm text-red-500">{titleError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contractor">
                  Contractor <span className="text-red-500">*</span>
                </Label>
                {contractors.length === 0 ? (
                  <div className="border rounded-md p-4">
                    <p className="text-gray-500">No contractors available. Please create a contractor first.</p>
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={() => navigate("/contractors/new")}
                    >
                      Create Contractor
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedContractorId}
                      onValueChange={(value) => {
                        setSelectedContractorId(value);
                        if (value) setContractorError("");
                      }}
                    >
                      <SelectTrigger className={contractorError ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractors.map((contractor) => (
                          <SelectItem key={contractor.id} value={contractor.id}>
                            {contractor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {contractorError && <p className="text-sm text-red-500">{contractorError}</p>}
                  </>
                )}
              </div>

              {selectedContractorId && (
                <div className="grid gap-2">
                  <Label htmlFor="project">
                    Project <span className="text-red-500">*</span>
                  </Label>
                  {availableProjects.length === 0 ? (
                    <div className="border rounded-md p-4">
                      <p className="text-gray-500">
                        No projects available for this contractor. Please add projects to this contractor first.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Select
                        value={selectedProjectId}
                        onValueChange={(value) => {
                          setSelectedProjectId(value);
                          if (value) setProjectError("");
                        }}
                      >
                        <SelectTrigger className={projectError ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {projectError && <p className="text-sm text-red-500">{projectError}</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ContextFileUploader
          title="Main Claim File"
          description="Upload the primary claim document"
          contextFiles={claimFile ? [claimFile] : []}
          setContextFiles={(files) => handleClaimFileChange(files)}
        />
        {claimFileError && <p className="text-sm text-red-500 mt-2 mb-4">{claimFileError}</p>}

        {selectedProjectId && selectedContractorId && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Include Related Contexts</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="projectContext" className="text-base font-normal">
                      {`Include Project Context (${getProjectById(selectedProjectId)?.title || ""})`}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {getProjectById(selectedProjectId)?.contextFiles.length || 0} file(s) available
                    </p>
                  </div>
                  <Switch
                    id="projectContext"
                    checked={includedProjectContext}
                    onCheckedChange={setIncludedProjectContext}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contractorContext" className="text-base font-normal">
                      {`Include Contractor Context (${getContractorById(selectedContractorId)?.name || ""})`}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {getContractorById(selectedContractorId)?.contextFiles.length || 0} file(s) available
                    </p>
                  </div>
                  <Switch
                    id="contractorContext"
                    checked={includedContractorContext}
                    onCheckedChange={setIncludedContractorContext}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <ContextFileUploader
          title="Additional Claim Context Files"
          description="Upload any additional supporting documents for this claim (optional)"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />

        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/claims")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update Claim" : "Create Claim"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClaimForm;
