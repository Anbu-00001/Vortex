"use client";

import { useEffect, useState } from 'react';
import VortexCanvas from '@/components/3d/VortexCanvas';
import { getNormalizedContributions, NormalizedContribution } from '@/lib/graphql/queries';

// Force dynamic rendering to avoid build-time GraphQL calls
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [contributions, setContributions] = useState<NormalizedContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        // Test with a sample GitHub username - you can change this
        const data = await getNormalizedContributions('torvalds', 2020, 2024);
        console.log('Day 2 Data Test:', data);
        setContributions(data);
      } catch (err) {
        console.error('Failed to fetch contributions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#00ff88',
        fontFamily: 'monospace',
        fontSize: '24px'
      }}>
        Initializing Vortex Engine...
      </div>
    );
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
          Check console for details and ensure GITHUB_TOKEN is set
        </small>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VortexCanvas contributions={contributions} />
    </div>
  );
}
