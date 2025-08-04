# Agent Workflow Patterns for CC-MCP

## Overview

This document outlines how to chain Claude Code agents for efficient project management workflows, from roadmap planning to GitHub issue management and release notes.

## Available Agents

### Core PM Agents Created

1. **epic-breakdown-agent** - Converts large features into epic → story → task hierarchies
2. **user-story-agent** - Creates high-quality user stories with acceptance criteria
3. **github-issues-agent** - Formats and creates GitHub issues with proper metadata
4. **changelog-agent** - Generates release notes from completed GitHub issues/PRs

### Existing Claude Code Agents

- **project-coordinator** - Shape Up methodology and sprint planning
- **feature-developer** - Implements features from stories/specifications
- **automation-builder** - Creates GitHub Actions and workflow automation

## Agent Chaining Workflows

### 1. Batch + Parallel Roadmap → GitHub Issues Workflow ⚡

**Enhanced Chain**: `epic-breakdown-agent` → `batch-story-generator-agent` → **PARALLEL** `github-issues-agent`

**Process**:

```
1. Start: Multiple features from roadmap phase (e.g., "Phase 1.1 Public Release")
2. epic-breakdown-agent: Break complex features into epics, stories, and tasks (if needed)
3. batch-story-generator-agent: Process ALL features → Generate structured user-stories.md file
4. Human Review: Validate all user stories before GitHub issue creation
5. PARALLEL github-issues-agent: Create all GitHub issues simultaneously
```

**Example Commands**:

```bash
# Step 1: Break down complex features (if needed)
"Use epic-breakdown-agent to break down the Phase 2 Security & Recovery features from our roadmap"

# Step 2: Generate ALL user stories in batch
"Use batch-story-generator-agent to process these Phase 1.1 features into a structured user stories file"

# Step 3: Create GitHub issues in parallel (multiple calls)
"Use github-issues-agent to create issues from story CC-PHASE11-001 in user-stories.md"
"Use github-issues-agent to create issues from story CC-PHASE11-002 in user-stories.md"
"Use github-issues-agent to create issues from story CC-PHASE11-003 in user-stories.md"
# (All execute simultaneously)
```

**Advantages**:

- ✅ **10x Faster**: Parallel issue creation vs. sequential
- ✅ **Quality Gate**: Human review of all stories before GitHub
- ✅ **Consistency**: All stories generated with same context and standards
- ✅ **Documentation**: Permanent user stories file for reference
- ✅ **Rollback**: Can regenerate issues without losing story work

### 2. Legacy Sequential Workflow (Simple Cases)

**Chain**: `user-story-agent` → `github-issues-agent`

**Use When**: Single feature or simple requirements that don't need batch processing

**Process**:

```
1. Start: Single feature from roadmap
2. user-story-agent: Convert to proper user story format with acceptance criteria
3. github-issues-agent: Create GitHub issue with labels, milestones, and project assignments
```

### 2. Release Management Workflow

**Chain**: `github-issues-agent` → Development → `changelog-agent`

**Process**:

```
1. Issues created and assigned to milestone
2. Development work completed (PRs merged, issues closed)
3. changelog-agent: Generate release notes from completed milestone
```

**Example Commands**:

```bash
# After development work is complete
"Use changelog-agent to generate release notes for CC-MCP v1.1 from completed GitHub issues and PRs"
```

### 3. Sprint Planning Workflow

**Chain**: `epic-breakdown-agent` → `project-coordinator` → `feature-developer`

**Process**:

```
1. epic-breakdown-agent: Break down features for upcoming sprint
2. project-coordinator: Apply Shape Up methodology for sprint planning
3. feature-developer: Implement selected features systematically
```

## Workflow Integration Points

### ⚠️ Agent Handoff Requirements

**epic-breakdown-agent → user-story-agent**:

- Input: Epic breakdown with stories and estimates
- Output format: Clear story descriptions ready for user story formatting
- Handoff note: "These stories need user story formatting with acceptance criteria"

**user-story-agent → github-issues-agent**:

- Input: Complete user stories with acceptance criteria
- Output format: User stories in structured format ready for GitHub
- Handoff note: "These user stories need GitHub issues created with Phase X milestone"

**Development completion → changelog-agent**:

- Input: Completed GitHub milestone with closed issues/PRs
- Context needed: Version number, release date, target audience
- Handoff note: "Generate changelog for v1.X release from this milestone"

## Best Practices

### 1. Sequential Processing

- Complete each agent's work fully before moving to the next
- Validate output quality at each step
- Use clear handoff instructions between agents

### 2. Context Preservation

- Save intermediate outputs as documentation
- Reference previous agent work when chaining
- Maintain traceability from roadmap to implementation

### 3. Quality Gates

- Review epic breakdowns for completeness before story creation
- Validate user stories against INVEST criteria before GitHub issue creation
- Verify GitHub issues have proper labels/milestones before development

### 4. Batch Processing

- Process related features together for consistency
- Create all issues for a milestone in a single session
- Generate changelogs for complete releases, not partial work

## Workflow Templates

### Template: Batch + Parallel Feature Processing (Recommended)

```
1. "Use batch-story-generator-agent to process these [PHASE/EPIC] features from our roadmap into a structured user stories file"
   
2. Review generated user-stories.md file for quality and completeness
   
3. Run parallel github-issues-agent commands:
   - "Use github-issues-agent to create issues from story [ID-001] in user-stories.md"
   - "Use github-issues-agent to create issues from story [ID-002] in user-stories.md"
   - "Use github-issues-agent to create issues from story [ID-003] in user-stories.md"
   (Execute all simultaneously for maximum speed)
```

### Template: Single Feature Processing (Simple Cases)

```
1. "Use user-story-agent to convert this [FEATURE] from our roadmap into a proper user story with acceptance criteria"
   
2. "Use github-issues-agent to create a GitHub issue from this user story, assigning it to the [MILESTONE] milestone with appropriate labels"
```

### Template: Release Notes Generation

```
1. "Use changelog-agent to generate release notes for CC-MCP v[VERSION] from the completed [MILESTONE] milestone"
   
2. Review and edit generated content for:
   - User-friendly language
   - Marketing messaging alignment
   - Technical accuracy
```

## Success Metrics

### Batch + Parallel Workflow

- **Efficiency**: Complete roadmap phase → GitHub issues in under 15 minutes
- **Throughput**: 10+ issues created simultaneously vs. sequential processing
- **Quality**: All user stories meet INVEST criteria consistently
- **Consistency**: All GitHub issues follow proper labeling taxonomy
- **Completeness**: No manual rework needed on agent outputs
- **Review Gate**: 100% human validation of stories before GitHub issue creation

### Legacy Sequential Workflow

- **Efficiency**: Single roadmap feature → GitHub issue in under 5 minutes
- **Quality**: User stories meet INVEST criteria consistently

## Next Steps

1. **Restart Required**: Run `claude -c` to activate new batch-story-generator-agent and enhanced github-issues-agent
2. **Test Batch Workflow**: Process CC-MCP Phase 1.1 features using the new batch + parallel approach
3. **Validate Parallel Execution**: Confirm multiple github-issues-agent instances can run simultaneously
4. **Performance Measurement**: Compare batch vs. sequential processing times
