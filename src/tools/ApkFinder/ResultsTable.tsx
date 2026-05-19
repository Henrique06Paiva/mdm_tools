import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

interface Result {
  id: number;
  name: string;
  packageName: string;
  version: string;
  fileSize: number | string;
  link: string;
}

export function ResultsTable({ results }: { results: Result[] }) {
  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
        <CardTitle className="text-foreground">Resultados da Busca</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead>ID App</TableHead>
                <TableHead>Nome do App</TableHead>
                <TableHead>Package Name</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Link de Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{r.packageName}</TableCell>
                  <TableCell>
                    <Badge variant="success">{r.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={r.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-primary font-semibold hover:underline decoration-primary underline-offset-4"
                    >
                      🔗 Baixar APK
                    </a>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum resultado ainda. Preencha os dados e clique em Buscar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
