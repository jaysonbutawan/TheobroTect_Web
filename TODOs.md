# TheobroTect Web - TODOs

**Last Updated:** July 20, 2026

This document outlines pending tasks, improvements, and features for the TheobroTect Web application - a cacao disease management and monitoring platform.

---

## 🔐 Authentication & Security

- [ ] **Implement refresh token mechanism** - Currently only using access tokens
- [ ] **Add password reset functionality** - Missing from login flow
- [ ] **Implement "Remember Me" functionality** - Feature exists in form but not functional
- [ ] **Add password visibility toggle icon** - UI enhancement for login form
- [ ] **Add role-based access control (RBAC)** - Differentiate admin/user permissions
- [ ] **Implement session timeout warnings** - Notify users before auto-logout
- [ ] **Add two-factor authentication (2FA)** - Enhanced security for admin accounts
- [ ] **Improve error handling in auth interceptor** - More granular error responses (403, 500, etc.)

---

## 📊 Dashboard Module

### Data & API Integration
- [ ] **Connect real-time scan data** - Replace mock/static data with live API
- [ ] **Implement data refresh mechanism** - Auto-refresh dashboard stats periodically
- [ ] **Add date range filter** - Allow users to filter dashboard by custom date ranges
- [ ] **Optimize API calls** - Reduce redundant requests, implement caching

### Charts & Visualizations
- [ ] **Fix line chart data binding** - Ensure proper data mapping from API
- [ ] **Add chart legends customization** - Interactive show/hide data series
- [ ] **Implement chart export functionality** - Download as PNG/PDF
- [ ] **Add comparison charts** - Year-over-year, month-over-month comparisons
- [ ] **Create responsive chart layouts** - Better mobile view for charts

### Features
- [ ] **Add export dashboard report** - Generate PDF summary of dashboard stats
- [ ] **Implement alert notifications** - Show critical disease outbreaks
- [ ] **Add weather data integration** - Correlate disease spread with weather patterns
- [ ] **Create customizable dashboard widgets** - Allow users to arrange/hide widgets

---

## 👥 User Management Module

### Core Features
- [ ] **Add user detail view/modal** - Click to view full user profile
- [ ] **Implement user editing capabilities** - Update user information
- [ ] **Add user deletion with confirmation** - Soft delete with undo option
- [ ] **Create user registration/invite system** - Onboard new farmers
- [ ] **Add bulk user operations** - Bulk delete, bulk status update, bulk export

### Enhancements
- [ ] **Implement advanced search** - Search by multiple fields simultaneously
- [ ] **Add user activity logs** - Track user actions and scan history
- [ ] **Create user analytics dashboard** - Show user engagement metrics
- [ ] **Add user grouping/tagging** - Organize users by barangay, farm, etc.
- [ ] **Implement user export to CSV/Excel** - Download user list
- [ ] **Add user profile pictures** - Avatar upload and management

---

## 📍 Heatmap Module

### Map Functionality
- [ ] **Add map layer controls** - Toggle between satellite/street/terrain views
- [ ] **Implement clustering for dense markers** - Better performance with many scans
- [ ] **Add drawing tools** - Mark regions of interest on the map
- [ ] **Implement geofencing** - Define farm boundaries and alert zones
- [ ] **Add map search functionality** - Search locations by name/coordinates
- [ ] **Optimize map performance** - Lazy load markers, virtual scrolling

### Data & Filters
- [ ] **Add disease severity heatmap overlay** - Color-coded intensity map
- [ ] **Implement time-lapse animation** - Show disease spread over time
- [ ] **Add custom date range filters** - More flexible time filtering
- [ ] **Create filter presets** - Save and load common filter combinations
- [ ] **Add comparison mode** - Compare two different time periods side-by-side

### Features
- [ ] **Implement observations CRUD** - Full create, edit, delete for observations
- [ ] **Add photo attachment to observations** - Upload images to observations
- [ ] **Create observation sharing** - Share notes with team members
- [ ] **Add scan coverage calculation logic** - Properly compute coverage percentage
- [ ] **Implement real sync functionality** - Replace mock sync with actual API sync
- [ ] **Add export heatmap as image** - Download map view as PNG
- [ ] **Create printable reports** - Generate PDF reports from heatmap data

---

## 📋 Field Reports Module

### API Integration
- [ ] **Replace mock data with real API** - Connect to backend field reports endpoint
- [ ] **Implement report creation form** - Allow admins to create reports manually
- [ ] **Add report editing capabilities** - Update existing reports
- [ ] **Implement report deletion** - Remove outdated/incorrect reports

### Features
- [ ] **Add report detail view/modal** - Detailed report information popup
- [ ] **Implement report status workflow** - Proper status transitions (Pending → Review → Resolved)
- [ ] **Add report assignment system** - Assign reports to specific staff
- [ ] **Create report comments/notes** - Discussion thread for each report
- [ ] **Add photo attachments** - Upload images to field reports
- [ ] **Implement report notifications** - Alert users of new/updated reports

