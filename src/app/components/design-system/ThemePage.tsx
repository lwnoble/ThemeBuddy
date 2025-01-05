// ThemePage.tsx
import React from 'react';
import PageLayout from './PageLayout';

export const ThemePage = () => {
  return (
    <PageLayout title="Theme">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
        {/* Theme customization content will go here */}
      </section>
    </PageLayout>
  );
};