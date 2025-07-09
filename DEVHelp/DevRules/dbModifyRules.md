1. Version Control Your Database
All schema changes must be tracked via migrations (e.g., with tools like Liquibase, Flyway, Alembic, Rails Migrations, or Knex).
Never make manual changes directly in production—always use code-reviewed migration scripts.
2. Test Migrations Before Production
Run migrations in staging/test environments that closely mirror production.
Validate both forward (up) and rollback (down) directions of each migration.
Use sample production-sized data when possible.
3. Backup Before Making Changes
Always make a full database backup before any migration, especially before destructive operations (drops, deletes, major data changes).
Verify backups are restorable.
4. Never Drop or Alter Data Blindly
Don’t drop tables or columns without a deprecation period. First mark as deprecated/unused, then remove in a later migration.
If you must delete data, archive it first or keep soft deletes.
5. Apply Changes in Small Steps
Make small, incremental migrations. Avoid huge “catch-up” scripts.
If you need to rename or refactor, break it into:
Add new columns/tables.
Copy or migrate data.
Switch application code to use new fields.
Remove old fields later.
6. Use Transactions for Migrations
Wrap schema/data changes in database transactions if your DB supports it (e.g., PostgreSQL).
This allows a safe rollback if a migration fails.
7. Check for Locks & Long-Running Queries
Check for long-running queries or locks before deploying changes to production.
Use pt-online-schema-change (for MySQL/MariaDB) or similar tools for zero-downtime migrations on large tables.
8. Always Set Defaults and Nullability Carefully
Set explicit DEFAULT values and NOT NULL where appropriate.
Don’t add NOT NULL columns without defaults to tables with existing rows.
9. Index Carefully
Create indexes only after data is in place, to avoid long migrations.
Monitor for performance impact of new indexes.
10. Review for Data Consistency
Add database constraints (FOREIGN KEY, UNIQUE, CHECK) to prevent bad data.
Validate application logic also checks for data integrity.
11. Use Feature Flags for Code Depending on New Schema
Deploy schema changes first, then deploy app code that relies on them.
Use feature toggles to enable/disable new logic safely.
12. Document Every Change
Describe the intent and possible risk of every migration in code comments and in your project’s changelog.
13. Monitor After Migration
Check error logs, application errors, and query performance after migrations.
Have a rollback plan if issues arise.