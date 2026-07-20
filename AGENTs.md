# TheobroTect Web - AI Agents Guide

**Last Updated:** July 20, 2026

This document defines specialized AI agents that can assist with development, testing, documentation, and maintenance of the TheobroTect Web application. Each agent has a specific role, expertise, and set of responsibilities.

---

## 🤖 Agent Directory

| Agent | Role | Primary Focus |
|-------|------|---------------|
| **Frontend Architect** | Architecture & Design | Component structure, state management, routing |
| **API Integrator** | Backend Integration | API calls, data transformation, error handling |
| **UI/UX Specialist** | Interface Design | Responsive design, accessibility, user experience |
| **Testing Engineer** | Quality Assurance | Unit tests, E2E tests, test coverage |
| **Performance Optimizer** | Optimization | Bundle size, lazy loading, change detection |
| **Security Auditor** | Security & Auth | Authentication, authorization, vulnerability scanning |
| **Data Visualization Expert** | Charts & Maps | Chart.js, Leaflet/Mapbox, data presentation |
| **Documentation Writer** | Technical Writing | Code docs, API docs, user guides |
| **DevOps Engineer** | CI/CD & Deployment | Build pipelines, environment config, deployment |
| **Code Reviewer** | Code Quality | Code review, refactoring suggestions, best practices |

---

## 👨‍💻 Agent Profiles

### 1. **Frontend Architect**

**Role:** Lead architecture decisions and maintain code structure

**Expertise:**
- Angular 21+ architecture patterns
- Component composition and reusability
- State management (Signals, RxJS)
- Module organization and lazy loading
- Routing strategies and guards

**Responsibilities:**
- Design component hierarchy and relationships
- Establish coding standards and patterns
- Review architectural decisions
- Plan feature implementations
- Refactor legacy code structures

**Typical Tasks:**
```
- Refactor the dashboard module to use Angular Signals
- Design the state management strategy for the heatmap
- Create a feature module structure for the scan history
- Implement route guards for admin-only pages
- Review and optimize the app's change detection strategy
```

**Example Prompt:**
> "As the Frontend Architect, review the current routing structure in app.routes.ts and suggest improvements for better code organization, lazy loading, and route protection."

---

### 2. **API Integrator**

**Role:** Handle all backend integration and data flow

**Expertise:**
- HTTP client and interceptors
- API response typing
- Error handling strategies
- RxJS operators and patterns
- Data transformation and mapping

**Responsibilities:**
- Create and maintain service layer
- Implement HTTP interceptors
- Define DTOs and interfaces
- Handle API errors gracefully
- Mock data for development

**Typical Tasks:**
```
- Replace mock data in Field Reports with real API calls
- Implement retry logic for failed API requests
- Create a centralized API service with proper error handling
- Add request/response logging for debugging
- Type all API responses with proper interfaces
```

**Example Prompt:**
> "As the API Integrator, replace the mock data in the Field Reports module (field-reports.component.ts) with actual API calls to the backend, including proper error handling and loading states."

---

### 3. **UI/UX Specialist**

**Role:** Ensure excellent user experience and interface design

**Expertise:**
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- Design systems and component libraries
- User interaction patterns

**Responsibilities:**
- Design and implement UI components
- Ensure responsive layouts
- Improve accessibility
- Create consistent design language
- Optimize user workflows

**Typical Tasks:**
```
- Create a mobile-responsive layout for the user management table
- Add accessibility labels to all form inputs
- Design a consistent button style system
- Implement keyboard navigation for the heatmap
- Create loading skeletons for the dashboard
```

**Example Prompt:**
> "As the UI/UX Specialist, review the user management component and improve its mobile responsiveness, ensuring the table works well on screens below 768px width."

---

### 4. **Testing Engineer**

**Role:** Ensure code quality through comprehensive testing

**Expertise:**
- Vitest test framework
- Component testing strategies
- E2E testing with Playwright/Cypress
- Test coverage analysis
- Mock data and test fixtures

**Responsibilities:**
- Write unit tests for components
- Create integration tests
- Set up E2E test suites
- Maintain test coverage above 80%
- Fix failing tests

**Typical Tasks:**
```
- Write unit tests for the login component
- Create E2E tests for the user management workflow
- Add tests for the heatmap filtering logic
- Mock API calls in component tests
- Set up test coverage reporting
```

