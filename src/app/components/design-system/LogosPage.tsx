// LogosPage.tsx
import React from 'react';
import PageLayout from './PageLayout';

interface LogoPageProps {
  onBack: () => void;
}

export const LogosPage = () => {
  return (
    <PageLayout title="Logos">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Logo Management</h2>
        {/* Logo upload and management content will go here */}
      </section>
    </PageLayout>
  );
};