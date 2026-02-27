import { Command } from 'commander';
import { deployCommand } from './commands/deploy.js';
import { updateCommand } from './commands/update.js';

export const program = new Command();

program
  .name('task-tracker')
  .description('CLI installer for Task Tracker self-hosted deployment')
  .version('0.1.0');

program.command('deploy').description('Deploy Task Tracker to a VPS').action(deployCommand);

program.command('update').description('Update Task Tracker on a VPS').action(updateCommand);

program.parse();
