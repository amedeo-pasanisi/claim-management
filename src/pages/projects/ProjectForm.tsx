
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import ContextFileUploader from "@/components/ContextFileUploader";
import FlagImage from "@/components/FlagImage";

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProject, updateProject, getProjectById, countries } = useApp();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [countryId, setCountryId] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [titleError, setTitleError] = useState("");
  const [countryError, setCountryError] = useState("");

  // Load project data when editing
  useEffect(() => {
    if (isEditing) {
      const project = getProjectById(id);
      if (project) {
        setTitle(project.title);
        setCountryId(project.countryId);
        setContextFiles(project.contextFiles);
      } else {
        navigate("/projects", { replace: true });
      }
    }
  }, [id, isEditing, getProjectById, navigate]);

  const validateForm = () => {
    let isValid = true;
    if (!title.trim()) {
      setTitleError("Project title is required");
      isValid = false;
    } else {
      setTitleError("");
    }
    
    if (!countryId) {
      setCountryError("Country selection is required");
      isValid = false;
    } else {
      setCountryError("");
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const projectData = {
      title,
      countryId,
      contextFiles,
    };
    if (isEditing && id) {
      const existingProject = getProjectById(id);
      if (existingProject) {
        updateProject({
          ...existingProject,
          ...projectData,
        });
      }
    } else {
      addProject(projectData);
    }
    navigate("/projects");
  };

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
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Project" : "New Project"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError("");
                  }}
                  placeholder="Enter project title"
                  className={titleError ? "border-red-500" : ""}
                />
                {titleError && <p className="text-sm text-red-500">{titleError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={countryId} 
                  onValueChange={(value) => {
                    setCountryId(value);
                    if (value) setCountryError("");
                  }}
                >
                  <SelectTrigger className={countryError ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <div className="flex items-center gap-2">
                          <FlagImage 
                            src={country.flag}
                            alt={`${country.name} flag`}
                            className="w-4 h-3 object-cover rounded-sm"
                            fallbackText={country.code}
                          />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {countryError && <p className="text-sm text-red-500">{countryError}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <ContextFileUploader
          title="Project Context Files"
          description="Upload files that provide context for this project"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />

        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