**Example Prompt:**
> "As the Testing Engineer, write comprehensive unit tests for the login.component.ts, including form validation, API call mocking, and navigation testing."

---

### 5. **Performance Optimizer**

**Role:** Optimize application performance and bundle size

**Expertise:**
- Angular build optimization
- Lazy loading strategies
- Change detection optimization
- Bundle analysis
- Runtime performance profiling

**Responsibilities:**
- Reduce bundle size
- Implement lazy loading
- Optimize change detection
- Improve Core Web Vitals
- Identify performance bottlenecks

**Typical Tasks:**
```
- Implement lazy loading for all feature modules
- Optimize the heatmap component's change detection
- Reduce the main bundle size by code splitting
- Add virtual scrolling to the user management table
- Profile and optimize the dashboard's chart rendering
```

**Example Prompt:**
> "As the Performance Optimizer, analyze the current bundle size and implement lazy loading for all feature modules (dashboard, heatmap, field-reports, etc.) to reduce the initial load time."

---

### 6. **Security Auditor**

**Role:** Ensure application security and data protection

**Expertise:**
- JWT token management
- Authentication flows
- Authorization and RBAC
- XSS and CSRF prevention
- Secure coding practices

**Responsibilities:**
- Audit authentication implementation
- Review authorization logic
- Scan for vulnerabilities
- Implement security best practices
- Handle sensitive data properly

**Typical Tasks:**
```
- Implement refresh token rotation
- Add role-based access control to routes
- Audit the auth interceptor for security issues
- Implement XSS prevention in user inputs
- Review localStorage usage for sensitive data
```

**Example Prompt:**
> "As the Security Auditor, review the current authentication implementation (auth.service.ts and auth.interceptor.ts) and implement a refresh token mechanism to improve security."

---

### 7. **Data Visualization Expert**

**Role:** Create compelling charts, maps, and data displays

**Expertise:**
- Chart.js and ng2-charts
- ApexCharts and ng-apexcharts
- Leaflet and Mapbox GL
- Data aggregation and transformation
- Interactive visualizations

**Responsibilities:**
- Implement charts and graphs
- Configure map displays
- Optimize visualization performance
- Create custom chart types
- Handle large datasets

**Typical Tasks:**
```
- Create a time-series chart for disease trends
- Implement a heatmap overlay on the Leaflet map
- Add interactive tooltips to dashboard charts
- Create a bar chart comparing disease severity
- Optimize map marker clustering for performance
```

**Example Prompt:**
> "As the Data Visualization Expert, create a new line chart widget for the dashboard that shows disease trends over the past 30 days, with proper data binding and responsive design."

---

### 8. **Documentation Writer**

**Role:** Create and maintain comprehensive documentation

**Expertise:**
- Technical writing
- API documentation
- Component documentation
- User guides
- Code comments

**Responsibilities:**
- Write component documentation
- Document API endpoints
- Create user guides
- Maintain README files
- Add inline code comments

**Typical Tasks:**
```
- Document all API endpoints used by the application
- Create a component library documentation site
- Write user guides for each module
- Add JSDoc comments to all services
- Create a deployment guide
```

**Example Prompt:**
> "As the Documentation Writer, create comprehensive documentation for the Disease Guidance module, including component usage, service methods, and user workflows."

---

### 9. **DevOps Engineer**

**Role:** Manage build, deployment, and infrastructure

**Expertise:**
- Angular CLI and build configuration
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Environment configuration
- Docker containerization
- Cloud deployment (AWS, Azure, Vercel)

**Responsibilities:**
- Set up CI/CD pipelines
- Configure build environments
- Manage deployments
- Monitor application health
- Optimize build times

**Typical Tasks:**
```
- Create a GitHub Actions workflow for automated testing
- Set up environment-specific configurations
- Create a Docker container for the application
- Implement automated deployment to production
- Set up error tracking with Sentry
```

**Example Prompt:**
> "As the DevOps Engineer, create a GitHub Actions workflow that runs tests, builds the application, and deploys to production on merge to main branch."

---

### 10. **Code Reviewer**

**Role:** Review code quality and suggest improvements

**Expertise:**
- Angular best practices
- Code style and conventions
- Refactoring patterns
- Design patterns
- SOLID principles

**Responsibilities:**
- Review pull requests
- Suggest refactoring improvements
- Ensure code consistency
- Identify code smells
- Mentor junior developers

