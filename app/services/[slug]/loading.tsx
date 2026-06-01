export default function LoadingService() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6 text-center">
      <div>
        <div className="mx-auto size-14 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.26em] text-gold">Loading Service</p>
      </div>
    </main>
  );
}
