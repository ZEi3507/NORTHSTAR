You are implementing Task 2: Enhance Messaging Page with Sidebar

## Task Description
- Implement a sidebar in `Messaging.tsx` that fetches and lists the user's connections (partners/followers/following) using `useConnections`.
- List connections to display names of partners/followed users.
- Click to initiate chat.

## Context
- `src/pages/Messaging.tsx`: The Messaging page.
- `src/hooks/useSocial.ts`: Provides `useConnections(uid)`.
- `src/stores/conductorStore.ts`: Provides `uid`.
- Sidebar should show "Connections" with a list of contacts.
- Follow existing patterns in the project (glass-card, tailwind).

## Before You Begin
If you have questions about:
- The requirements or acceptance criteria
- The approach or implementation strategy
- Dependencies or assumptions
- Anything unclear in the task description

**Ask them now.** Raise any concerns before starting work.

## Your Job
Once you're clear on requirements:
1. Implement exactly what the task specifies
2. Write tests (following TDD if task says to)
3. Verify implementation works
4. Commit your work
5. Self-review (see below)
6. Report back

Work from: `C:\Users\user\projects\northstar`

**While you work:** If you encounter something unexpected or unclear, **ask questions**.
It's always OK to pause and clarify. Don't guess or make assumptions.

## Before Reporting Back: Self-Review
Review your work with fresh eyes. Ask yourself:
- Did I fully implement everything in the spec?
- Is this my best work?
- Is the code clean and maintainable?
- Did I avoid overbuilding?
- Did I follow existing patterns in the codebase?

## Report Format
When done, report:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and test results
- Files changed
- Self-review findings (if any)
- Any issues or concerns
