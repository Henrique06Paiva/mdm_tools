import { useState, useEffect } from "react";
import { Download, History as HistoryIcon, ShieldCheck, RefreshCw, Info } from "lucide-react";
import { supabase } from "../../supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { api } from "../../api";

interface ReportItem {
  id: string;
  username: string;
  tool_type: string;
  corporation_id: string;
  filter_applied: any;
  total_items: number;
  file_url: string;
  created_at: string;
}

interface AuditItem {
  id: string;
  username: string;
  action_type: string;
  corporation_id: string;
  payload: any;
  status: string;
  device_info: any;
  created_at: string;
}

export default function History() {
  const [activeSubTab, setActiveSubTab] = useState<"reports" | "audit">("reports");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);

  const fetchReports = async () => {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!envUrl || envUrl.includes("placeholder")) {
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Erro ao buscar histórico de relatórios:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!envUrl || envUrl.includes("placeholder")) {
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setAudits(data || []);
    } catch (err) {
      console.error("Erro ao buscar logs de auditoria:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api.hasToken()) return;
    if (activeSubTab === "reports") {
      fetchReports();
    } else {
      fetchAudits();
    }
  }, [activeSubTab]);

  const handleRefresh = () => {
    if (activeSubTab === "reports") {
      fetchReports();
    } else {
      fetchAudits();
    }
  };

  const formatFilter = (filter: any) => {
    if (!filter) return "Nenhum";
    try {
      const parts: string[] = [];
      if (filter.searchSource) parts.push(`Fonte: ${filter.searchSource === "file" ? "Planilha" : "Filtros"}`);
      if (filter.companyId) parts.push(`Empresa: ${filter.companyId}`);
      if (filter.subsidiaryId) parts.push(`Filial: ${filter.subsidiaryId}`);
      if (filter.packages && Array.isArray(filter.packages)) {
        parts.push(`Pacotes: ${filter.packages.join(", ")}`);
      }
      return parts.join(" | ") || JSON.stringify(filter);
    } catch {
      return JSON.stringify(filter);
    }
  };

  const formatAction = (action: string) => {
    switch (action) {
      case "DELETER_START": return "Início de Deleção";
      case "DELETER_FINISH": return "Conclusão de Deleção";
      case "DELETER_STOP": return "Parada de Deleção";
      case "DELETER_PAUSE": return "Pausa de Deleção";
      case "DELETER_RESUME": return "Retomada de Deleção";
      case "FORCER_START": return "Início de Force Data";
      case "FORCER_FINISH": return "Conclusão de Force Data";
      case "FORCER_STOP": return "Parada de Force Data";
      case "FORCER_PAUSE": return "Pausa de Force Data";
      case "FORCER_RESUME": return "Retomada de Force Data";
      case "CHECKER_START": return "Início de Checker";
      case "CHECKER_FINISH": return "Conclusão de Checker";
      case "CHECKER_STOP": return "Parada de Checker";
      case "CHECKER_PAUSE": return "Pausa de Checker";
      case "CHECKER_RESUME": return "Retomada de Checker";
      case "FETCHER_START": return "Início de Fetcher";
      case "FETCHER_FINISH": return "Conclusão de Fetcher";
      case "FETCHER_STOP": return "Parada de Fetcher";
      case "FETCHER_PAUSE": return "Pausa de Fetcher";
      case "FETCHER_RESUME": return "Retomada de Fetcher";
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-border/40 gap-4 mb-4">
        <button
          onClick={() => setActiveSubTab("reports")}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeSubTab === "reports"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <HistoryIcon size={16} />
            Relatórios Gerados
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab("audit")}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeSubTab === "audit"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} />
            Auditoria de Ações
          </span>
        </button>
        <div className="ml-auto pb-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {activeSubTab === "reports" ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
            <CardTitle className="text-foreground">Histórico de Relatórios</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="w-full max-w-full overflow-x-auto rounded-md border border-border/40">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ferramenta</TableHead>
                    <TableHead>Corporação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="min-w-[200px]">Filtros Aplicados</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {new Date(report.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant={report.tool_type === "CHECKER" ? "default" : "secondary"}>
                          {report.tool_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{report.corporation_id}</TableCell>
                      <TableCell className="text-sm">{report.username}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={formatFilter(report.filter_applied)}>
                        {formatFilter(report.filter_applied)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{report.total_items}</TableCell>
                      <TableCell className="text-right">
                        <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="cursor-pointer">
                            <Download size={12} className="mr-1" />
                            Baixar
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum relatório persistido no histórico.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
            <CardTitle className="text-foreground">Auditoria de Ações Críticas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="w-full max-w-full overflow-x-auto rounded-md border border-border/40">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Corporação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {new Date(audit.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {formatAction(audit.action_type)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{audit.corporation_id}</TableCell>
                      <TableCell className="text-sm">{audit.username}</TableCell>
                      <TableCell>
                        <Badge variant={audit.status === "SUCCESS" ? "success" : "destructive"}>
                          {audit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPayload(selectedPayload === audit.id ? null : audit.id)}
                          className="cursor-pointer"
                        >
                          <Info size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {audits.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum registro de auditoria encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Payload Drawer/Detail block when clicked */}
            {selectedPayload && (
              <div className="mt-4 p-4 rounded-lg bg-muted/40 border border-border/40 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Metadados e Payload da Ação</h4>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPayload(null)}>Fechar</Button>
                </div>
                <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-60 p-3 bg-card rounded border border-border/20">
                  {JSON.stringify(audits.find(a => a.id === selectedPayload)?.payload, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
