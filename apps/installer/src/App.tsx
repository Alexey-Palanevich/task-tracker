import React from 'react';
import { SshForm } from './components/SshForm';
import { DeployProgress } from './components/DeployProgress';
import { useDeployStore } from './store';

export function App() {
  const { step } = useDeployStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Task Tracker Installer
        </h1>
        
        {step === 'form' && <SshForm />}
        {step === 'deploying' && <DeployProgress />}
        {step === 'complete' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Deployment Complete!</h2>
            <p className="text-gray-400">
              Task Tracker has been deployed successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
