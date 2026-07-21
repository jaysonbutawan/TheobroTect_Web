# 🚀 Build Validation - Quick Reference

## Install Husky (First Time Setup)

```bash
npm install --save-dev husky
npm run prepare
```

On Mac/Linux, make hooks executable:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

---

## Commands

### Validate Before Building
```bash
npm run validate        # Run all validation checks
npm run pre-build       # Same as validate
```

### Safe Build (Auto-validates)
```bash
npm run build           # Validates then builds
npm run build:prod      # Validates then production build
npm run build:safe      # Explicit safe build
```

### Build Without Validation
```bash
npm run build:dev       # Direct dev build (no validation)
ng build               # Direct Angular CLI build
```

---

## What Gets Checked

✅ **Project Structure** - All required files exist  
✅ **Dependencies** - node_modules and package-lock in sync  
✅ **TypeScript** - Zero compilation errors  
✅ **Code Quality** - Linting and formatting  
✅ **Console Logs** - Detects console statements  
✅ **Security** - npm audit for vulnerabilities  
✅ **Test Build** - Actual build test  

---

## Automatic Validation

### On Commit:
- TypeScript check
- Console.log detection
- Basic linting

### On Push:
- Full validation (all 7 stages)
- Takes ~2 minutes

### On Build:
- `npm run build` → auto-validates
- `npm run build:prod` → auto-validates

---

## Skip Validation (Emergency Only)

```bash
# Skip commit hook
git commit --no-verify

# Skip push hook
git push --no-verify

# Build without validation
npm run build:dev
```

⚠️ **Not recommended!** Use only in emergencies.

---

## Fix Common Issues

### TypeScript Errors
```bash
npx tsc --noEmit       # See all errors
# Fix errors in your IDE
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Security Vulnerabilities
```bash
npm audit fix
```

### Build Failures
```bash
npm run build:dev      # Try dev build first
# Check console for specific errors
```

---

## Output

### ✅ Success
```
✅ ALL CHECKS PASSED
Your code is ready to build and deploy!
⏱️  Completed in 95s
```

### ⚠️ Warnings
```
⚠️  WARNINGS DETECTED
Build can proceed, but consider fixing warnings
⏱️  Completed in 87s
```

### ❌ Errors
```
❌ ERRORS DETECTED
Fix all errors before building
⏱️  Completed in 52s
```

---

## Files Created

- `scripts/pre-build-check.js` - Main validation script
- `.husky/pre-commit` - Commit hook
- `.husky/pre-push` - Push hook
- `docs/BUILD-VALIDATION.md` - Full documentation

---

## Need Help?

See full documentation: `docs/BUILD-VALIDATION.md`

---

**Quick Tip**: Run `npm run validate` before committing to catch errors early! 🎯
