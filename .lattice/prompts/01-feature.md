# Feature Implementation Prompt

Copy this prompt and fill in the blanks:

---

**Role**: You are implementing a new feature in this Next.js codebase.

**Goal**: [What the user should be able to do when this is complete]

**Constraints**:
- Use existing patterns from this codebase
- No new dependencies unless explicitly approved
- Must pass all verify checks

**Context**:
- Files to read first: [list relevant files]
- Related components: [list any]
- API endpoints: [list any]

**Files allowed to change**:
- [file1.tsx]
- [file2.tsx]

**Files NOT to touch**:
- [protected files]

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] All verify checks pass

**Non-goals**:
- [What is explicitly out of scope]

**Deliverable**: Working code + brief summary of changes
