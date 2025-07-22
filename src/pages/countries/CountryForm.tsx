
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import ContextFileUploader from "@/components/ContextFileUploader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { countries as predefinedCountries } from "@/data/countries";

const CountryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { countries, addCountry, updateCountry, loading } = useApp();
  const isEditing = !!id;

  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form validation errors
  const [countryError, setCountryError] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      const country = countries.find((c) => c.id === id);
      if (country) {
        // Find the matching country from the predefined list by name
        const predefinedCountry = predefinedCountries.find((pc) => pc.name === country.name);
        if (predefinedCountry) {
          setSelectedCountryCode(predefinedCountry.code);
        }
        // Note: contextFiles can't be populated from existing data
      }
    }
  }, [id, isEditing, countries]);

  const validateForm = () => {
    let isValid = true;
    if (!selectedCountryCode) {
      setCountryError("Please select a country");
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
    
    const selectedCountry = predefinedCountries.find(c => c.code === selectedCountryCode);
    if (!selectedCountry) return;

    try {
      if (isEditing) {
        await updateCountry({
          id: id!,
          name: selectedCountry.name,
          flag: selectedCountry.flag,
          contextFiles,
          createdAt: new Date().toISOString(), // This will be ignored by the API
        });
      } else {
        await addCountry({
          name: selectedCountry.name,
          flag: selectedCountry.flag,
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
                <Label htmlFor="country">
                  Select Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCountryCode}
                  onValueChange={(value) => {
                    setSelectedCountryCode(value);
                    if (value) setCountryError("");
                  }}
                >
                  <SelectTrigger className={countryError ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <img 
                            src={country.flag} 
                            alt={`${country.name} flag`} 
                            className="w-5 h-4 object-cover rounded-sm"
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
