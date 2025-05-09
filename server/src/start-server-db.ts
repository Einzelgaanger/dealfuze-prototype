import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const startServer = () => {
  const serverPath = path.join(__dirname, 'simple-server-with-db.ts');
  
  // Check if server file exists
  if (!fs.existsSync(serverPath)) {
    console.error(`Server file not found at ${serverPath}`);
    process.exit(1);
  }
  
  console.log(`Starting database-enabled server from ${serverPath}...`);
  const child = exec(`npx ts-node ${serverPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Server stderr: ${stderr}`);
    }
    console.log(`Server stdout: ${stdout}`);
  });

  // Forward stdout and stderr
  if (child.stdout) {
    child.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  }
  
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      console.error(`${data}`);
    });
  }

  // Handle process exit
  child.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
};

// Start the server
startServer();
