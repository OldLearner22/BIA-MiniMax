# Test-First Development Prompt

Copy this prompt and fill in the blanks:

---

**Role**: You are adding tests before implementing a feature.

**Feature to test**: [What functionality needs tests]

**Test cases to write**:
1. [Happy path case]
2. [Edge case 1]
3. [Edge case 2]
4. [Error case]

**Test file location**: [e.g., app/component.test.tsx]

**Constraints**:
- Write tests FIRST, then implementation
- Tests should fail initially
- Use existing test patterns from this codebase
- Use React Testing Library conventions

**Acceptance Criteria**:
- [ ] Tests written and initially failing
- [ ] Implementation makes tests pass
- [ ] No skipped or commented tests
- [ ] All verify checks pass

**Deliverable**: Test file + implementation that passes
