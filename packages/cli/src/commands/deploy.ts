import { Client } from 'ssh2';
import { readFileSync } from 'fs';
import { ora } from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

interface DeployOptions {
  host: string;
  port: number;
  username: string;
  keyPath: string;
  domain: string;
  password?: string;
}

export async function deployCommand() {
  const spinner = ora('Starting deployment...').start();
  
  try {
    // Collect SSH credentials
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'VPS hostname or IP:',
        default: 'example.com',
      },
      {
        type: 'number',
        name: 'port',
        message: 'SSH port:',
        default: 22,
      },
      {
        type: 'input',
        name: 'username',
        message: 'SSH username:',
        default: 'root',
      },
      {
        type: 'input',
        name: 'keyPath',
        message: 'Path to SSH private key:',
        default: '~/.ssh/id_rsa',
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Domain for Task Tracker:',
        default: 'tasktracker.example.com',
      },
    ]);

    const options: DeployOptions = {
      host: answers.host,
      port: answers.port,
      username: answers.username,
      keyPath: answers.keyPath.replace('~', process.env.HOME || ''),
      domain: answers.domain,
    };

    spinner.text = 'Connecting to VPS...';
    
    await connectAndDeploy(options, spinner);
    
    spinner.succeed('Deployment complete!');
    console.log(`\nTask Tracker is available at: https://${options.domain}`);
    console.log(`\nDefault login: admin@tasktracker.local / admin123`);
    
  } catch (error) {
    spinner.fail('Deployment failed');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function connectAndDeploy(options: DeployOptions, spinner: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      spinner.text = 'Connected. Installing Docker...';
      
      // Check if Docker is installed
      conn.exec('docker --version', (err, stream) => {
        if (err) {
          // Docker not installed, install it
          installDocker(conn, options, spinner, resolve, reject);
        } else {
          spinner.text = 'Docker already installed';
          deployApplication(conn, options, spinner, resolve, reject);
        }
      });
    }).connect({
      host: options.host,
      port: options.port,
      username: options.username,
      privateKey: readFileSync(options.keyPath),
    });
  });
}

function installDocker(conn: Client, options: DeployOptions, spinner: any, resolve: any, reject: any) {
  spinner.text = 'Installing Docker...';
  
  const dockerInstallScript = `
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  `;
  
  conn.exec(dockerInstallScript, (err, stream) => {
    if (err) {
      reject(err);
      return;
    }
    
    let output = '';
    stream.on('data', (data: Buffer) => { output += data.toString(); });
    stream.stderr.on('data', (data: Buffer) => { output += data.toString(); });
    stream.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Docker installation failed: ${output}`));
        return;
      }
      spinner.text = 'Docker installed';
      deployApplication(conn, options, spinner, resolve, reject);
    });
  });
}

function deployApplication(conn: Client, options: DeployOptions, spinner: any, resolve: any, reject: any) {
  spinner.text = 'Creating deployment directory...';
  
  const deployScript = `
    mkdir -p /opt/task-tracker
    cd /opt/task-tracker
  `;
  
  conn.exec(deployScript, (err, stream) => {
    if (err) {
      reject(err);
      return;
    }
    
    stream.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error('Failed to create directory'));
        return;
      }
      
      spinner.text = 'Uploading configuration files...';
      uploadFiles(conn, options, spinner, resolve, reject);
    });
  });
}

function uploadFiles(conn: Client, options: DeployOptions, spinner: any, resolve: any, reject: any) {
  // In a real implementation, this would upload the infra files
  // For now, we'll clone the repository
  const uploadScript = `
    cd /opt/task-tracker
    git clone https://github.com/your-org/task-tracker.git .
    cp infra/.env.example .env
  `;
  
  conn.exec(uploadScript, (err, stream) => {
    if (err) {
      reject(err);
      return;
    }
    
    stream.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error('Failed to upload files'));
        return;
      }
      
      spinner.text = 'Starting services...';
      startServices(conn, options, spinner, resolve, reject);
    });
  });
}

function startServices(conn: Client, options: DeployOptions, spinner: any, resolve: any, reject: any) {
  const startScript = `
    cd /opt/task-tracker
    DOMAIN=${options.domain} docker-compose up -d
  `;
  
  conn.exec(startScript, (err, stream) => {
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
        reject(new Error(`Failed to start services: ${output}`));
        return;
      }
      resolve();
    });
  });
}
