import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import type { Log } from "./useForcer";

export function LogPanel({ logs }: { logs: Log[] }) {
  const getColorClass = (type: string) => {
    if (type === "err") return "text-destructive";
    if (type === "ok") return "text-green-600 dark:text-green-500";
    if (type === "warn") return "text-amber-600 dark:text-amber-500";
    return "text-muted-foreground";
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
        <CardTitle className="text-foreground">
          Log de Eventos do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[200px] overflow-y-auto bg-muted/5 p-4 font-mono text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`mb-1.5 pb-1.5 border-b border-border/40 last:border-0 last:mb-0 last:pb-0 ${getColorClass(log.type)}`}
            >
              <span className="opacity-70 mr-2">[{log.time}]</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
