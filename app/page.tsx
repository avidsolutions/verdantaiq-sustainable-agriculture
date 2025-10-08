
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession() || {};

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      redirect('/dashboard');
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show VerdantaIQ welcome page with demo access
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-green-800 mb-4">
            🌱 VerdantaIQ
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Sustainable Urban Agriculture Intelligence Platform
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Powered by IBM WatsonX AI • Government Data Integration • Environmental Monitoring
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Demo Access</h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Demo Credentials:</h3>
              <p className="text-sm text-green-700">
                <strong>Email:</strong> demo@verdantaiq.com<br/>
                <strong>Password:</strong> demo123
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
              >
                Login to Dashboard
              </Link>

              <Link
                href="/dashboard"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
              >
                View Dashboard (Direct Access)
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <h3 className="font-semibold text-gray-800 mb-3">Available Features:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>🤖 WatsonX AI Integration</p>
              <p>📊 Government Data APIs</p>
              <p>🌡️ Environmental Monitoring</p>
              <p>🔧 Automation Controls</p>
              <p>📈 Predictive Analytics</p>
              <p>🐛 Vermiculture Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
