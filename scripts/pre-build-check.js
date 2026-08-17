#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

let hasErrors = false;
let hasWarnings = false;

function exec(command, silent = false) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error };
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath));
}

function validateProjectStructure() {
  log.step('📁 Step 1: Validating Project Structure');

  const requiredFiles = [
    'package.json',
    'package-lock.json',
    'angular.json',
    'tsconfig.json',
    'src/main.ts',
    'src/index.html',
  ];

  let allFilesExist = true;

  requiredFiles.forEach((file) => {
    if (fileExists(file)) {
      log.success(`Found: ${file}`);
    } else {
      log.error(`Missing: ${file}`);
      allFilesExist = false;
      hasErrors = true;
    }
  });

  if (allFilesExist) {
    log.success('Project structure is valid');
  } else {
    log.error('Project structure validation failed');
  }

  return allFilesExist;
}

function checkDependencies() {
  log.step('📦 Step 2: Checking Dependencies');

  if (!fileExists('node_modules')) {
    log.error('node_modules not found. Running npm install...');
    const result = exec('npm install');
    if (!result.success) {
      log.error('Failed to install dependencies');
      hasErrors = true;
      return false;
    }
  } else {
    log.success('node_modules found');
  }

  log.info('Validating package-lock.json...');
  const result = exec('npm ls --depth=0 2>&1', true);

  if (result.success) {
    log.success('Dependencies are in sync');
    return true;
  } else {
    log.warning('Some dependency issues detected. Run npm install to fix.');
    hasWarnings = true;
    return true;
  }
}

function checkTypeScript() {
  log.step('🔍 Step 3: TypeScript Compilation Check');

  log.info('Running TypeScript compiler...');
  const result = exec('npx tsc --noEmit', false);

  if (result.success) {
    log.success('TypeScript compilation passed with 0 errors');
    return true;
  } else {
    log.error('TypeScript compilation failed');
    log.error('Fix all TypeScript errors before building');
    hasErrors = true;
    return false;
  }
}

function checkLinting() {
  log.step('🧹 Step 4: Code Quality Check');

  log.info('Running ESLint...');
  const result = exec('npm run lint --if-present 2>&1', true);

  if (result.success) {
    log.success('Code quality check passed');
    return true;
  } else {
    log.warning('Linting issues detected');
    log.info('Run "npm run lint:fix" to auto-fix issues');
    hasWarnings = true;
    return true;
  }
}

function checkCommonIssues() {
  log.step('🔎 Step 5: Checking for Common Issues');

  let issuesFound = false;

  log.info('Scanning for console.log statements...');
  const grepResult = exec(
    'grep -r "console\\.log\\|console\\.error\\|console\\.warn" src/modules --include="*.ts" --exclude-dir=node_modules 2>&1 || true',
    true,
  );

  if (grepResult.output && grepResult.output.trim().length > 0) {
    const lines = grepResult.output.trim().split('\n');
    if (lines.length > 0 && lines[0] !== '') {
      log.warning(`Found ${lines.length} console statements in production code`);
      hasWarnings = true;
      issuesFound = true;
    }
  }

  if (!issuesFound) {
    log.success('No console statements in modules (production-ready)');
  }

  log.info('Checking for TODO/FIXME comments...');
  const todoResult = exec(
    'grep -r "TODO\\|FIXME" src --include="*.ts" --exclude-dir=node_modules 2>&1 | head -5 || true',
    true,
  );

  if (todoResult.output && todoResult.output.trim().length > 0) {
    const todoLines = todoResult.output
      .trim()
      .split('\n')
      .filter((l) => l.trim());
    if (todoLines.length > 0) {
      log.info(`Found ${todoLines.length} TODO/FIXME comments`);
    }
  }

  return true;
}

function testBuild() {
  log.step('🏗️  Step 6: Test Build');

  log.info('Running development build...');
  const devBuild = exec('npm run build:dev 2>&1', false);

  if (!devBuild.success) {
    log.error('Development build failed');
    hasErrors = true;
    return false;
  }

  log.success('Development build successful');

  if (!fileExists('dist')) {
    log.error('Build completed but dist folder not found');
    hasErrors = true;
    return false;
  }

  log.success('Build artifacts created successfully');
  return true;
}

function securityCheck() {
  log.step('🔐 Step 7: Security Audit');

  log.info('Running npm audit...');
  const result = exec('npm audit --audit-level=high --json 2>&1', true);

  try {
    if (result.output) {
      const audit = JSON.parse(result.output);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};

      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;

      if (critical > 0) {
        log.error(`Found ${critical} critical vulnerabilities`);
        log.error('Run "npm audit fix" to resolve');
        hasErrors = true;
        return false;
      }

      if (high > 0) {
        log.warning(`Found ${high} high-severity vulnerabilities`);
        hasWarnings = true;
      } else {
        log.success('No critical security vulnerabilities found');
      }
    }
  } catch (e) {
    log.warning('Could not parse audit results');
  }

  return true;
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  log.step('📊 Build Validation Summary');
  console.log('='.repeat(60));

  if (!hasErrors && !hasWarnings) {
    console.log(`\n${colors.green}${colors.bright}✅ ALL CHECKS PASSED${colors.reset}`);
    console.log(`${colors.green}Your code is ready to build and deploy!${colors.reset}\n`);
    return true;
  } else if (!hasErrors && hasWarnings) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  WARNINGS DETECTED${colors.reset}`);
    console.log(`${colors.yellow}Build can proceed, but consider fixing warnings${colors.reset}\n`);
    return true;
  } else {
    console.log(`\n${colors.red}${colors.bright}❌ ERRORS DETECTED${colors.reset}`);
    console.log(`${colors.red}Fix all errors before building${colors.reset}\n`);
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}${colors.bright}🚀 Pre-Build Validation${colors.reset}`);
  console.log(`${colors.cyan}Ensuring your code is error-free before building${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();

  const checks = [
    validateProjectStructure(),
    checkDependencies(),
    checkTypeScript(),
    checkLinting(),
    checkCommonIssues(),
    securityCheck(),
    testBuild(),
  ];

  const allChecksPassed = checks.every((check) => check !== false);
  const success = printSummary();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱️  Completed in ${duration}s\n`);

  if (!success) {
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  log.error('Unexpected error occurred:');
  console.error(error);
  process.exit(1);
});
