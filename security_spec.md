# Estasharni Security Specification

## Data Invariants
1. A **User** must have a role (`client`, `doctor`, or `admin`).
2. A **DoctorProfile** must be linked to a valid User ID and have a status (`pending`, `approved`, `rejected`).
3. A **Consultation** can only be created by a client for an approved doctor.
4. **Messages** can only be sent by participants of the consultation.
5. **Support Messages** are between a user and the system (admins).
6. **Settings** are read-only for non-admins.

## The Dirty Dozen Payloads (Target: Access Level Violations)
1. **Identity Spoofing**: Client attempts to update their role to 'admin'.
2. **Resource Poisoning**: Anonymous user attempts to create a million-character message.
3. **Privilege Escalation**: Doctor attempts to approve their own registration.
4. **Data Leakage**: Client attempts to read all notifications of another client.
5. **State Shortcutting**: Client attempts to mark a consultation as 'completed' without doctor consent.
6. **Shadow Update**: Attacker adds `isSuperAdmin: true` to their profile.
7. **Cross-User Injection**: Doctor attempts to delete a consultation they don't participate in.
8. **PII Breach**: User attempts to read the email/phone of another user not involved in a consultation.
9. **Notification Hijack**: User marks all system notifications as read.
10. **Settings Sabotage**: Client attempts to change the `platformName`.
11. **Orphaned Writes**: Client creates a consultation for a non-existent doctor ID.
12. **Timestamp Forgery**: User sets `createdAt` to a year into the future.

## Test Runner (Logic Overview)
The `firestore.rules` will encapsulate validations using `isValidId`, `isValidUser`, `isValidDoctorProfile`, etc., combined with `affectedKeys().hasOnly()` gates.
Incoming data will be checked against `request.auth.uid`.
Admin roles will be verified via a `get()` call to a secure `users` collection.
