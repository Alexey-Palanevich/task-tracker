import { useForm } from 'react-hook-form';
import { useDeployStore } from '../store';

interface SshCredentials {
  host: string;
  port: number;
  username: string;
  keyPath: string;
  domain: string;
}

export function SshForm() {
  const { setCredentials, startDeployment } = useDeployStore();
  const { register, handleSubmit, formState: { errors } } = useForm<SshCredentials>({
    defaultValues: {
      host: '',
      port: 22,
      username: 'root',
      keyPath: '~/.ssh/id_rsa',
      domain: '',
    },
  });

  const onSubmit = (data: SshCredentials) => {
    setCredentials(data);
    startDeployment();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">VPS Hostname or IP</label>
        <input
          {...register('host', { required: 'Host is required' })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="example.com"
        />
        {errors.host && <span className="text-red-500 text-sm">{errors.host.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">SSH Port</label>
        <input
          type="number"
          {...register('port', { required: true, min: 1, max: 65535 })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          defaultValue={22}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">SSH Username</label>
        <input
          {...register('username', { required: 'Username is required' })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          placeholder="root"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">SSH Private Key Path</label>
        <input
          {...register('keyPath', { required: 'Key path is required' })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          placeholder="~/.ssh/id_rsa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Domain for Task Tracker</label>
        <input
          {...register('domain', { required: 'Domain is required' })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          placeholder="tasktracker.example.com"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
      >
        Deploy Task Tracker
      </button>
    </form>
  );
}
