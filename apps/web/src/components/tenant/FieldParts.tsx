export function FieldError({ message }: { message?: string }) {
  return (
    <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
      <span>⚠</span> {message}
    </span>
  );
}

function CharCounter({ length, max }: { length: number; max: number }) {
  const over = length > max ? 'text-destructive font-medium' : '';
  return (
    <span className={`text-muted-foreground ${over}`}>
      {length} / {max}
    </span>
  );
}

interface FieldFooterProps {
  error?: string;
  hint: string;
  value: string;
  max: number;
}

export function FieldFooter({ error, hint, value, max }: FieldFooterProps) {
  return (
    <div className="flex justify-between text-xs mt-1">
      {error ? (
        <FieldError message={error} />
      ) : (
        <span className="text-muted-foreground">{hint}</span>
      )}
      <CharCounter length={value.length} max={max} />
    </div>
  );
}
