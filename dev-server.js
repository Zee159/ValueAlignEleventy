// Simple Eleventy Development Server
'use strict';
const { execSync, spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = 3000;
const SITE_PATH = path.join(__dirname, '_site');

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== ValueAlign Development Server ===${colors.reset}`);

// Helper functions
function stopServer() {
  try {
    console.log(`\n${colors.yellow}Stopping any running servers on port ${PORT}...${colors.reset}`);
    
    // Windows-specific command to find and kill process using port
    const findProcess = `for /f "tokens=5" %a in ('netstat -ano ^| find "LISTENING" ^| find ":${PORT}"') do @echo %a`;
    
    try {
      // Find PID of process using port 3000
      const pid = execSync(findProcess, { shell: 'cmd.exe' }).toString().trim();
      
      if (pid) {
        console.log(`${colors.yellow}Found process ${pid} using port ${PORT}, terminating...${colors.reset}`);
        execSync(`taskkill /F /PID ${pid}`, { shell: 'cmd.exe' });
        console.log(`${colors.green}Server stopped successfully.${colors.reset}`);
      } else {
        console.log(`${colors.green}No server running on port ${PORT}.${colors.reset}`);
      }
    } catch (err) {
      // If no process found or error, continue
      console.log(`${colors.green}No server running on port ${PORT}.${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}Error stopping server: ${err.message}${colors.reset}`);
  }
}

function buildSite() {
  try {
    console.log(`\n${colors.yellow}Building site...${colors.reset}`);
    execSync('npx @11ty/eleventy', { stdio: 'inherit' });
    console.log(`${colors.green}Site built successfully.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Error building site: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

function startServer() {
  console.log(`\n${colors.yellow}Starting development server on port ${PORT}...${colors.reset}`);
  
  const server = spawn('npx', ['@11ty/eleventy', '--serve', `--port=${PORT}`], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (err) => {
    console.error(`${colors.red}Failed to start server: ${err.message}${colors.reset}`);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${colors.red}Server exited with code ${code}${colors.reset}`);
    }
  });
  
  console.log(`\n${colors.green}${colors.bright}Server started! Access your site at: http://localhost:${PORT}${colors.reset}`);
  console.log(`${colors.cyan}Press Ctrl+C to stop the server${colors.reset}\n`);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Shutting down server...${colors.reset}`);
    server.kill();
    process.exit(0);
  });
}

// Main execution flow
stopServer();
buildSite();
startServer();
