# TitleLine Application User Manual

## 1. Introduction

Welcome to TitleLine, your comprehensive solution for managing complex land acquisition projects. This application is designed to trace property lineage, track acquisition progress, manage documentation, and streamline collaboration between administrators, aggregators, and legal teams.

This manual provides a detailed guide on how to use the application's features based on your assigned role.

## 2. Getting Started: Logging In

To begin using the application, navigate to the login page and enter the email and password provided to you by your administrator.

- **URL**: [Your Application's URL]
- **Default Credentials**:
  - **Super Admin**: `admin@o2o.com` / `password`
  - **Lawyer**: `lawyer@sk.com` / `password`
  - **Aggregator**: `aggregator@prop.com` / `password`

Upon successful login, you will be directed to your Project Dashboard.

## 3. User Roles & Permissions

The application has three primary user roles, each with specific permissions.

| Feature / Module            | Super Admin          | Aggregator                  | Lawyer                      |
| --------------------------- | -------------------- | --------------------------- | --------------------------- |
| **Project Management**      | Full CRUD            | View Assigned Projects Only | View Assigned Projects Only |
| **Family Lineage Data**     | Full CRUD            | View Only                   | View Only                   |
| **Transaction History**     | Full CRUD            | View Only                   | View Only                   |
| **Financial Transactions**  | Full CRUD            | Full CRUD                   | View Only                   |
| **Title Documents**         | Full CRUD / Upload   | Add / View / Edit           | Add / View / Edit / Download |
| **Document Collection**     | Full CRUD            | Full CRUD                   | View Only                   |
| **Acquisition Dashboard**   | Full CRUD            | View Only                   | No Access                   |
| **Notes (General)**         | Full CRUD            | View Only                   | No Access                   |
| **Legal Notes**             | Full CRUD            | View Only                   | Add / View / Edit           |
| **User Management**         | Full CRUD            | No Access                   | No Access                   |
| **Settings / Profile**      | Edit Own Profile     | Edit Own Profile            | Edit Own Profile            |

*(\*CRUD: Create, Read, Update, Delete)*

---

## 4. Core Features

### 4.1. Project Dashboard

This is the main landing page after logging in. It displays a list of projects you have access to.

- **Super Admin**: Can see and access all projects in the system. They also have a button to **"Add New Project"**.
- **Aggregator / Lawyer**: Can only see and access projects they have been explicitly assigned to.

Click **"View Project"** on any project card to navigate to its detailed view.

### 4.2. Project Details Page

This is the central hub for managing a single project. It is organized into several tabs.

#### 4.2.1. Family Lineage

This tab is for building and visualizing the ownership history of the land parcels.

- **Super Admin**: Has full control. Can manually **"Add Family Head"**, import data from a CSV file using the **"Import"** button, and edit any person's details, add heirs, or add land records.
- **Aggregator / Lawyer**: Can view all lineage and land record information but cannot make any changes.

#### 4.2.2. Title Documents

This tab is a file management system for all legal and title-related documents, organized into folders that are automatically created for each family head.

- **Super Admin**: Can create/delete sub-folders and upload/delete file records.
- **Aggregator / Lawyer**: Can also create sub-folders and upload/add file records. Lawyers have the additional ability to download files.

#### 4.2.3. Transaction History

This tab provides a chronological, table-based view of all historical land transactions related to the project.

- **Super Admin**: Can add, edit, and delete transaction records.
- **Aggregator / Lawyer**: Have read-only access to this information.

#### 4.2.4. Site Sketch

This tab allows for the upload and viewing of a master site sketch or map image for the project.

- **All Roles**: Can view the uploaded sketch.
- **Super Admin**: Can upload a new sketch or remove the existing one.

#### 4.2.5. Acquisition Dashboard

This is a powerful visual tool for tracking the real-time status of the acquisition process.

- **Color Codes**:
    - **Grey**: Pending (acquisition not started).
    - **Yellow**: In Progress (legal status is "On-Progress" or "Awaiting").
    - **Blue**: Advance Paid (a "Token Advance" has been recorded for the family).
    - **Green**: Completed (legal status is "Cleared").
- **Interactivity**: Clicking on any survey number plot will automatically scroll the page down to the detailed **Acquisition Tracker** for that specific parcel.

- **Permissions**:
    - **Super Admin / Aggregator**: Full view access. Super Admin can edit status.
    - **Lawyer**: No access to this tab.

#### 4.2.6. Document Collection Status

This section allows for tracking the collection progress of essential documents for each survey number.

- **Super Admin / Aggregator**: Can update the status of each document (e.g., "Available", "Collected").
- **Lawyer**: Has read-only access to view the collection status.

#### 4.2.7. Notes

A place for general project-related notes, organized by survey number.

- **Super Admin**: Can add, edit, and delete notes.
- **Aggregator**: Can view notes.
- **Lawyer**: No access to this tab.

#### 4.2.8. Legal Notes

A dedicated section for legally sensitive observations, organized by survey number.

- **Lawyer**: This is their primary note-taking area. They can add, edit, and delete their own notes.
- **Super Admin**: Can view, edit, and delete any legal note.
- **Aggregator**: Can view legal notes but cannot add or edit them.

---

## 5. Administrative Features (Super Admin Only)

### 5.1. User Management

Accessible from the main sidebar, this page allows Super Admins to manage all user accounts in the system.

- **Add User**: Create new user accounts, assign roles, and grant access to specific projects.
- **Edit User**: Modify an existing user's details, role, or project assignments.
- **Delete User**: Permanently remove a user from the system.

### 5.2. Settings

The settings page allows users to manage their profile and application preferences.

- **User Profile**: All users can edit their own name, email, and avatar URL. They can also change their password.
- **Role Management (Super Admin only)**: Super Admins can add, edit, or delete the available user roles in the system. A role cannot be deleted if it is currently assigned to a user.
- **Appearance**: All users can toggle between light and dark mode.
- **Data Management**: Super Admins can clear all application data from the browser's local storage. **Warning: This is a permanent action.**

---

This concludes the user manual. For any further questions, please contact your system administrator.
