import { ExternalLink } from "lucide-react";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";

interface AdminPageProps {
  onLogout: () => void;
}

const adminGif = {
  embedUrl: "https://giphy.com/embed/3ohs80ubv3iyojPquY",
  sourceUrl: "https://giphy.com/gifs/thegoodplace-nbc-the-good-place-3ohs80ubv3iyojPquY",
};

export default function AdminPage({ onLogout }: AdminPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <PageHeader title="Ledelsesoverblik" subtitle="Admin" onLogout={onLogout} />
      <Navigation isAdmin />

      <main className="max-w-5xl mx-auto px-8 py-8">
        <section className="rounded-[32px] border border-gray-200/60 bg-white/85 p-8 shadow-xl backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9c9387]">
              Kun for admin
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Hemmelig admin-zone</h2>
            <p className="mt-3 max-w-2xl text-base text-gray-600">
              Der er ikke noget vigtigt her endnu. Kun en dum GIF, fordi du bad om det.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#9c9387]/20 bg-stone-100 shadow-lg">
            <div className="aspect-[16/9] w-full">
              <iframe
                src={adminGif.embedUrl}
                title="Admin GIF"
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          </div>

          <a
            href={adminGif.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#9c9387] hover:text-[#8a816d]"
          >
            Se GIF-kilden
            <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      </main>
    </div>
  );
}
