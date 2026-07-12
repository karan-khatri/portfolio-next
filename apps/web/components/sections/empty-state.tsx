export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-8 text-center font-mono text-sm text-muted-foreground">
      {message}
    </div>
  );
}
