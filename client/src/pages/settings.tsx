import { Button } from "@/components/ui/button";
import { Plus, Settings as SettingsIcon } from "lucide-react";
import logoImage from "@assets/ChatGPT Image 24. aug. 2025, 16.38.56_1756046355129.png";

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logoImage} alt="AL2bolig Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                  Indstillinger
                </h1>
                <p className="text-sm text-gray-600">Administration af områder</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Areas Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Områder</h2>
              <p className="text-sm text-gray-600 mt-1">
                Administrer organisationens områder
              </p>
            </div>
            <Button
              className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
              data-testid="button-create-area"
            >
              <Plus className="mr-2 h-4 w-4" />
              Opret område
            </Button>
          </div>

          {/* Areas List - Placeholder */}
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Sekretariat</h3>
                  <p className="text-sm text-gray-500">Oprettet af: AB</p>
                </div>
                <SettingsIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Drift</h3>
                  <p className="text-sm text-gray-500">Oprettet af: CD</p>
                </div>
                <SettingsIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">IT</h3>
                  <p className="text-sm text-gray-500">Oprettet af: EF</p>
                </div>
                <SettingsIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
