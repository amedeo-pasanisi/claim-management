
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import ContextFileUploader from "@/components/ContextFileUploader";
import ContextFileSelector from "@/components/ContextFileSelector";
import SingleFileUploader from "@/components/SingleFileUploader";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { claimsApi, contractorsApi, projectsApi } from "@/lib/api";
import { ContractorRead, ProjectRead, ContextFileRead, ContractorWithProjectsClaimsContext, ProjectWithCountryContractorsClaimsContext } from "@/types/api";

const ClaimForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addClaim, updateClaim, refreshData } = useApp();
  const isEditing = !!id;

  // Form state
  const [title, setTitle] = useState("");
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  
  // Context files from selected entities
  const [contractorContextFiles, setContractorContextFiles] = useState<ContextFileRead[]>([]);
  const [projectContextFiles, setProjectContextFiles] = useState<ContextFileRead[]>([]);
  const [selectedContractorContextFiles, setSelectedContractorContextFiles] = useState<ContextFileRead[]>([]);
  const [selectedProjectContextFiles, setSelectedProjectContextFiles] = useState<ContextFileRead[]>([]);
  
  // Data loading
  const [contractors, setContractors] = useState<ContractorRead[]>([]);
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Validation errors
  const [titleError, setTitleError] = useState("");
  const [contractorError, setContractorError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [claimFileError, setClaimFileError] = useState("");

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [contractorsData, projectsData] = await Promise.all([
          contractorsApi.getAll(),
          projectsApi.getAll()
        ]);
        
        setContractors(contractorsData);
        setProjects(projectsData);

        // If editing, load claim data
        if (isEditing && id) {
          const claimData = await claimsApi.getById(id);
          setTitle(claimData.name);
          setSelectedContractorId(claimData.contractorId);
          setSelectedProjectId(claimData.projectId);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  // Load contractor context files when contractor is selected
  useEffect(() => {
    const loadContractorContextFiles = async () => {
      if (selectedContractorId) {
        try {
          const contractorWithContext = await contractorsApi.getById(selectedContractorId) as ContractorWithProjectsClaimsContext;
          setContractorContextFiles(contractorWithContext.contextFiles || []);
          setSelectedContractorContextFiles(contractorWithContext.contextFiles || []);
        } catch (err) {
          console.error('Failed to load contractor context files:', err);
          setContractorContextFiles([]);
          setSelectedContractorContextFiles([]);
        }
      } else {
        setContractorContextFiles([]);
        setSelectedContractorContextFiles([]);
      }
    };

    loadContractorContextFiles();
  }, [selectedContractorId]);

  // Load project context files when project is selected
  useEffect(() => {
    const loadProjectContextFiles = async () => {
      if (selectedProjectId) {
        try {
          const projectWithContext = await projectsApi.getById(selectedProjectId) as ProjectWithCountryContractorsClaimsContext;
          setProjectContextFiles(projectWithContext.contextFiles || []);
          setSelectedProjectContextFiles(projectWithContext.contextFiles || []);
        } catch (err) {
          console.error('Failed to load project context files:', err);
          setProjectContextFiles([]);
          setSelectedProjectContextFiles([]);
        }
      } else {
        setProjectContextFiles([]);
        setSelectedProjectContextFiles([]);
      }
    };

    loadProjectContextFiles();
  }, [selectedProjectId]);

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
    if (!claimFile && !isEditing) {
      setClaimFileError("A claim file must be uploaded");
      isValid = false;
    } else {
      setClaimFileError("");
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Combine all selected context files (uploaded + selected from entities)
      const allContextFiles = [
        ...contextFiles,
        // Convert ContextFileRead to File objects (this is a limitation - in real app you'd handle this differently)
      ];

      if (isEditing) {
        await updateClaim({
          id: id!,
          title,
          contractorId: selectedContractorId,
          projectId: selectedProjectId,
          claimFile: claimFile || undefined,
          contextFiles: allContextFiles,
          createdAt: new Date().toISOString(),
        });
      } else {
        await addClaim({
          title,
          contractorId: selectedContractorId,
          projectId: selectedProjectId,
          claimFile: claimFile!,
          contextFiles: allContextFiles,
        });
      }
      
      await refreshData();
      navigate("/claims");
    } catch (err) {
      console.error('Failed to save claim:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
              <div className="grid gap-2">
                <Label htmlFor="project">
                  Project <span className="text-red-500">*</span>
                </Label>
                {projects.length === 0 ? (
                  <div className="border rounded-md p-4">
                    <p className="text-gray-500">
                      No projects available. Please create a project first.
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
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {projectError && <p className="text-sm text-red-500">{projectError}</p>}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <SingleFileUploader
          title="Main Claim File"
          description={`Upload the primary claim document${isEditing ? ' (leave empty to keep existing file)' : ''}`}
          file={claimFile}
          setFile={(file) => {
            setClaimFile(file);
            if (file) setClaimFileError("");
          }}
          required={!isEditing}
        />
        {claimFileError && <p className="text-sm text-red-500 mt-2 mb-4">{claimFileError}</p>}

        {/* Context files from selected contractor */}
        <ContextFileSelector
          title="Contractor Context Files"
          description="Select context files from the chosen contractor to include with this claim"
          contextFiles={contractorContextFiles}
          selectedFiles={selectedContractorContextFiles}
          onSelectionChange={setSelectedContractorContextFiles}
        />

        {/* Context files from selected project */}
        <ContextFileSelector
          title="Project Context Files"
          description="Select context files from the chosen project to include with this claim"
          contextFiles={projectContextFiles}
          selectedFiles={selectedProjectContextFiles}
          onSelectionChange={setSelectedProjectContextFiles}
        />
        
        <ContextFileUploader
          title="Additional Context Files"
          description="Upload any additional supporting documents for this claim (optional)"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />
        
        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/claims")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex items-center" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Saving...' : (isEditing ? "Update Claim" : "Create Claim")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClaimForm;