### Filters & Search
- [ ] **Add advanced search** - Search by multiple criteria
- [ ] **Add date range filter** - Filter reports by custom date ranges
- [ ] **Add report status filter** - Show only pending/under review/resolved
- [ ] **Implement saved filter presets** - Save common filter combinations

### Export & Reporting
- [ ] **Add export to CSV/Excel** - Download filtered report list
- [ ] **Generate printable reports** - PDF export of individual or bulk reports
- [ ] **Create analytics dashboard** - Show report trends and statistics

---

## 🧬 Disease Guidance Module

### Core Features
- [ ] **Complete disease CRUD operations** - Full create, read, update, delete
- [ ] **Implement image upload for diseases** - Add disease identification photos
- [ ] **Add auto-translation fallback** - Handle translation API failures gracefully
- [ ] **Implement translation caching** - Avoid re-translating same content
- [ ] **Add disease severity thresholds** - Define numeric thresholds for severity levels

### Content Management
- [ ] **Create disease templates** - Pre-filled forms for common diseases
- [ ] **Add version history** - Track changes to disease guidance
- [ ] **Implement content approval workflow** - Review process before publishing
- [ ] **Add disease synonyms/aliases** - Alternative names for diseases
- [ ] **Create disease relationships** - Link related diseases

### User Experience
- [ ] **Improve form validation** - Better error messages and field validation
- [ ] **Add form auto-save** - Prevent data loss on accidental navigation
- [ ] **Create step-by-step wizard** - Guided disease setup process
- [ ] **Add preview mode** - Preview before saving disease guidance
- [ ] **Implement mobile-responsive design** - Better mobile UX for forms

### Features
- [ ] **Add disease search by symptoms** - Help farmers identify diseases
- [ ] **Create disease comparison tool** - Side-by-side disease comparison
- [ ] **Implement print-friendly view** - Printable guidance sheets
- [ ] **Add QR code generation** - Generate QR codes for diseases (mobile app integration)

---

## 📱 User Scan History (Sub-module)

### Implementation
- [ ] **Uncomment and complete implementation** - Module exists but is commented out
- [ ] **Connect to scan history API** - Fetch user's scan history
- [ ] **Implement scan detail modal** - Show full scan details popup
- [ ] **Add scan filtering** - Filter by disease, severity, date
- [ ] **Implement scan search** - Search by pod ID or location

### Features
- [ ] **Add scan statistics** - Show user's scan summary statistics
- [ ] **Create scan timeline view** - Visual timeline of scans
- [ ] **Implement scan comparison** - Compare multiple scans
- [ ] **Add scan export** - Download scan history as CSV/PDF
- [ ] **Create scan sharing** - Share scan results with others

---

## 🧩 Shared Components

### Toast Notifications
- [ ] **Implement toast notification system globally** - Currently exists but not widely used
- [ ] **Add different toast types** - Success, error, warning, info
- [ ] **Add toast positioning options** - Top/bottom, left/right/center
- [ ] **Implement toast queue management** - Handle multiple simultaneous toasts

### Confirmation Dialogs
- [ ] **Use confirmation dialogs for destructive actions** - Delete, logout, etc.
- [ ] **Add custom dialog templates** - Reusable dialog patterns

### Pagination
- [ ] **Standardize pagination across all modules** - Consistent pagination behavior
- [ ] **Add page size selector** - Let users choose items per page
- [ ] **Implement URL-based pagination** - Maintain pagination state in URL

### Error Handling
- [ ] **Create global error handler component** - Centralized error display
- [ ] **Add 404 page content** - Complete the not-found component
- [ ] **Create offline detection** - Show message when user is offline
- [ ] **Implement retry mechanism** - Auto-retry failed API requests

### Loading States
- [ ] **Standardize skeleton loaders** - Consistent loading experience
- [ ] **Add progress indicators** - Show progress for long operations
- [ ] **Create shimmer effects** - Enhanced loading animations

---

## 🎨 UI/UX Improvements

### Design System
- [ ] **Create design system documentation** - Document colors, typography, spacing
- [ ] **Standardize button styles** - Consistent button appearance across app
- [ ] **Create icon library** - Centralized icon management
- [ ] **Add dark mode support** - Dark theme option

### Accessibility
- [ ] **Add ARIA labels** - Improve screen reader support
- [ ] **Implement keyboard navigation** - Full keyboard accessibility
- [ ] **Add focus indicators** - Visible focus states for all interactive elements
- [ ] **Test with accessibility tools** - WCAG 2.1 AA compliance

