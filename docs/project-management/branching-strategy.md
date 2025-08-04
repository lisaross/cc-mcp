# CC-MCP Branching Strategy

## Overview

This document defines the branching strategy for CC-MCP development to ensure code quality, traceability, and professional development workflows. All changes must go through pull requests with proper issue tracking.

## Branch Protection Rules

### Main Branch Protection

- **No direct commits** to `main` branch
- All changes must go through **pull requests**
- **Required reviews** before merging
- **Status checks** must pass (CI/CD, tests, linting)
- **Linear history** preferred (squash and merge)

## Branch Types and Naming Conventions

### 1. Feature Branches

**Format:** `feature/[issue-number]-[brief-description]`

**Examples:**

```bash
feature/15-add-security-scanning
feature/23-marketplace-search
feature/7-backup-recovery-system
```

**Usage:**

- New features and enhancements
- User stories from agent workflow
- Major functionality additions
- Always include GitHub issue number for traceability

### 2. Fix Branches  

**Format:** `fix/[issue-number]-[brief-description]`

**Examples:**

```bash  
fix/8-configuration-validation
fix/12-cli-error-handling
fix/19-license-detection-bug
```

**Usage:**

- Bug fixes and defect resolution
- Security patches
- Documentation corrections
- Always include GitHub issue number for traceability

### 3. Release Branches

**Format:** `release/v[version]`

**Examples:**

```bash
release/v1.1.0
release/v2.0.0
release/v2.1.0
```

**Usage:**

- Release preparation and stabilization
- Version bumps and changelog generation
- Final testing before production
- Created from `main` when feature-complete

### 4. Hotfix Branches

**Format:** `hotfix/v[version]-[brief-description]`

**Examples:**

```bash
hotfix/v1.1.1-critical-security-patch
hotfix/v2.0.1-config-corruption-fix
```

**Usage:**

- Critical production fixes
- Security vulnerabilities requiring immediate attention
- Data corruption or loss prevention
- Created from `main`, merged to both `main` and current release

## Workflow Process

### Standard Development Workflow

1. **Create GitHub Issue**
   - Use appropriate issue template
   - Add proper labels (type, priority, size, area)
   - Assign to milestone
   - Add to project board

2. **Create Branch**

   ```bash
   # From main branch
   git checkout main
   git pull origin main
   git checkout -b feature/[issue-number]-[description]
   ```

3. **Development Work**
   - Make focused, atomic commits
   - Write clear commit messages
   - Follow conventional commit format when possible
   - Include issue number in commits: `git commit -m "feat: add security scanning (#15)"`

4. **Create Pull Request**

   ```bash
   # Push branch
   git push origin feature/[issue-number]-[description]
   
   # Create PR with GitHub CLI
   gh pr create --title "[Feature] Brief description (#issue-number)" \
                --body "Closes #[issue-number]" \
                --label "type:feature" \
                --milestone "v2.0 - Security & Recovery"
   ```

5. **Code Review Process**
   - Request reviews from team members
   - Address review feedback
   - Ensure CI/CD checks pass
   - Update documentation if needed

6. **Merge and Cleanup**
   - Use "Squash and merge" for clean history
   - Delete feature branch after merge
   - Verify issue is automatically closed
   - Update project board status

### Agent Workflow Integration

**Batch + Parallel Issue Creation:**

```bash
# After batch-story-generator-agent creates user-stories.md
# Create feature branch for implementation
git checkout -b feature/[milestone]-batch-implementation

# Use github-issues-agent to create all issues in parallel
# Each issue gets proper branch name suggestion in description
```

**Individual Feature Development:**

```bash
# For each GitHub issue created by agents
git checkout -b feature/[issue-number]-[agent-suggested-name]
# Implement the feature following the user story acceptance criteria
# Create PR linking back to the agent-generated issue
```

## Commit Message Standards

### Format

```
type(scope): brief description (#issue-number)

Optional longer description explaining the change in more detail.

- List any breaking changes
- Reference related issues
- Include any necessary migration steps
```

### Types

