# Admin-Panel Development Plan (Administration Scope Only)

> This version focuses **exclusively on the “Администрация” area** of the Admin-Panel documented in Confluence page ID 132939848 (9 child pages under [8. ОБЩЕЕ: АДМИН-ПАНЕЛЬ](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=101843111)).  Director-level, Sales, Broker, and Content features are out-of-scope here.

## Target Screens
1. **Page 1 — Вход (Login)**  
2. **Page 2 — Главная (Dashboard)**  
3. **Page 3 — Пользователи (Users)**  
4. **Page 4 — История действий (Audit Trail)**  
5. **Page 5 — Профиль пользователя (User Detail)**  
6. **Page 6 — Настройки → Личные данные (Settings / Profile)**  
7. **Page 7 — Уведомления (Notifications)**  
8. **Page 8 — Выход (Logout)**  
9. **Page 9 — Ошибка 404 (Error Page)**

---

## Build Sequence (Administration-only)

| Step | Admin Screen(s) Implemented | Key Actions | Confluence | Figma |
|------|-----------------------------|-------------|------------|-------|
| 0 | — Repo audit | Clean deps, lint, Husky, CI | [Root](https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/5472277/BANKIMONLINE) | FIGMA#RepoSetup |
| 1 | Login (Page 1) | Hook form → `/api/auth/login`; JWT cookie; remember last URL | Page 1 ID 133300226 | FIGMA#AdminLogin |
| 2 | Dashboard (Page 2) | Build cards for quick stats (users count, audit log count) | Page 2 ID 132677777 | FIGMA#AdminDashboard |
| 3 | Users (Page 3) & User Detail (Page 5) | CRUD API `/admin/users`; table + filters; detail drawer; soft delete | Page 3 ID 132841565 & Page 5 ID 134381570 | FIGMA#AdminUsers |
| 4 | Audit Trail (Page 4) | Stream table of `action_history`; filters by user/date/action | Page 4 ID 132841577 | FIGMA#AuditTable |
| 5 | Settings / Profile (Page 6) | Form to update name, email, avatar, password change | Page 6 ID 134316385 | FIGMA#ProfileSettings |
| 6 | Notifications (Page 7) | Inbox list + read/unread toggle; real-time via WebSocket | Page 7 ID 134316482 | FIGMA#Notifications |
| 7 | Logout (Page 8) | Invalidate refresh token; redirect to Login | Page 8 ID 134414396 | FIGMA#Logout |
| 8 | Error 404 (Page 9) | Generic error component; link back to dashboard | Page 9 ID 134316518 | FIGMA#Error404 |
| 9 | QA & Launch | Cypress happy-path for each screen; OWASP scan; Docker deploy | Доп. Док ID 94372561 | FIGMA#LaunchBanner |

---

## Implementation Details by Step

### Step 1 — Login (Page 1)
**Backend**
- Endpoint `POST /api/auth/login` validates credentials, returns access + refresh JWT.
- Endpoint `POST /api/auth/refresh` issues new access token.
- Store refresh tokens in `user_sessions` table for revocation.

**Frontend**
- `LoginForm.tsx` (React Hook Form + Yup).
- On success: `localStorage.setItem('userRole', response.role)` & redirect to intended URL.
- Error handling: toast messages + inline form errors.

**Testing**
- Unit: password hash & compare.
- E2E: Cypress `login.spec.ts` happy / wrong-password / locked-user paths.

**Acceptance Criteria**
- 3 incorrect tries lock user for 15 min.
- Access token expires in 15 min, refresh in 7 days.

**Confluence**: [Page 1 – Вход](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=133300226)  
**Figma**: FIGMA_LINK#AdminLogin

---

### Step 2 — Dashboard (Page 2)
**Backend**
- `GET /api/admin/dashboard/metrics` returns counts: users, unread notifications, recent actions.

**Frontend**
- `AdminDashboard.tsx` grid (Ant Design) with 3 stat cards + latest 5 actions table.
- Hook suspense loader + error boundary.

**Testing**
- Unit: metrics aggregation SQL.
- Snapshot test for dashboard rendering.

