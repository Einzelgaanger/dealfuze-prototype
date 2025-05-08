import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Check if ts-node is installed
const checkTsNode = () => {
  return new Promise<boolean>((resolve) => {
    exec('npx ts-node --version', (error) => {
      if (error) {
        console.log('ts-node is not installed. Installing...');
        resolve(false);
      } else {
        console.log('ts-node is already installed.');
        resolve(true);
      }
    });
  });
};

// Install ts-node if not installed
const installTsNode = () => {
  return new Promise<void>((resolve, reject) => {
    console.log('Installing ts-node...');
    exec('npm install -g ts-node typescript @types/node', (error) => {
      if (error) {
        console.error('Failed to install ts-node:', error);
        reject(error);
      } else {
        console.log('ts-node installed successfully.');
        resolve();
      }
    });
  });
};

// Start the server using ts-node
const startServer = () => {
  const serverPath = path.join(__dirname, 'server.ts');
  
  // Check if server.ts exists
  if (!fs.existsSync(serverPath)) {
    console.error(`Server file not found at ${serverPath}`);
    process.exit(1);
  }
  
  console.log(`Starting server from ${serverPath}...`);
  const child = exec(`npx ts-node ${serverPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Server stderr: ${stderr}`);
    }
  });
  
  // Forward stdout and stderr to the console
  child.stdout?.on('data', (data) => {
    console.log(data.toString());
  });
  
  child.stderr?.on('data', (data) => {
    console.error(data.toString());
  });
  
  // Handle process exit
  child.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
};

// Main function to run the server
const main = async () => {
  try {
    const isTsNodeInstalled = await checkTsNode();
    if (!isTsNodeInstalled) {
      await installTsNode();
    }
    startServer();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

main();