### Responsive Design
- [ ] **Optimize mobile layouts** - Better mobile experience for all modules
- [ ] **Test on various devices** - Cross-device compatibility testing
- [ ] **Add tablet-specific layouts** - Optimize for medium-sized screens
- [ ] **Implement responsive images** - Optimize image loading for different screen sizes

### Performance
- [ ] **Implement lazy loading** - Load modules on demand
- [ ] **Optimize bundle size** - Code splitting and tree shaking
- [ ] **Add service worker** - Offline support and caching
- [ ] **Implement virtual scrolling** - Better performance for long lists
- [ ] **Optimize change detection** - Use OnPush strategy where appropriate

---

## 🔧 Technical Debt & Infrastructure

### Code Quality
- [ ] **Increase test coverage** - Write unit tests for components
- [ ] **Add E2E tests** - Implement end-to-end testing
- [ ] **Set up linting rules** - Enforce code style consistency
- [ ] **Add Prettier configuration** - Already defined in package.json, ensure it's enforced
- [ ] **Implement code reviews** - Establish review process

### Architecture
- [ ] **Create state management solution** - Consider NgRx or Signals for complex state
- [ ] **Refactor service layer** - Centralize API calls and error handling
- [ ] **Implement proper error boundaries** - Better error isolation
- [ ] **Add request caching layer** - Reduce redundant API calls
- [ ] **Create API response typing** - Strong typing for all API responses

### DevOps
- [ ] **Set up CI/CD pipeline** - Automated testing and deployment
- [ ] **Add environment configurations** - Separate dev/staging/production configs
- [ ] **Implement logging service** - Centralized logging for debugging
- [ ] **Add error tracking** - Integrate Sentry or similar tool
- [ ] **Set up performance monitoring** - Track app performance metrics

### Documentation
- [ ] **Document API endpoints** - List all used backend APIs
- [ ] **Create component documentation** - Document props, events, usage
- [ ] **Add setup instructions** - Detailed local development setup
- [ ] **Create deployment guide** - Production deployment procedures
- [ ] **Write contributing guidelines** - Guide for new developers

---

## 📦 Dependencies & Upgrades

- [ ] **Audit npm packages** - Check for security vulnerabilities
- [ ] **Update to latest Angular version** - Keep framework up-to-date (currently 21.1.4)
- [ ] **Review and remove unused dependencies** - Clean up package.json
- [ ] **Evaluate map library choices** - Currently using both Leaflet and Mapbox, choose one
- [ ] **Standardize chart library** - Currently using both ng2-charts and ng-apexcharts

---

## 🔮 Future Features

### Advanced Analytics
- [ ] **Create predictive analytics dashboard** - ML-based disease outbreak prediction
- [ ] **Add trend analysis** - Identify disease patterns and trends
- [ ] **Implement data visualization studio** - Custom chart builder

### Collaboration
- [ ] **Add team collaboration features** - Comments, mentions, notifications
- [ ] **Create messaging system** - In-app communication between users
- [ ] **Implement activity feed** - Real-time updates on team activities

### Mobile Integration
- [ ] **Create mobile app API endpoints** - Support mobile application
- [ ] **Implement push notifications** - Alert users on mobile devices
- [ ] **Add QR code scanning** - Scan pods directly from mobile

### Reporting & Export
- [ ] **Create custom report builder** - Drag-and-drop report designer
- [ ] **Add scheduled reports** - Email reports on schedule
- [ ] **Implement data warehouse** - Historical data analysis

### AI/ML Integration
- [ ] **Add AI-powered recommendations** - Smart disease treatment suggestions
- [ ] **Implement image recognition API integration** - Connect to disease detection model
- [ ] **Create chatbot assistant** - Help farmers identify diseases

---

## 📝 Notes

- **Priority Levels**: Tasks should be prioritized (P0 = Critical, P1 = High, P2 = Medium, P3 = Low)
- **Dependencies**: Some tasks depend on backend API availability
- **Code Comments**: Look for `TODO`, `FIXME`, and commented-out code in the codebase for additional items
- **User Feedback**: Collect user feedback to prioritize features

---

## 🎯 Quick Wins (High Impact, Low Effort)

1. Replace mock data in Field Reports module with real API
2. Implement toast notifications across all modules
3. Add confirmation dialogs for delete operations
4. Complete not-found page content
5. Add export to CSV functionality for User Management
6. Implement proper error messages for failed API calls
7. Add loading states for all async operations
8. Create print-friendly views for reports
9. Add keyboard shortcuts for common actions
10. Implement form validation improvements

---

**Generated for:** TheobroTect Web - Cacao Disease Management Platform  
**Tech Stack:** Angular 21.1.4, Tailwind CSS 4.1.12, Chart.js, Leaflet/Mapbox  
**Project Type:** Admin Dashboard for Agricultural Disease Monitoring
