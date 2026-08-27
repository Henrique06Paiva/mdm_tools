import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ className, type, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        // h-11 (44px) for comfortable touch targets, text-sm (14px base) readable
        'flex h-11 w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm font-mono ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-1 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export function Label({
  className,
  ref,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { ref?: React.Ref<HTMLLabelElement> }) {
  return (
    <label
      ref={ref}
      className={cn(
        // text-xs (12px) — readable label above field
        'text-xs font-semibold leading-none text-muted-foreground uppercase tracking-wider peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2',
        className
      )}
      {...props}
    />
  );
}
