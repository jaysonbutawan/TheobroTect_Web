# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for automated testing, building, and deployment. The pipeline ensures code quality, security, and reliability before any code reaches production.

---

## 🔄 Workflows

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

Main pipeline that runs on push and pull requests.

#### Stages:

1. **Code Quality Check**
   - ESLint validation
   - Prettier formatting check
   - Code style compliance

2. **TypeScript Type Check**
   - Full TypeScript compilation
   - Type error detection
   - Interface validation

3. **Unit Tests**
   - Test execution with Vitest
   - Code coverage generation
   - Coverage report upload

4. **Build Application**
   - Development build
   - Production build
   - Bundle optimization
   - Artifact upload

5. **Security Audit**
   - npm audit for vulnerabilities
   - Critical vulnerability blocking
   - Security report generation

6. **Dependency Check**
   - package-lock.json validation
   - Outdated package detection
   - Duplicate dependency check

7. **Bundle Size Analysis**
   - Production bundle analysis
   - Size comparison
   - PR comment with results

8. **Integration Summary**
   - Overall status check
   - Result aggregation
   - Pipeline success/failure

9. **Deploy to Staging** (develop branch)
   - Automatic staging deployment
   - Environment verification

10. **Deploy to Production** (main branch)
    - Automatic production deployment
    - Deployment notification

---

### 2. **Pull Request Checks** (`.github/workflows/pr-checks.yml`)

Additional validation for pull requests.

#### Checks:
- ✅ PR title validation (semantic commits)
- ✅ Merge conflict detection
- ✅ Branch up-to-date check
- ✅ TypeScript compilation
- ✅ Test execution
- ✅ Automated PR comment

---

## 🚀 Branch Strategy

### Main Branches:

- **`main`**: Production-ready code
  - ✅ Deploys to production
  - ✅ Requires PR approval
  - ✅ Protected branch

- **`develop`**: Integration branch
  - ✅ Deploys to staging
  - ✅ Feature integration
  - ✅ Pre-release testing

### Feature Branches:

- **`feature/*`**: New features
- **`fix/*`**: Bug fixes
- **`refactor/*`**: Code refactoring
- **`docs/*`**: Documentation

---

## 📋 Commit Convention

Use semantic commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build/tooling changes

### Examples:
```bash
feat(dashboard): add lazy loading for charts
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
refactor(api): simplify error handling
```

---

## 🧪 Running Tests Locally

### All Tests:
```bash
npm test
```

### CI Mode (no watch):
```bash
npm run test:ci
```

### With Coverage:
```bash
npm run test:coverage
```

---

## 🔍 Code Quality Checks

### Linting:
```bash
npm run lint
npm run lint:fix
```

### Formatting:
```bash
npm run format:check
npm run format
```

### TypeScript:
```bash
npx tsc --noEmit
```

---

## 🏗️ Building

### Development Build:
```bash
npm run build:dev
```

### Production Build:
```bash
npm run build:prod
```

### Bundle Analysis:
```bash
npm run analyze
```

---

## 📊 Pipeline Status Badges

Add these to your README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/TheobroTect_Web/workflows/CI/CD%20Pipeline/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/TheobroTect_Web/workflows/Pull%20Request%20Checks/badge.svg)
```

---

## 🔐 Required Secrets

Configure these in GitHub Settings → Secrets:

### For Deployment:
- `DEPLOY_KEY`: SSH key for server access
- `SERVER_HOST`: Production server hostname
- `SERVER_USER`: Server username

### For Notifications (optional):
- `SLACK_WEBHOOK`: Slack notification URL
- `DISCORD_WEBHOOK`: Discord notification URL

---

## 🛠️ Environment Variables

### Staging:
```
API_URL=https://api-staging.theobrotect.com
ENVIRONMENT=staging
```

### Production:
```
API_URL=https://api.theobrotect.com
ENVIRONMENT=production
```

---

## 📈 Monitoring

### Pipeline Metrics:
- ✅ Build time: ~3-5 minutes
- ✅ Test execution: ~1-2 minutes
- ✅ Deployment: ~2-3 minutes

### Success Criteria:
- TypeScript compilation: 0 errors
- Tests: 70%+ coverage
- Security: No critical vulnerabilities
- Build: Production bundle < 1MB

---

## 🚨 Troubleshooting

### Pipeline Fails on TypeScript Check:
```bash
npx tsc --noEmit
# Fix all type errors locally
```

### Tests Failing:
```bash
npm test
# Review and fix failing tests
```

### Build Fails:
```bash
npm run build:prod
# Check for missing dependencies or configuration issues
```

### Security Audit Fails:
```bash
npm audit
npm audit fix
```

---

## 📞 Support

For pipeline issues:
1. Check GitHub Actions logs
2. Review error messages
3. Run commands locally to reproduce
4. Contact DevOps team

---

## 🔄 Update Pipeline

To modify the pipeline:

1. Edit `.github/workflows/ci-cd.yml`
2. Test changes in a feature branch
3. Create PR to develop
4. Review pipeline execution
5. Merge when successful

---

**Last Updated**: 2026-07-20  
**Version**: 1.0.0
