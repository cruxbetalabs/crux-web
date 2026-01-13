import { PoseReconstruction } from "@/components/pose-reconstruction";
import { PWAInstaller } from "@/components/pwa-installer";
import { ClientOnly } from "@/components/client-only";

export default function Home() {
  return (
    <>
      <PWAInstaller />
      <ClientOnly fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Crux Web</h1>
            <p className="text-muted-foreground mb-4">A climbing pose 3D reconstruction web app.</p>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <PoseReconstruction />
      </ClientOnly>
    </>
  );
}
