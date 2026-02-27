import { Client } from 'ssh2';
import { readFileSync } from 'fs';
import { ora } from 'ora';
import inquirer from 'inquirer';

interface UpdateOptions {
  host: string;
  port: number;
  username: string;
  keyPath: string;
}

export async function updateCommand() {
  const spinner = ora('Starting update...').start();

  try {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'host', message: 'VPS hostname or IP:', default: 'example.com' },
      { type: 'number', name: 'port', message: 'SSH port:', default: 22 },
      { type: 'input', name: 'username', message: 'SSH username:', default: 'root' },
      { type: 'input', name: 'keyPath', message: 'Path to SSH private key:', default: '~/.ssh/id_rsa' },
    ]);

    const options: UpdateOptions = {
      host: answers.host,
      port: answers.port,
      username: answers.username,
      keyPath: answers.keyPath.replace('~', process.env.HOME || ''),
    };

    spinner.text = 'Connecting to VPS...';
    await connectAndUpdate(options, spinner);
    spinner.succeed('Update complete!');
  } catch (error) {
    spinner.fail('Update failed');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function connectAndUpdate(options: UpdateOptions, spinner: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('ready', () => {
      spinner.text = 'Pulling latest changes...';
      const script = `
        cd /opt/task-tracker
        git pull origin main
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
      `;
      conn.exec(script, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }
        let output = '';
        stream.on('data', (data: Buffer) => { output += data.toString(); });
        stream.stderr.on('data', (data: Buffer) => { output += data.toString(); });
        stream.on('close', (code: number) => {
          conn.end();
          if (code !== 0) {
            reject(new Error(`Update failed: ${output}`));
            return;
          }
          resolve();
        });
      });
    }).connect({
      host: options.host,
      port: options.port,
      username: options.username,
      privateKey: readFileSync(options.keyPath),
    });
  });
}
