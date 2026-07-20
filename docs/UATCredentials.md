# UAT Credentials

These accounts are created by [../scripts/seed-uat.ts](../scripts/seed-uat.ts) during UAT seed execution.

| Role | Email | Password | Profile Role |
| --- | --- | --- | --- |
| Super Admin | superadmin@gho.demo | Demo-SuperAdmin-2026! | super_admin |
| Platform Admin | admin@gho.demo | Demo-PlatformAdmin-2026! | admin |
| Driver | driver1@gho.demo | Demo-Driver-2026! | driver |
| Client | client@gho.demo | Demo-Client-2026! | admin |
| Executive | executive@gho.demo | Demo-Executive-2026! | admin |

## Notes

1. The current application login router supports `super_admin`, `admin`, `driver`, and `agent`.
2. Client and Executive accounts are real seeded Auth accounts, but they are mapped to `admin` profile role until dedicated Client and Executive auth routing is added.
3. The UAT platform is `Cape Town Operations` for `Acme Manufacturing`.