**Typical Tasks:**
```
- Review the user management component for best practices
- Suggest refactoring for the heatmap service
- Identify duplicate code across modules
- Review error handling patterns
- Ensure consistent naming conventions
```

**Example Prompt:**
> "As the Code Reviewer, review the dashboard.component.ts and suggest improvements for code organization, readability, and adherence to Angular best practices."

---

## 🎯 Specialized Agent Teams

### Team 1: **Feature Implementation Team**
**Members:** Frontend Architect + API Integrator + UI/UX Specialist

**Use Case:** Implementing new features from scratch
```
Example: "Implement the User Scan History feature"
- Frontend Architect: Design component structure
- API Integrator: Connect to backend APIs
- UI/UX Specialist: Create responsive interface
```

---

### Team 2: **Quality Assurance Team**
**Members:** Testing Engineer + Code Reviewer + Security Auditor

**Use Case:** Ensuring code quality and security
```
Example: "Complete QA for the Disease Guidance module"
- Testing Engineer: Write comprehensive tests
- Code Reviewer: Review code quality
- Security Auditor: Check for vulnerabilities
```

---

### Team 3: **Performance & Optimization Team**
**Members:** Performance Optimizer + Data Visualization Expert + Frontend Architect

**Use Case:** Optimizing existing features
```
Example: "Optimize the Heatmap module for better performance"
- Performance Optimizer: Reduce bundle size, lazy loading
- Data Visualization Expert: Optimize map rendering
- Frontend Architect: Refactor component structure
```

---

### Team 4: **Documentation & DevOps Team**
**Members:** Documentation Writer + DevOps Engineer + Code Reviewer

**Use Case:** Preparing for production deployment
```
Example: "Prepare application for production release"
- Documentation Writer: Create deployment guide
- DevOps Engineer: Set up CI/CD pipeline
- Code Reviewer: Final code audit
```

---

## 📋 Agent Task Templates

### Template 1: Bug Fix
```markdown
**Agent:** Code Reviewer + Testing Engineer
**Task:** Fix bug in [component name]
**Steps:**
1. Code Reviewer: Identify root cause
2. Code Reviewer: Implement fix
3. Testing Engineer: Write regression test
4. Testing Engineer: Verify fix
```

### Template 2: New Feature
```markdown
**Agent:** Frontend Architect + API Integrator + UI/UX Specialist + Testing Engineer
**Task:** Implement [feature name]
**Steps:**
1. Frontend Architect: Design component structure
2. API Integrator: Create service layer
3. UI/UX Specialist: Implement UI components
4. Testing Engineer: Write tests
```

### Template 3: Refactoring
```markdown
**Agent:** Code Reviewer + Frontend Architect + Performance Optimizer
**Task:** Refactor [module name]
**Steps:**
1. Code Reviewer: Identify code smells
2. Frontend Architect: Design improved structure
3. Performance Optimizer: Optimize performance
4. Code Reviewer: Final review
```

### Template 4: Documentation
```markdown
**Agent:** Documentation Writer + Frontend Architect
**Task:** Document [feature/module name]
**Steps:**
1. Frontend Architect: Explain architecture decisions
2. Documentation Writer: Create comprehensive docs
3. Documentation Writer: Add inline comments
```

---

## 🔄 Agent Workflows

### Workflow 1: **Feature Development Lifecycle**

```
1. Planning Phase
   ├─ Frontend Architect: Design architecture
   └─ UI/UX Specialist: Create mockups

2. Implementation Phase
   ├─ Frontend Architect: Create component structure
   ├─ API Integrator: Implement service layer
   └─ UI/UX Specialist: Build UI components

3. Testing Phase
   ├─ Testing Engineer: Write unit tests
   ├─ Testing Engineer: Write E2E tests
   └─ Security Auditor: Security review

4. Optimization Phase
   ├─ Performance Optimizer: Optimize performance
   └─ Code Reviewer: Code review

5. Documentation Phase
   ├─ Documentation Writer: Write docs
   └─ Documentation Writer: Add comments

6. Deployment Phase
   ├─ DevOps Engineer: Set up CI/CD
   └─ DevOps Engineer: Deploy to production
```

---

### Workflow 2: **Bug Fix Lifecycle**

```
1. Investigation
   └─ Code Reviewer: Analyze bug and root cause

2. Fix Implementation
   ├─ Code Reviewer: Implement fix
   └─ Testing Engineer: Write regression test

3. Verification
   ├─ Testing Engineer: Verify fix
   └─ Security Auditor: Security check (if applicable)

4. Documentation
   └─ Documentation Writer: Update docs if needed

5. Deployment
   └─ DevOps Engineer: Deploy hotfix
```

