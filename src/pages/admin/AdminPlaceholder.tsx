export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-muted-foreground">This section is under development.</p>
      </div>
    </div>
  );
}