**Acceptance Criteria**
- Loads under 300 ms.
- Cards update every 60 s via SWR revalidation.

**Confluence**: [Page 2 – Главная](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=132677777)  
**Figma**: FIGMA_LINK#AdminDashboard

---

### Step 3 — Users & User Detail (Pages 3 & 5)
**Backend**
- CRUD routes `/api/admin/users`, server-side pagination, query params `?q=&page=&role=`.
- Soft delete sets `deleted_at` timestamp.
- Action history entry on create / update / delete.

**Frontend**
- `UsersTable.tsx` with column filters & role tag.
- Drawer `UserDetailDrawer.tsx` editable form.
- Validation: email uniqueness, password strength.

**Testing**
- Jest service tests for validation & soft delete.
- Cypress create→edit→delete user flow.

**Acceptance Criteria**
- Table shows ≤ 50 rows per page.
- Editing own role is disabled.

**Confluence**:  
• [Page 3 – Пользователи](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=132841565)  
• [Page 5 – Профиль пользователя](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=134381570)  
**Figma**: FIGMA_LINK#AdminUsers

---

### Step 4 — Audit Trail (Page 4)
**Backend**
- `GET /api/admin/audit` supports filter params `userId`, `actionType`, `dateFrom/To`.
- Indexes on `user_id`, `created_at` for performance.

**Frontend**
- `AuditTable.tsx` virtualized list (react-window) for thousands of rows.
- Details modal with JSON diff view of `action_data`.

**Testing**
- Load test: 100k rows fetched < 1 s.

**Acceptance Criteria**
- Admin can export current filter to CSV.

**Confluence**: [Page 4 – История действий](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=132841577)  
**Figma**: FIGMA_LINK#AuditTable

---

### Step 5 — Settings / Profile (Page 6)
**Backend**
- `PATCH /api/admin/profile` updates user fields; password change via `PATCH /password`.
- Avatar upload to `/uploads/avatars/`.

**Frontend**
- Tabs: “Personal”, “Security”.
- Avatar crop & resize (react-easy-crop).

**Testing**
- Unit: password complexity.
- E2E: change password then re-login.

**Acceptance Criteria**
- Password must contain 12+ chars incl. symbol & number.

**Confluence**: [Page 6 – Настройки / Личные данные](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=134316385)  
**Figma**: FIGMA_LINK#ProfileSettings

---

### Step 6 — Notifications (Page 7)
**Backend**
- `GET /api/admin/notifications` paginated.
- `POST /api/admin/notifications/read` bulk mark-read.
- WebSocket channel `admin_notifications` pushes new items.

**Frontend**
- Notification bell with badge count.
- Modal list, grouping by day.

**Testing**
- WebSocket mock tests.

**Acceptance Criteria**
- Real-time latency < 5 s.

**Confluence**: [Page 7 – Уведомления](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=134316482)  
**Figma**: FIGMA_LINK#Notifications

---

### Step 7 — Logout (Page 8)
- `POST /api/auth/logout` deletes session row & cookie.
- Frontend clears local storage, redirects to `/login`.

**Confluence**: [Page 8 – Выход](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=134414396)  
**Figma**: FIGMA_LINK#Logout

---

### Step 8 — Error 404 (Page 9)
- Reusable `ErrorPage` component with illustration from `/public/static/404/`.
- “Back to dashboard” button.

**Confluence**: [Page 9 – Ошибка 404](https://bankimonline.atlassian.net/wiki/pages/viewpage.action?pageId=134316518)  
**Figma**: FIGMA_LINK#Error404

---

### Step 9 — QA & Launch
**Quality Gates**
- 90% unit test coverage for admin APIs.
- Lighthouse performance ≥ 85.
- OWASP ZAP: no High/Critical issues.

**CI/CD**
- GitHub Actions stages: lint → test → build → docker push → deploy.
- Deploy preview on every PR via Vercel.

**Documentation**
- Confluence release page template filled with version, commit hash, migration steps.

---

*Last updated: July 2025 – Administration scope, detailed tasks.* 