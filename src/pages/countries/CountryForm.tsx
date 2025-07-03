import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { Country } from "@/types";
import { countries, CountryData } from "@/data/countries";
import ContextFileUploader from "@/components/ContextFileUploader";
import FlagImage from "@/components/FlagImage";

type CountryFormData = {
  selectedCountry: string;
};

const CountryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { addCountry, updateCountry, getCountryById } = useApp();
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [selectedCountryData, setSelectedCountryData] = useState<CountryData | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm<CountryFormData>();
  const selectedCountry = watch("selectedCountry");

  useEffect(() => {
    if (isEditing && id) {
      const country = getCountryById(id);
      if (country) {
        setValue("selectedCountry", country.code);
        setContextFiles(country.contextFiles || []);
        const countryData = countries.find(c => c.code === country.code);
        if (countryData) {
          setSelectedCountryData(countryData);
        }
      }
    }
  }, [id, isEditing, getCountryById, setValue]);

  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find(c => c.code === selectedCountry);
      setSelectedCountryData(countryData || null);
    }
  }, [selectedCountry]);

  const onSubmit = (data: CountryFormData) => {
    const countryData = countries.find(c => c.code === data.selectedCountry);
    if (!countryData) return;

    const countryPayload = {
      name: countryData.name,
      code: countryData.code,
      flag: countryData.flag,
      contextFiles,
    };

    if (isEditing && id) {
      const existingCountry = getCountryById(id);
      if (existingCountry) {
        updateCountry({
          ...existingCountry,
          ...countryPayload,
        });
      }
    } else {
      addCountry(countryPayload);
    }

    navigate("/countries");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/countries")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Country" : "Add New Country"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Update country information" : "Select a country and add context files"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Country Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Select Country *</Label>
              <Select
                onValueChange={(value) => setValue("selectedCountry", value)}
                value={selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a country..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <FlagImage 
                          src={country.flag}
                          alt={`${country.name} flag`}
                          className="w-6 h-4 object-cover rounded-sm"
                          fallbackText={country.code}
                        />
                        <span>{country.name}</span>
                        <span className="text-gray-500">({country.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCountryData && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <FlagImage 
                    src={selectedCountryData.flag}
                    alt={`${selectedCountryData.name} flag`}
                    className="w-8 h-6 object-cover rounded-sm"
                    fallbackText={selectedCountryData.code}
                  />
                  <div>
                    <div className="font-medium">{selectedCountryData.name}</div>
                    <div className="text-sm text-gray-600">{selectedCountryData.code}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ContextFileUploader
          title="Country Context Files"
          description="Upload files related to this country (optional)"
          contextFiles={contextFiles}
          setContextFiles={setContextFiles}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/countries")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!selectedCountry}
          >
            {isEditing ? "Update Country" : "Create Country"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CountryForm;
