import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const CODE_DIR = '/tmp/code_execution';
if (!fs.existsSync(CODE_DIR)) {
  fs.mkdirSync(CODE_DIR, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json());

app.post('/run', (req, res) => {
  const { code, language } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code cannot be empty' });
  }
  
  // Create a random execution ID for isolation
  const executionId = crypto.randomBytes(8).toString('hex');
  const executionDir = path.join(CODE_DIR, executionId);
  
  // Create directory for this execution
  fs.mkdirSync(executionDir, { recursive: true });
  
  if (language === 'cpp') {
    runCpp(code, executionDir, res);
  } else if (language === 'java') {
    runJava(code, executionDir, res);
  } else {
    try {
      fs.rmSync(executionDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error cleaning up directory:', err);
    }
    res.status(400).json({ error: 'Unsupported language' });
  }
});

function runCpp(code, dir, res) {
  const srcFile = path.join(dir, 'main.cpp');
  const exeFile = path.join(dir, 'main.out');

  fs.writeFile(srcFile, code, (err) => {
    if (err) {
      cleanupDir(dir);
      return res.status(500).json({ error: 'Server error', output: err.message });
    }
    
    exec(`g++ "${srcFile}" -o "${exeFile}" -Wall -std=c++17`, 
      { timeout: 5000 }, 
      (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          cleanupDir(dir);
          return res.status(400).json({ error: 'Compilation error', output: compileStderr });
        }
        
        const cmd = `timeout 3s ${exeFile}`;
        
        exec(cmd, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
          cleanupDir(dir);
          
          if (runErr && runErr.killed) {
            return res.status(400).json({ 
              error: 'Execution timeout', 
              output: 'Your program took too long to execute (>3s)' 
            });
          } else if (runErr) {
            return res.status(400).json({ error: 'Runtime error', output: runStderr });
          }
          
          return res.json({ output: runStdout });
        });
      }
    );
  });
}

function runJava(code, dir, res) {
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  if (!classNameMatch) {
    cleanupDir(dir);
    return res.status(400).json({ 
      error: 'Syntax error', 
      output: 'Could not find a public class name in your Java code' 
    });
  }
  
  const className = classNameMatch[1];
  const srcFile = path.join(dir, `${className}.java`);
  
  fs.writeFile(srcFile, code, (err) => {
    if (err) {
      cleanupDir(dir);
      return res.status(500).json({ error: 'Server error', output: err.message });
    }
    
    exec(`javac "${srcFile}"`, 
      { timeout: 5000 }, 
      (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          cleanupDir(dir);
          return res.status(400).json({ error: 'Compilation error', output: compileStderr });
        }
        
        // Run with resource limits using Docker
        const cmd = `cd "${dir}" && timeout 3s java ${className}`;
        
        exec(cmd, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
          cleanupDir(dir);
          
          if (runErr && runErr.killed) {
            return res.status(400).json({ 
              error: 'Execution timeout', 
              output: 'Your program took too long to execute (>3s)' 
            });
          } else if (runErr) {
            return res.status(400).json({ error: 'Runtime error', output: runStderr });
          }
          
          return res.json({ output: runStdout });
        });
      }
    );
  });
}

function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    console.error('Error cleaning up directory:', err);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Code execution server running on port ${PORT}`);
  console.log(`Server is running in container mode`);
});