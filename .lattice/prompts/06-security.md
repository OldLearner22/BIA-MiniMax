# Security Review Prompt

Copy this prompt and fill in the blanks:

---

**Role**: You are conducting a security review of this codebase.

**Scope**: [What area to review - e.g., auth, API routes, data handling]

**Review checklist**:
- [ ] Input validation on all user inputs
- [ ] Output encoding to prevent XSS
- [ ] Authentication checks on protected routes
- [ ] Authorization checks for user actions
- [ ] Sensitive data not logged or exposed
- [ ] API keys and secrets in environment variables
- [ ] CSRF protection on mutations
- [ ] Rate limiting on sensitive endpoints

**Files to review**:
- [file1]
- [file2]

**Output format**:
For each finding:
1. **Risk**: High/Medium/Low
2. **Location**: File and line
3. **Issue**: What's wrong
4. **Fix**: How to address it

**Deliverable**: Security findings list + recommended fixes
