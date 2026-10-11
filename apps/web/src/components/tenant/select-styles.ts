const BASE =
  'w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed';

export function selectClass(hasError: boolean, extra = ''): string {
  const state = hasError
    ? 'border-destructive ring-1 ring-destructive'
    : 'border-input hover:border-primary/50';
  return `${BASE} ${state} ${extra}`;
}
