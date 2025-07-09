# Easy-to-Read Permission Map

This overview explains **who can do what** inside the Bankim online platform. It is written for managers and team members who don’t need the technical details.

---

## 1. Quick Summary

| Role | What this role can do (in plain words) | Main screens they can open |
|------|----------------------------------------|----------------------------|
| **Director** | Has full control of the system, including user setup, client data, banking programs, content and reports. | All screens |
| **Administration** | Looks after day-to-day system tasks: adds / edits users, helps with clients, monitors activity and views reports. Cannot do financial approvals or deep technical changes. | Dashboard, Users, Clients, Documents, Programs, Applications, Notifications, Reports |
| **Content Manager** | Creates and updates website/app text, images and news. Publishes approved content and checks how it performs. | Dashboard, Content, Media Library, Notifications, Reports |
| **Sales Manager** | Works with new leads and existing clients, uploads their documents, prepares offers and uses calculators to show costs. | Dashboard, Clients, Documents, Programs, Calculators, Applications, Notifications |
| **Broker** | External partner. Sends referrals and loan requests, uploads basic documents, views program catalogue and uses calculators. | Dashboard (view only), Clients (view only), Documents (upload only), Programs (view only), Calculators, Applications (submit), Notifications |
| **Bank Employee** | Handles daily client service: updates client info, uploads documents, runs loan calculators, processes transactions. | Dashboard, Clients, Documents, Programs, Calculators, Applications, Transactions, Notifications |

*Tip: “View only” means the role can look but cannot change data.*

---

## 1.1 ASCII Permission Matrix

Below is a **visual matrix** that shows at-a-glance which role can access which screen.

```
Legend
  X  = full access (create / edit / delete)
  v  = view-only
  u  = upload-only
  s  = submit (send forms)
  –  = no access

Screens →    | D | A | C | S | B | E |
-------------+---+---+---+---+---+---+
Dashboard     | X | X | X | X | v | X |
Users         | X | X | – | – | – | – |
Clients       | X | X | – | X | v | X |
Documents     | X | X | – | X | u | X |
Programs      | X | X | – | X | v | X |
Calculators   | X | X | – | X | X | X |
Applications  | X | X | – | X | s | X |
Content CMS   | X | – | X | – | – | – |
Media Library | X | – | X | – | – | – |
Reports       | X | X | X | X | – | X |
Transactions  | X | – | – | – | – | X |
Settings      | X | v | – | – | – | – |
Audit Trail   | X | X | v | – | – | v |
System Health | X | v | – | – | – | – |
```

### Role Legend

| Abbreviation | Full Role Name |
|--------------|----------------|
| **D** | Director |
| **A** | Administration |
| **C** | Content Manager / Copywriter |
| **S** | Sales Manager |
| **B** | Broker (external partner) |
| **E** | Bank Employee |

Use this matrix together with the plain-language tables to understand access at a glance.

---

## 1.2 Example Pages Each Role Can Update

Below are sample Confluence pages (from the full BANKIMONLINE documentation tree) that **each role is allowed to change**.  The list is not exhaustive but shows the typical scope for every role.

| Role | Example editable pages |
|------|------------------------|
| **Director** | All pages including:<br>• 1. Главная страница / Стр.1<br>• 2. Меню – все 12 страниц (О нас, Вакансии, Контакты …)<br>• Все страницы услуг 3‒6 (Ипотека, Рефинансирование, Кредит и т.д.)<br>• Вся “Админ-Панель” (8. ОБЩЕЕ) для всех ролей |
| **Administration** | • 8. ОБЩЕЕ: АДМИН-ПАНЕЛЬ – раздел “Администрация” (9 страниц)<br>• Настройки и отчёты в 1.1, 2.*, 7. ОБЩЕЕ: ВСЕ УСЛУГИ |
| **Content Manager** | • 1. Главная страница / Стр.1 (текст и изображения)<br>• 2. МЕНЮ – все информационные страницы (О нас, Вакансии, Контакты, Cookie, Политика возврата, Конфиденциальность, Польз. соглашение)<br>• Медиа-библиотека |
| **Sales Manager** | • 3.4 Рассчитать ипотеку. Админ-Панель. Менеджер по продажам<br>• 4.4 Рефинансировать ипотеку. Админ-Панель. Менеджер по продажам<br>• 5.4 Рассчитать кредит. Админ-Панель. Менеджер по продажам<br>• 6.4 Рефинансировать кредит. Админ-Панель. Менеджер по продажам |
| **Broker** | • 3.5 Рассчитать ипотеку. Админ-Панель. Брокеры<br>• 4.5 Рефинансировать ипотеку. Админ-Панель. Брокеры<br>• 5.5 Рассчитать кредит. Админ-Панель. Брокеры<br>• 6.5 Рефинансировать кредит. Админ-Панель. Брокеры |
| **Bank Employee** | • 3.3 Рассчитать ипотеку. Админ-Панель. Сотрудник банка<br>• 4.3 Рефинансировать ипотеку. Админ-Панель. Сотрудник банка<br>• 5.3 Рассчитать кредит. Админ-Панель. Сотрудник банка<br>• 6.3 Рефинансировать кредит. Админ-Панель. Сотрудник банка |

These page names mirror the Confluence structure (children & grandchildren) found under the main project page [`BANKIMONLINE`](https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/5472277/BANKIMONLINE).

---

## 2. What Each Screen Means

| Screen | Purpose |
|--------|---------|
| **Dashboard** | Quick overview of tasks, news and alerts. |
| **Users** | Add, edit or deactivate staff accounts. |
| **Clients** | See and update customer details. |
| **Documents** | Upload, download or delete customer papers. |
| **Programs** | Manage or view mortgage / credit offers. |
| **Calculators** | Estimate monthly payments and rates. |
| **Applications** | Send or track loan requests. |
| **Content** | Write and edit website pages and articles. |
| **Media Library** | Store images, PDFs and other files. |
| **Notifications** | System messages and alerts. |
| **Reports / Analytics** | Graphs and tables showing performance. |
| **Transactions** | View or process money movements. |
| **Settings** | Change global preferences (admins only). |
| **Audit Trail** | Historical log of who did what (admins only). |
| **System Health** | Server status and security (admins only). |

---

## 3. Why This Matters

Keeping permissions clear:
1. **Protects sensitive data** – only people who should see it, will see it.
2. **Prevents mistakes** – users cannot accidentally change areas outside their job.
3. **Meets regulations** – audit logs show exactly who did what.

If you need to adjust who can do what, speak to the **Administration** team or the **Director** role holder. They can give (or remove) access in minutes.

---

*Last updated: July 2025* 