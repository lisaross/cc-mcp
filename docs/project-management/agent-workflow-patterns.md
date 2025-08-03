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

### 1. Roadmap → GitHub Issues Workflow

**Chain**: `epic-breakdown-agent` → `user-story-agent` → `github-issues-agent`

**Process**:
```
1. Start: Feature from roadmap (e.g., "MCP Security System")
2. epic-breakdown-agent: Break into epics, stories, and tasks with estimates
3. user-story-agent: Convert each story into proper user story format with acceptance criteria
4. github-issues-agent: Create GitHub issues with labels, milestones, and project assignments
```

**Example Commands**:
```bash
# Step 1: Break down the feature
"Use epic-breakdown-agent to break down the Phase 2 Security & Recovery features from our roadmap"

# Step 2: Convert to user stories  
"Use user-story-agent to convert these epic stories into proper user stories with acceptance criteria"

# Step 3: Create GitHub issues
"Use github-issues-agent to create GitHub issues from these user stories with proper labels and milestones"
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

### Template: Feature to GitHub Issues
```
1. "Use epic-breakdown-agent to analyze [FEATURE] from our roadmap and create epic/story/task breakdown"
   
2. "Use user-story-agent to convert the [NUMBER] stories from the breakdown into proper user stories with acceptance criteria"
   
3. "Use github-issues-agent to create GitHub issues for these user stories, assigning them to the [MILESTONE] milestone with appropriate labels"
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

- **Efficiency**: Roadmap feature → GitHub issues in under 30 minutes
- **Quality**: User stories meet INVEST criteria consistently
- **Consistency**: All GitHub issues follow proper labeling taxonomy
- **Completeness**: No manual rework needed on agent outputs

## Next Steps

After restart (`claude -c`), test the full workflow with a single CC-MCP roadmap feature to validate agent chaining and output quality.