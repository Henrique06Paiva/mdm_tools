import { Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

interface Log {
  id: number;
  message: string;
  type: string;
  time: string;
}

export function LogPanel({ logs, onClear }: { logs: Log[]; onClear?: () => void }) {
  const getColorClass = (type: string) => {
    if (type === "err") return "text-destructive";
    if (type === "ok") return "text-green-600 dark:text-green-500";
    if (type === "warn") return "text-amber-600 dark:text-amber-500";
    return "text-muted-foreground";
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">
          Log de Eventos do Sistema
        </CardTitle>
        {onClear && logs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted font-sans cursor-pointer"
          >
            <Trash2 size={13} className="mr-1.5" /> Limpar Logs
          </Button>
        )}
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
