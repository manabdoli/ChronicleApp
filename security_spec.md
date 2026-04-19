# Chronicle Security Specification

## Data Invariants
1. An Event must always have a valid `userId` matching the authenticated user.
2. `category` must be one of: 'photo', 'email', 'audio', 'note'.
3. `date`, `createdAt`, and `updatedAt` must be valid timestamps.
4. `tags` must be a list of strings and limited in size (max 10 tags).
5. Document IDs must be valid alphanumeric strings.

## The "Dirty Dozen" Payloads (Deny List)
1. Event with no `userId`.
2. Event with `userId` spoofed to another user's ID.
3. Event with `category` set to 'malicious'.
4. Event with 1000 tags (Resource exhaustion).
5. Event with a 1MB title (Denial of Wallet).
6. Updating `createdAt` after document creation.
7. Updating an event owned by someone else.
8. Event with `updatedAt` not equal to `request.time`.
9. Event with `recurring` set to a non-enum value.
10. Event with a document ID containing special characters like `../`.
11. Reading events without being authenticated.
12. Listing all events without filtering by `userId`.