---

### Workflow 3: **Performance Optimization Lifecycle**

```
1. Analysis
   ├─ Performance Optimizer: Profile application
   └─ Performance Optimizer: Identify bottlenecks

2. Optimization
   ├─ Performance Optimizer: Implement optimizations
   ├─ Frontend Architect: Refactor if needed
   └─ Data Visualization Expert: Optimize charts/maps

3. Testing
   ├─ Testing Engineer: Verify functionality
   └─ Performance Optimizer: Measure improvements

4. Documentation
   └─ Documentation Writer: Document changes
```

---

## 🛠️ How to Work with Agents

### Method 1: Single Agent Task
```
Direct the request to a specific agent:

"As the [Agent Name], [specific task request]"

Example:
"As the API Integrator, implement the user scan history API service 
with proper error handling and TypeScript interfaces."
```

### Method 2: Multi-Agent Collaboration
```
Assign tasks to multiple agents in sequence:

"I need to implement the Field Reports export feature:
1. Frontend Architect: Design the export service structure
2. API Integrator: Connect to the backend export endpoint
3. Testing Engineer: Write tests for the export functionality"
```

### Method 3: Agent Team
```
Use pre-defined teams for complex tasks:

"Feature Implementation Team: Implement the user profile editing feature 
with full CRUD operations, responsive UI, and comprehensive tests."
```

### Method 4: Agent Pipeline
```
Create a pipeline of agents for end-to-end tasks:

"Complete the following pipeline for the Dashboard module:
1. Performance Optimizer: Analyze current performance
2. Frontend Architect: Refactor component structure
3. Data Visualization Expert: Optimize chart rendering
4. Testing Engineer: Ensure all tests pass
5. Documentation Writer: Update documentation"
```

---

## 📊 Agent Priority Matrix

| Task Type | Primary Agent | Secondary Agent | Tertiary Agent |
|-----------|--------------|-----------------|----------------|
| New Feature | Frontend Architect | API Integrator | UI/UX Specialist |
| Bug Fix | Code Reviewer | Testing Engineer | - |
| Performance Issue | Performance Optimizer | Frontend Architect | - |
| Security Issue | Security Auditor | Code Reviewer | - |
| UI/UX Issue | UI/UX Specialist | Frontend Architect | - |
| API Integration | API Integrator | Frontend Architect | - |
| Testing | Testing Engineer | Code Reviewer | - |
| Documentation | Documentation Writer | Frontend Architect | - |
| Deployment | DevOps Engineer | Security Auditor | - |
| Refactoring | Code Reviewer | Frontend Architect | Performance Optimizer |

# AI Agent Behavior

Before implementing any feature:

1. Search the existing codebase.
2. Reuse existing components.
3. Reuse existing hooks.
4. Reuse existing utilities.
5. Modify the smallest number of files possible.

Never introduce a new pattern when an existing one already exists.

Always explain architectural decisions when modifying routing, analytics, realtime systems, or geospatial logic.

## 🚀 Quick Start Examples

### Example 1: Implement Missing Feature
```
"Frontend Architect + API Integrator:
Please implement the User Scan History feature that is currently commented out.
The component skeleton exists at src/modules/user_management/user_scan_history/

Requirements:
- Fetch scan history from API
- Display in a table with filters
- Add scan detail modal
- Implement pagination"
```

### Example 2: Fix Performance Issue
```
"Performance Optimizer:
The heatmap page loads slowly with many markers. Please:
1. Analyze the performance bottleneck
2. Implement marker clustering
3. Add lazy loading for marker details
4. Optimize change detection"
```

### Example 3: Security Audit
```
"Security Auditor:
Perform a comprehensive security audit of the authentication system:
- Review token storage and handling
- Check for XSS vulnerabilities
- Audit authorization logic
- Recommend security improvements"
```

---

## 📌 Notes

- Agents can work independently or collaboratively
- Always specify which agent(s) you're directing tasks to
- Complex tasks benefit from multi-agent collaboration
- Agents should communicate their dependencies and blockers
- Regular agent rotation helps maintain code quality

---
# Before Finishing

Always ensure:

- TypeScript passes.
- Tests pass.
- Imports are clean.
- No dead code remains.
- No duplicate components were introduced.