- `feat`: New features
- `fix`: Bug fixes  
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without functionality changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `ci`: CI/CD configuration changes

### Examples

```bash
git commit -m "feat: add MCP security vulnerability scanning (#23)

Implements real-time security checking against CVE database
for all MCP installations. Warns users of critical vulnerabilities
and blocks installation with --force override option.

Closes #23"

git commit -m "fix: resolve configuration file corruption issue (#45)

Adds atomic write operations and backup creation before
any configuration changes to prevent data loss.

Fixes #45"

git commit -m "docs: update installation guide with new requirements (#12)"
```

## Branch Lifecycle Management

### Feature Branch Lifecycle

1. **Creation**: From up-to-date `main` branch
2. **Development**: Regular commits with clear messages
3. **Synchronization**: Regular rebasing with `main` (optional)
4. **Pull Request**: When feature is complete
5. **Review**: Code review and CI/CD validation
6. **Merge**: Squash and merge to `main`
7. **Cleanup**: Delete merged feature branch

### Release Branch Lifecycle

1. **Creation**: From `main` when feature-complete
2. **Stabilization**: Bug fixes and final testing
3. **Version Bump**: Update version numbers and changelog
4. **Tag Creation**: Git tag for release version
5. **Merge**: To `main` with release tag
6. **Deployment**: Automated release process

## Integration with Project Management

### GitHub Issue Integration

- **Every branch** must have corresponding GitHub issue
- **Issue numbers** included in branch names and commit messages
- **Automatic closing** via "Closes #issue-number" in PR description
- **Traceability** from roadmap → user story → issue → branch → PR → merge

### Project Board Integration

- Issues move through board columns automatically
- Branch creation moves issue to "In Progress"
- PR creation moves to "Review"
- Merge moves to "Done"

### Milestone Tracking

- All issues assigned to appropriate milestone
- Release branches align with milestone completion
- Automatic milestone progress tracking

## Quality Gates

### Pre-Merge Requirements

- [ ] **GitHub issue exists** and is properly labeled
- [ ] **Branch naming** follows conventions
- [ ] **Commit messages** are clear and include issue numbers
- [ ] **PR description** links to issue and explains changes
- [ ] **Code review** completed and approved
- [ ] **CI/CD checks** pass (tests, linting, builds)
- [ ] **Documentation** updated if needed
- [ ] **Breaking changes** documented

### Post-Merge Actions

- [ ] **Feature branch deleted** to keep repository clean
- [ ] **Issue automatically closed** via PR link
- [ ] **Project board updated** to reflect completion
- [ ] **Milestone progress** updated
- [ ] **Integration testing** in staging environment

## Emergency Procedures

### Hotfix Process

1. **Critical issue identified** in production
2. **Create hotfix branch** from `main`: `hotfix/v1.1.1-critical-fix`
3. **Fix implementation** with minimal changes
4. **Expedited review** with security/senior developer
5. **Merge to main** and tag new version
6. **Cherry-pick to release** branch if applicable
7. **Emergency deployment** following security protocols

### Rollback Process

1. **Identify problematic merge** or release
2. **Create rollback branch** from last known good state
3. **Revert changes** or apply inverse patches
4. **Fast-track review** and approval
5. **Emergency merge** and deployment
6. **Post-mortem analysis** and prevention measures

## Tools and Automation

### GitHub CLI Integration

```bash
# Create feature branch with issue
gh issue create --title "Add security scanning" --label "type:feature,priority:high"
git checkout -b feature/$(gh issue list --limit 1 --json number --jq '.[0].number')-security-scanning

# Create PR from branch
gh pr create --fill --label "type:feature" --milestone "v2.0 - Security & Recovery"
```

### Agent Workflow Commands

```bash
# Use agents to create multiple issues then branches
batch-story-generator-agent → user-stories.md
github-issues-agent → multiple GitHub issues
# Then create branches for each issue in parallel
```

This branching strategy ensures professional development practices, complete traceability from roadmap to deployment, and seamless integration with our agent-driven project management workflow.
