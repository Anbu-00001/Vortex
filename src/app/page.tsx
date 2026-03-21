import VortexCanvas from '@/components/3d/VortexCanvas';
import VortexControls from '@/components/ui/VortexControls';
import { getNormalizedContributions, NormalizedContribution } from '@/lib/graphql/queries';

export default async function HomePage() {
  let contributions: NormalizedContribution[] = [];
  let error: string | null = null;

  try {
    // Server-side data fetching - GITHUB_TOKEN is securely available here
    contributions = await getNormalizedContributions('Anbu-00001', 2020, 2024);
    console.log('Day 2 Data Test (Server-side):', contributions);
  } catch (err) {
    console.error('Failed to fetch contributions on server:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#ff4444',
        fontFamily: 'monospace',
        fontSize: '18px',
        padding: '20px',
        textAlign: 'center'
      }}>
        Vortex Engine Error: {error}
        <br />
        <small style={{ fontSize: '14px', color: '#888' }}>
          Check server logs and ensure GITHUB_TOKEN is set in .env.local
        </small>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <VortexCanvas contributions={contributions} />
      <VortexControls />
    </div>
  );
}
