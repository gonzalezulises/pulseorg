"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network,
  Users,
  MessageSquare,
  BarChart3,
  Download,
  Expand,
} from "lucide-react";

// Hooks
import {
  useFilteredGraphData,
  useClusterDetails,
  useClusterFilters,
  useNetworkMetrics,
  useClusterDetail,
} from "@/hooks/use-clustering";

// Components
import {
  NetworkGraph,
  ClusterPanel,
  ClusterDetailView,
  FilterPanel,
  NetworkMetricsCard,
} from "@/components/clustering";

import type { GraphNode } from "@/types/clustering";

export default function ClustersPage() {
  const [activeTab, setActiveTab] = useState("network");
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Data hooks
  const { graphData, filters, updateFilter, resetFilters, stats, isLoading, rawData } =
    useFilteredGraphData({
      minConnections: 2,
      showParticipantEdges: true,
      showThemeEdges: true,
    });

  const { data: clusters } = useClusterDetails();
  const { data: filterOptions } = useClusterFilters();
  const { data: metrics } = useNetworkMetrics();
  const selectedCluster = useClusterDetail(selectedClusterId);

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    if (node.type === "theme") {
      setSelectedClusterId(node.id);
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(node.id);
      setSelectedClusterId(null);
    }
  };

  // Handle cluster selection from panel
  const handleClusterSelect = (clusterId: string) => {
    setSelectedClusterId(clusterId === selectedClusterId ? null : clusterId);
    setSelectedNodeId(null);
  };

  // Handle node selection from metrics
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedClusterId(null);
  };

  // Export data
  const handleExport = () => {
    if (!rawData) return;

    const exportData = {
      exported_at: new Date().toISOString(),
      metrics: rawData.metrics,
      clusters: rawData.clusters,
      node_count: rawData.nodes.length,
      edge_count: rawData.edges.length,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clustering_analysis_export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header
        title="Analisis de Clusters y Redes"
        description="Visualizacion de comunidades basada en comentarios y preocupaciones compartidas"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Quick Stats */}
        {!isLoading && metrics && (
          <div className="grid gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{metrics.participant_count}</p>
                      <p className="text-xs text-muted-foreground">Participantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{metrics.theme_count}</p>
                      <p className="text-xs text-muted-foreground">Temas/Clusters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <Network className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {metrics.total_edges.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Conexiones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {rawData?.total_comments_processed || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Comentarios Analizados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="network" className="gap-1">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Red de Clusters</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analisis</span>
              </TabsTrigger>
              <TabsTrigger value="clusters" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Detalle Clusters</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Expand className="h-4 w-4 mr-1" />
                {isFullscreen ? "Salir" : "Pantalla Completa"}
              </Button>
            </div>
          </div>

          {/* Network Tab */}
          <TabsContent value="network" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  <Skeleton className="h-[600px]" />
                </div>
                <Skeleton className="h-[600px]" />
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  isFullscreen ? "" : "lg:grid-cols-4"
                }`}
              >
                {/* Main Graph */}
                <div className={isFullscreen ? "" : "lg:col-span-3"}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Grafo de Red Social
                      </CardTitle>
                      {stats.isFiltered && (
                        <p className="text-sm text-muted-foreground">
                          Mostrando {stats.participantCount} de{" "}
                          {metrics?.participant_count} participantes
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      <NetworkGraph
                        data={graphData}
                        onNodeClick={handleNodeClick}
                        selectedNodeId={selectedNodeId || selectedClusterId}
                        height={isFullscreen ? 800 : 600}
                        showLabels={true}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                {!isFullscreen && filterOptions && (
                  <div className="space-y-4">
                    <FilterPanel
                      filters={filters}
                      filterOptions={filterOptions}
                      onFilterChange={updateFilter}
                      onReset={resetFilters}
                      stats={stats}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Selected Cluster Detail */}
            <AnimatePresence>
              {selectedCluster && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6"
                >
                  <ClusterDetailView
                    cluster={selectedCluster}
                    onClose={() => setSelectedClusterId(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
              </div>
            ) : metrics ? (
              <NetworkMetricsCard
                metrics={metrics}
                onNodeSelect={handleNodeSelect}
              />
            ) : null}
          </TabsContent>

          {/* Clusters Detail Tab */}
          <TabsContent value="clusters" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-[600px]" />
                <div className="lg:col-span-2">
                  <Skeleton className="h-[600px]" />
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Clusters List */}
                <ClusterPanel
                  clusters={clusters}
                  selectedClusterId={selectedClusterId}
                  onClusterSelect={handleClusterSelect}
                  maxParticipants={metrics?.participant_count}
                />

                {/* Cluster Detail */}
                <div className="lg:col-span-2">
                  {selectedCluster ? (
                    <ClusterDetailView
                      cluster={selectedCluster}
                      onClose={() => setSelectedClusterId(null)}
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg mb-2">
                          Selecciona un Cluster
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Haz clic en un cluster de la lista para ver sus
                          participantes, comentarios representativos y
                          recomendaciones.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
