# Permissions & Access Control Matrix

> **Purpose**: Define the atomic permission set, describe what each permission enables, map them to the six user roles, and outline which application screens each role can access.

---

## 1️⃣ Atomic Permission Catalogue

| # | Permission Key | Description / Allowed Actions |
|---|----------------|--------------------------------|
| 1 | `dashboard.view` | Access the main dashboard & widgets |
| 2 | `users.create` | Create new users |
| 3 | `users.read` | View user list & profiles |
| 4 | `users.update` | Edit user data (name, role, status) |
| 5 | `users.delete` | Delete / deactivate users |
| 6 | `roles.assign` | Change a user's role |
| 7 | `clients.create` | Add new clients |
| 8 | `clients.read` | View client list & profiles |
| 9 | `clients.update` | Edit client data |
|10 | `clients.delete` | Delete / archive clients |
|11 | `coBorrowers.manage` | CRUD operations on co-borrowers |
|12 | `documents.upload` | Upload client documents |
|13 | `documents.view` | View / download documents |
|14 | `documents.delete` | Delete documents |
|15 | `programs.create` | Add new banking programs |
|16 | `programs.read` | View program catalog |
|17 | `programs.update` | Edit program details / rates |
|18 | `programs.deactivate` | Disable / archive program |
|19 | `formulas.manage` | Manage calculator formulas |
|20 | `applications.submit` | Submit client applications |
|21 | `applications.process` | Change application status |
|22 | `applications.approve` | Final approval / rejection |
|23 | `content.create` | Draft new content pages |
|24 | `content.read` | View content pages |
|25 | `content.update` | Edit content drafts |
|26 | `content.publish` | Publish content live |
|27 | `media.manage` | Upload & manage media files |
|28 | `notifications.read` | View notifications list |
|29 | `notifications.manage` | Send / configure notifications |
|30 | `audit.read` | View action history |
|31 | `settings.manage` | Update global system settings |
|32 | `analytics.view` | Access analytics dashboards |
|33 | `reports.generate` | Generate & export reports |
|34 | `transactions.view` | View financial transactions |
|35 | `transactions.process` | Process / reverse transactions |
|36 | `system.monitor` | View system health metrics |
|37 | `system.maintain` | Restart services / maintenance |
|38 | `security.manage` | Configure security rules |
|39 | `calculator.use` | Use mortgage/credit calculators |
|40 | `calculator.configure` | Configure calculator presets |

**Total Atomic Permissions: 40**

---

## 2️⃣ User Roles & Granted Permissions

| Role | Key Permissions Granted (✓) |
|------|-----------------------------|
| **Director** | All 40 permissions |
| **Administration** | 1-6, 8-14, 16-18, 19, 28-33, 36 |
| **Content Manager** | 1, 23-27, 28-29, 30, 32-33 |
| **Sales Manager** | 1, 7-14, 16, 19-22, 28, 39 |
| **Broker** | 1, 8, 12-14, 16, 20, 28, 39 |
| **Bank Employee** | 1, 7-14, 16, 19, 20-21, 28, 34-35 |

> *Note*: Numbers reference the catalogue above. “All 40” = full super-admin access.

### 2.1 Permission Breakdown by Role

1. **Director** – Full RBAC super-admin, including security & maintenance.
2. **Administration** – Manages users, clients, programs, settings, and high-level monitoring; no final approvals or financial processing.
3. **Content Manager** – Owns website/app content; cannot manage users/clients.
4. **Sales Manager** – Handles the sales pipeline; cannot publish content or change global settings.
5. **Broker** – External partner – minimal access: submit referrals/applications, view program info.
6. **Bank Employee** – Operational staff – manages daily client operations, document handling, and transactions.

---

## 3️⃣ Screen-Level Access Map

| Screen / Module | Dir | Admin | Content | Sales | Broker | Employee |
|-----------------|:---:|:-----:|:-------:|:-----:|:------:|:--------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| User Management | ✓ | ✓ | – | – | – | – |
| Role Assignment | ✓ | – | – | – | – | – |
| Client List | ✓ | ✓ | – | ✓ | ✓* | ✓ |
| Client Detail | ✓ | ✓ | – | ✓ | ✓* | ✓ |
| Co-Borrowers | ✓ | ✓ | – | ✓ | – | ✓ |
| Document Manager | ✓ | ✓ | – | ✓ | ✓* | ✓ |
| Banking Programs | ✓ | ✓ | – | ✓ | ✓ | ✓ |
| Calculator (UI) | ✓ | ✓ | – | ✓ | ✓ | ✓ |
| Program Editor | ✓ | ✓ | – | – | – | – |
| Calculator Formulas | ✓ | ✓ | – | – | – | ✓ |
| Applications Queue | ✓ | ✓ | – | ✓ | ✓ | ✓ |
| Approval Workflow | ✓ | – | – | – | – | – |
| Content CMS | ✓ | – | ✓ | – | – | – |
| Media Library | ✓ | – | ✓ | – | – | – |
| Notifications Center | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Audit Trail | ✓ | ✓ | ✓ | – | – | – |
| System Settings | ✓ | ✓ | – | – | – | – |
| Analytics Dashboards | ✓ | ✓ | ✓ | ✓ | – | ✓ |
| Reports Generator | ✓ | ✓ | ✓ | ✓ | – | ✓ |
| Transactions | ✓ | – | – | – | – | ✓ |
| System Health | ✓ | ✓ | – | – | – | – |

*✓* – View-only.

---

## 4️⃣ Permission Totals & Rationale

- **Total Permissions**: **40** atomic permissions
- **Average per role**:
  - Director: 40
  - Administration: 26
  - Content Manager: 13
  - Sales Manager: 18
  - Broker: 9
  - Bank Employee: 21

The catalogue is intentionally granular to enable future expansion (e.g., splitting `clients.update` into field-level permissions). Roles inherit only what they need, enforcing the **principle of least privilege** while ensuring operational efficiency.

---

## 5️⃣ Implementation Notes

1. **RBAC Storage**: Store permissions as an array of strings in the `roles.permissions` JSONB field (see roadmap schema).
2. **Middleware**: Use an authorization middleware that matches the authenticated user’s permissions with the required permission key on each API route.
3. **UI Guarding**: Front-end route guards & component wrappers hide inaccessible screens.
4. **Auditing**: Every permission-sensitive action must be recorded in `action_history`.
5. **Future Proofing**: New permissions can be added without schema changes—just update the catalogue and role arrays.

---

> **Summary**: 40 atomic permissions cover the full breadth of the banking system. Six user roles are mapped to these permissions, ensuring secure and efficient operations across 20+ application screens.

*Last updated: {Current Date}* 