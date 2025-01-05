// ShadowsPage.tsx
import React from 'react';
import PageLayout from './PageLayout';

export const ShadowsPage = () => {
  return (
    <PageLayout title="Shadows and Glows">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Shadow Presets</h2>
        {/* Shadow and glow settings will go here */}
      </section>
    </PageLayout>
  );
};