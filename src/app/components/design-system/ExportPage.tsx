// ExportPage.tsx
import React from 'react';
import PageLayout from './PageLayout';

export const ExportPage = () => {
  return (
    <PageLayout title="Export CSS">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Export Settings</h2>
        {/* CSS export options will go here */}
      </section>
    </PageLayout>
  );
};