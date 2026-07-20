# API

## App Routes

Representative routes in app/api:

- create-driver-user
- create-platform-admin
- distance
- reset-password

## Service-first API Strategy

Route handlers should delegate to lib services:

- security checks
- platform context resolution
- business operation execution
- audit/event recording

## API Standards

- Validate required inputs early.
- Always include platform context in tenant operations.
- Return typed payloads for dashboard clients.
- Emit audit events for sensitive actions.
