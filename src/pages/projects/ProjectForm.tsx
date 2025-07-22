
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import ContextFileUploader from "@/components/ContextFileUploader";
import LoadingSpinner from "@/components/LoadingSpinner";
import FlagImage from "@/components/FlagImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { projects, countries, addProject, updateProject, loading } = useApp();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form validation errors
  const [titleError, setTitleError] = useState("");
  const [countryError, setCountryError] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setTitle(project.title);
        setSelectedCountryId(project.countryId);
        // Note: contextFiles can't be populated from existing data
      }
    }
  }, [id, isEditing, projects]);

  const validateForm = () => {
    let isValid = true;
    if (!title.trim()) {
      setTitleError("Project title is required");
      isValid = false;
    } else {
      setTitleError("");
    }
    if (!selectedCountryId) {
      setCountryError("A country must be selected");
      isValid = false;
    } else {
      setCountryError("");
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
      if (isEditing) {
        await updateProject({
          id: id!,
          title,
          countryId: selectedCountryId,
          contextFiles,
          createdAt: new Date().toISOString(), // This will be ignored by the API
        });
      } else {
        await addProject({
          title,
          countryId: selectedCountryId,
          contextFiles,
        });
      }
      navigate("/projects");
    } catch (err) {
      console.error('Failed to save project:', err);
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
                {countries.length === 0 ? (
                  <div className="border rounded-md p-4">
                    <p className="text-gray-500">No countries available. Please create a country first.</p>
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={() => navigate("/countries/new")}
                    >
                      Create Country
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedCountryId}
                      onValueChange={(value) => {
                        setSelectedCountryId(value);
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
                                src={country.flag || ''} 
                                alt={`${country.name} flag`}
                                className="w-5 h-5 rounded-sm object-cover"
                                fallbackText={country.name.substring(0, 2).toUpperCase()}
                              />
                              {country.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {countryError && <p className="text-sm text-red-500">{countryError}</p>}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <ContextFileUploader
          title="Context Files"
          description="Upload any additional documents related to this project (optional)"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />

        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/projects")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex items-center" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Saving...' : (isEditing ? "Update Project" : "Create Project")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
