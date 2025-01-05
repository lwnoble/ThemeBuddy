// CognitivePage.tsx
import React from 'react';
import PageLayout from './PageLayout';

export const CognitivePage = () => {
  return (
    <PageLayout title="Cognitive Mode">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Cognitive Settings</h2>
        {/* Cognitive mode settings will go here */}
      </section>
    </PageLayout>
  );
};