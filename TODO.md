## Next Steps

### Backend Migration

- [ ] Migrate from Supabase to dedicated backend (Express.js or Nest.js)
- [ ] Implement file management system using Buckets
- [ ] Migrate all database operations to new backend

### Mobile App

- [x] Configure PWA settings for mobile experience
- [ ] Add notification for new initiative posts

### Initiative Features

- [x] Add cancel initiative functionality
- [x] Fix allowed participation roles based on UserType and initiative organizer choices
- [ ] Create rating component for users to rate joined initiatives
- [ ] Add rating handlers and API endpoints (see [Ratings](./README.md#reusable-ui-components))
- [ ] Recommend initiatives based on user location (latitude/longitude)
- [ ] Review and fix bugs in Initiative cards:
  - [ ] `InitiativeCard` component (`/components/pages/InitiativeCard.tsx`)
  - [ ] `ParticipationCard` component (`/components/pages/ParticipationCard.tsx`)
  - [ ] `InitiativeOrgCard` component (`/components/pages/InitiativeOrgCard.tsx`)

### Support Requests

- [ ] Implement support request creation for organizations

### User Profile

- [ ] Improve joined initiatives accessibility
- [ ] Allow users and organizations to remove their profile pictures

### Channels & Editor

- [ ] Improve Tiptap editor in initiatives channels
- [ ] Add more formatting options and features
- [ ] Enhance editor UI/UX

### Admin System

- [x] Update Admin DB table to include Admin role
- [x] Remove email-based admin check from environment variables
- [x] Add admin authentication and authorization
- [x] Create route to add/manage initiative categories
- [x] Build category management interface

### Organization Management

- [ ] Create dedicated table for organization rejection notes
- [ ] Move status field to that table to track rejection states
- [ ] Implement rejection workflow and notifications

### Admin UI

- [x] Improve Admin panel components design
- [ ] Enhance dashboard layout and navigation
- [ ] Add better data visualization and tables
- [ ] Improve user experience and responsiveness

### Email Service

- [x] Integrate Resend email service
- [x] Replace all EmailJS usage with Resend
- [x] Set up email templates (4 templates created)
- [x] Add email notification features (verification, updates, reminders)
  - [x] Contact form notifications
  - [x] Critical feedback alerts
  - [x] Email verification
  - [x] Post update notifications
  - [x] Event reminders

### Multi-language Support

- [ ] Implement i18n or Lingo.dev compiler (but make sure to not make all routes dynamic) for Arabic and English
