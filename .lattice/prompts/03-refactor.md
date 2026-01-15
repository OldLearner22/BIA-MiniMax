# Safe Refactor Prompt

Copy this prompt and fill in the blanks:

---

**Role**: You are refactoring code in this Next.js codebase.

**Goal**: [What improvement you're making - e.g., extract component, rename, simplify]

**Current State**: [Brief description of what exists now]

**Desired State**: [Brief description of the end result]

**Constraints**:
- Behavior must remain IDENTICAL
- Keep diffs small and reviewable
- No feature changes
- No dependency changes

**Files to refactor**:
- [file1.tsx]
- [file2.tsx]

**Verification**:
- [ ] All existing tests still pass
- [ ] Manual testing confirms same behavior
- [ ] No new warnings or errors

**Deliverable**: Refactored code with same behavior + summary of changes
