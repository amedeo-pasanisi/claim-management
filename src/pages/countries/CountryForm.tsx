
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

const CountryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { countries, addCountry, updateCountry, loading } = useApp();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [flagUrl, setFlagUrl] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form validation errors
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      const country = countries.find((c) => c.id === id);
      if (country) {
        setName(country.name);
        setFlagUrl(country.flag || "");
        // Note: contextFiles can't be populated from existing data
      }
    }
  }, [id, isEditing, countries]);

  const validateForm = () => {
    let isValid = true;
    if (!name.trim()) {
      setNameError("Country name is required");
      isValid = false;
    } else {
      setNameError("");
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
        await updateCountry({
          id: id!,
          name,
          flag: flagUrl || null,
          contextFiles,
          createdAt: new Date().toISOString(), // This will be ignored by the API
        });
      } else {
        await addCountry({
          name,
          flag: flagUrl || null,
          contextFiles,
        });
      }
      navigate("/countries");
    } catch (err) {
      console.error('Failed to save country:', err);
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
            onClick={() => navigate("/countries")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Country" : "New Country"}
          </h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Country Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setNameError("");
                  }}
                  placeholder="Enter country name"
                  className={nameError ? "border-red-500" : ""}
                />
                {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="flagUrl">Flag URL (optional)</Label>
                <Input
                  id="flagUrl"
                  value={flagUrl}
                  onChange={(e) => setFlagUrl(e.target.value)}
                  placeholder="Enter flag image URL"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <ContextFileUploader
          title="Context Files"
          description="Upload any additional documents related to this country (optional)"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />

        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/countries")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex items-center" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Saving...' : (isEditing ? "Update Country" : "Create Country")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CountryForm;
