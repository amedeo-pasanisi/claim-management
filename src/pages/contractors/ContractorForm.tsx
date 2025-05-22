
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

const ContractorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addContractor, updateContractor, getContractorById, projects } = useApp();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [nameError, setNameError] = useState("");
  const [projectError, setProjectError] = useState("");

  // Load contractor data when editing
  useEffect(() => {
    if (isEditing) {
      const contractor = getContractorById(id);
      if (contractor) {
        setName(contractor.name);
        setSelectedProjectIds(contractor.projectIds);
        setContextFiles(contractor.contextFiles);
      } else {
        navigate("/contractors", { replace: true });
      }
    }
  }, [id, isEditing, getContractorById, navigate]);

  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError("Contractor name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    if (selectedProjectIds.length === 0) {
      setProjectError("At least one project must be selected");
      isValid = false;
    } else {
      setProjectError("");
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const contractorData = {
      name,
      projectIds: selectedProjectIds,
      contextFiles,
    };

    if (isEditing && id) {
      const existingContractor = getContractorById(id);
      if (existingContractor) {
        updateContractor({
          ...existingContractor,
          ...contractorData,
        });
      }
    } else {
      addContractor(contractorData);
    }

    navigate("/contractors");
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      const isSelected = prev.includes(projectId);
      if (isSelected) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
    
    if (projectError && selectedProjectIds.length > 0) {
      setProjectError("");
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
            onClick={() => navigate("/contractors")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Contractor" : "New Contractor"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Contractor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setNameError("");
                  }}
                  placeholder="Enter contractor name"
                  className={nameError ? "border-red-500" : ""}
                />
                {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="projects">
                  Associated Projects <span className="text-red-500">*</span>
                </Label>
                {projects.length === 0 ? (
                  <div className="border rounded-md p-4">
                    <p className="text-gray-500">No projects available. Please create a project first.</p>
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={() => navigate("/projects/new")}
                    >
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`project-${project.id}`}
                            checked={selectedProjectIds.includes(project.id)}
                            onChange={() => handleProjectToggle(project.id)}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label 
                            htmlFor={`project-${project.id}`}
                            className="cursor-pointer"
                          >
                            {project.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {projectError && <p className="text-sm text-red-500">{projectError}</p>}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <ContextFileUploader
          title="Contractor Context Files"
          description="Upload files that provide context for this contractor"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />

        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/contractors")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update Contractor" : "Create Contractor"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContractorForm;
