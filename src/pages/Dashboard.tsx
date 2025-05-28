
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, FolderKanban, Users, FileText, BarChart, Flag } from "lucide-react";
import { useApp } from "@/context/AppContext";

const Dashboard = () => {
  const { projects, contractors, claims, countries } = useApp();

  const cards = [
    {
      title: "Countries",
      description: "Manage countries for your projects",
      icon: <Flag className="h-8 w-8 text-purple-600" />,
      count: countries.length,
      route: "/countries",
      color: "border-purple-200 bg-purple-50",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Projects",
      description: "Manage your projects and their contexts",
      icon: <FolderKanban className="h-8 w-8 text-blue-600" />,
      count: projects.length,
      route: "/projects",
      color: "border-blue-200 bg-blue-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Contractors",
      description: "Manage contractors and their project associations",
      icon: <Users className="h-8 w-8 text-green-600" />,
      count: contractors.length,
      route: "/contractors",
      color: "border-green-200 bg-green-50",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Claims",
      description: "Track and respond to project claims",
      icon: <FileText className="h-8 w-8 text-amber-600" />,
      count: claims.length,
      route: "/claims",
      color: "border-amber-200 bg-amber-50",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => (
          <Card key={card.title} className={`border ${card.color}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                {card.icon}
                <div className="rounded-full h-8 w-8 flex items-center justify-center bg-white border border-gray-200 text-lg font-semibold">
                  {card.count}
                </div>
              </div>
              <CardTitle className="text-xl mt-2">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {card.count === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No {card.title.toLowerCase()} found. Create your first one!
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You have {card.count} {card.count === 1 ? card.title.slice(0, -1).toLowerCase() : card.title.toLowerCase()}.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link to={card.route}>View All</Link>
                </Button>
                <Button asChild variant="outline" className="gap-1">
                  <Link to={`${card.route}/new`}>
                    <PlusCircle className="h-4 w-4" />
                    <span>New</span>
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-gray-600" />
            <CardTitle>Activity Summary</CardTitle>
          </div>
          <CardDescription>Recent activity across your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {projects.length === 0 ? (
              <div className="text-center">
                <h3 className="font-medium text-lg mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-4">
                  Start by creating your first project to see activity here.
                </p>
                <Button asChild>
                  <Link to="/projects/new">Create Project</Link>
                </Button>
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center">
                <h3 className="font-medium text-lg mb-2">No claims yet</h3>
                <p className="text-gray-500 mb-4">
                  Create claims for your projects to see activity here.
                </p>
                <Button asChild>
                  <Link to="/claims/new">Create Claim</Link>
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded p-4 text-center">
                      <h3 className="text-2xl font-bold text-blue-600">{projects.length}</h3>
                      <p className="text-sm text-gray-600">Active Projects</p>
                    </div>
                    <div className="border rounded p-4 text-center">
                      <h3 className="text-2xl font-bold text-green-600">{contractors.length}</h3>
                      <p className="text-sm text-gray-600">Contractors</p>
                    </div>
                    <div className="border rounded p-4 text-center">
                      <h3 className="text-2xl font-bold text-amber-600">{claims.length}</h3>
                      <p className="text-sm text-gray-600">Total Claims</p>
                    </div>
                  </div>
                  <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Recent Claims</h3>
                    <div className="space-y-3">
                      {claims
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((claim) => {
                          const contractor = contractors.find((c) => c.id === claim.contractorId);
                          const project = projects.find((p) => p.id === claim.projectId);
                          
                          return (
                            <div key={claim.id} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <Link to={`/claims/${claim.id}`} className="font-medium hover:underline">
                                  {claim.title}
                                </Link>
                                <div className="text-xs text-gray-500">
                                  {contractor?.name} • {project?.title}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(claim.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
