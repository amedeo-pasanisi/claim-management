
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, File, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { countriesApi } from "@/lib/api";
import { CountryWithProjectsContext } from "@/types/api";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import FlagImage from "@/components/FlagImage";
import LoadingSpinner from "@/components/LoadingSpinner";

const CountryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteCountry, countries, projects } = useApp();
  const [countryToDelete, setCountryToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [countryDetails, setCountryDetails] = useState<CountryWithProjectsContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const countryToDeleteObj = countryToDelete ? countries.find(c => c.id === countryToDelete) : null;
  
  // Get projects related to this country from context
  const relatedProjects = projects.filter(project => project.countryId === id);

  useEffect(() => {
    const loadCountryDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await countriesApi.getById(id);
        setCountryDetails(data);
      } catch (err) {
        console.error('Failed to load country details:', err);
        setError('Failed to load country details');
      } finally {
        setLoading(false);
      }
    };

    loadCountryDetails();
  }, [id]);

  const confirmDelete = () => {
    if (countryToDelete) {
      deleteCountry(countryToDelete);
      setCountryToDelete(null);
      setIsDeleteDialogOpen(false);
      navigate("/countries")
    }
  };

  const handleDeleteClick = (id: string) => {
    setCountryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading country details...</span>
      </div>
    );
  }

  if (error || !countryDetails) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Country Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "The country you're looking for doesn't exist."}</p>
        <Link to="/countries">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Back to Countries
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/countries")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <FlagImage 
              src={countryDetails.flagUrl || ''}
              alt={`${countryDetails.name} flag`}
              className="w-12 h-8 object-cover rounded-md border"
              fallbackText={countryDetails.name.substring(0, 2).toUpperCase()}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{countryDetails.name}</h1>
              <p className="text-gray-600">Country Code: {countryDetails.name.substring(0, 2).toUpperCase()}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/countries/${countryDetails.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => handleDeleteClick(countryDetails.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Country Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Country Name</label>
                  <p className="text-lg font-semibold">{countryDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Country Code</label>
                  <p className="text-lg font-semibold">{countryDetails.name.substring(0, 2).toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Flag</label>
                  <FlagImage 
                    src={countryDetails.flagUrl || ''}
                    alt={`${countryDetails.name} flag`}
                    className="w-16 h-10 object-cover rounded-md border mt-1"
                    fallbackText={countryDetails.name.substring(0, 2).toUpperCase()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-lg">{new Date(countryDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle>Related Projects</CardTitle>
                </div>
                <Badge variant="outline">{countryDetails.projects.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {countryDetails.projects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No projects in this country yet</p>
                  <Button asChild size="sm">
                    <Link to="/projects/new">Create Project</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {countryDetails.projects.map((project) => (
                    <Link 
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <FolderKanban className="w-4 h-4 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Context Files</CardTitle>
            </CardHeader>
            <CardContent>
              {countryDetails.contextFiles && countryDetails.contextFiles.length > 0 ? (
                <div className="space-y-3">
                  {countryDetails.contextFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                    >
                      <File className="w-4 h-4 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.path.split('/').pop() || file.path}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No context files uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Country"
        entityName={countryToDeleteObj?.name || ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CountryDetail;
