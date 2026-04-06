export default function RootLoading() {
  return (
    <main
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12"
      style={{ animation: 'fade-in-soft 220ms ease-out' }}
    >
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-text">Cargando</h1>
        <p className="mt-2 text-sm text-text-muted">
          Estamos preparando la siguiente vista.
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: '38%',
              animation: 'loading-sweep 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </section>
    </main>
  )
}
