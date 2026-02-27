import { useDeployStore } from '../store';

const steps = [
  { key: 'connecting', label: 'Connecting to VPS' },
  { key: 'docker', label: 'Installing Docker' },
  { key: 'uploading', label: 'Uploading files' },
  { key: 'starting', label: 'Starting services' },
  { key: 'complete', label: 'Complete' },
];

export function DeployProgress() {
  const { currentStep, error } = useDeployStore();

  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.key}
              className={`flex items-center space-x-3 ${
                isPending ? 'text-gray-500' : isComplete ? 'text-green-500' : isCurrent ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                isComplete ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-700'
              }`}>
                {isComplete ? '✓' : isCurrent ? '●' : '○'}
              </div>
              <span className={isCurrent ? 'font-medium' : ''}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
