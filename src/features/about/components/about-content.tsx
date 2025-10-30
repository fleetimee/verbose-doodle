export function AboutContent() {
  return (
    <section className="flex flex-col gap-4 text-pretty leading-relaxed">
      <p>
        Explore the source files to see how the simulator wires data models to
        interactive UI patterns. You can extend the toolkit by adding new
        components under
        <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">
          src/components
        </code>
        and composing new routes for different workflows.
      </p>
      <p>
        Each route is powered by React Router, so you can organize scenarios by
        teams, billing products, or customer personas while keeping navigation
        consistent.
      </p>
    </section>
  );
}
