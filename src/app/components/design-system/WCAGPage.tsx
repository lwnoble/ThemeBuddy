// WCAGPage.tsx
import React from 'react';
import PageLayout from './PageLayout';

export const WCAGPage = () => {
  return (
    <PageLayout title="WCAG Check">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Accessibility Validation</h2>
        {/* WCAG compliance checking tools will go here */}
      </section>
    </PageLayout>
  );
};