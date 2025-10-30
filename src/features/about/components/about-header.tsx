export function AboutHeader() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-semibold text-3xl tracking-tight">
        About This Project
      </h1>
      <p className="text-pretty text-muted-foreground">
        The biller simulator helps teams prototype billing journeys using
        configurable JSON scenarios and reusable interface components.
      </p>
    </header>
  );
}
