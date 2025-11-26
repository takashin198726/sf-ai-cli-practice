# Jujutsu Integration Guide for Claude Code

> **Important**: This project uses Jujutsu (jj) for local version control while maintaining Git compatibility for GitHub integration.

## Overview

This project employs a hybrid version control approach:

- **Local development**: Jujutsu (jj) commands
- **Remote repository**: GitHub (Git)
- **Colocated setup**: Both `.git` and `.jj` directories exist and are synchronized

## Core Principles for Claude Code

### 1. **Respect User's Workflow Choice**

The user prefers Jujutsu for local operations. As Claude Code, you should:

- ✅ **PREFER**: Continue using Git commands for commits and PR creation (as you normally do)
- ✅ **REASON**: Jujutsu and Git share the same `.git` directory, so Git operations are automatically visible to Jujutsu
- ✅ **BENEFIT**: Your standard Git workflow remains unchanged while respecting the user's Jujutsu preference
- ⚠️ **AWARE**: User may be working with multiple concurrent changes in Jujutsu

### 2. **When to Use Jujutsu Commands**

You should **NOT** proactively use Jujutsu commands unless:

- The user explicitly requests Jujutsu-specific operations
- You need to inspect the Jujutsu state (e.g., `jj status`, `jj log`)
- User asks for help with Jujutsu workflows

**Default behavior**: Continue using Git commands as usual.

### 3. **Coexistence Model**

```
┌────────────────────────────────────────────┐
│  Claude Code Actions (Git commands)        │
│  ├─ git add / git commit                   │
│  ├─ git push                               │
│  └─ gh pr create                           │
└────────────────────────────────────────────┘
                    ↕ (synchronized via .git)
┌────────────────────────────────────────────┐
│  User Actions (Jujutsu commands)           │
│  ├─ jj new (create changes)                │
│  ├─ jj squash (organize history)           │
│  └─ jj abandon (discard experiments)       │
└────────────────────────────────────────────┘
```

## Practical Guidelines

### Creating Commits

**Standard approach (Recommended for Claude Code):**

```bash
# Continue using your normal Git workflow
git add .
git commit -m "feat: implement new feature"
git push origin feature-branch
```

**Jujutsu-aware alternative (Only if user requests):**

```bash
# Check Jujutsu state first
jj status

# Create a new change
jj new -m "feat: implement new feature"

# Push using Jujutsu
jj git push --branch feature-branch
```

### Creating Pull Requests

**Continue your standard approach:**

```bash
# Your normal PR creation workflow
gh pr create --title "..." --body "..."
```

**Note**: PRs created via Git/GitHub CLI work perfectly with Jujutsu repositories.

### Checking Repository State

When gathering context about the repository state:

```bash
# Standard Git commands work fine
git status
git log
git diff

# Jujutsu equivalents (if you want to see the user's perspective)
jj status
jj log
jj diff
```

## Understanding User's Jujutsu Workflow

The user is using Jujutsu to:

1. **Experiment with multiple approaches simultaneously**

   - User may have multiple concurrent changes
   - They can compare different implementations
   - They'll abandon unsuccessful attempts

2. **Edit history flexibly**

   - User can reorganize commits after creation
   - They can squash or split changes easily
   - History cleanup happens before pushing

3. **Leverage AI for parallel exploration**
   - User wants to try multiple solutions with your help
   - Each approach is a separate Jujutsu change
   - User will select the best approach and abandon others

## What This Means for You

### When Writing Code

- **Be aware**: The user might ask you to implement multiple versions of the same feature
- **Don't worry**: Just implement what's requested; the user handles version management
- **Be helpful**: You can suggest alternative approaches, and the user can track them in Jujutsu

### When Creating Commits

- **Keep doing**: Use your standard Git commit workflow
- **Don't overthink**: Jujutsu will automatically sync with Git
- **Be clear**: Write good commit messages as always

### When Creating PRs

- **No changes needed**: Your PR creation workflow remains the same
- **Trust the sync**: Jujutsu changes pushed to GitHub appear as normal Git commits
- **Clean history**: User may clean up history before pushing, resulting in cleaner PRs

## Common Scenarios

### Scenario 1: User Asks for Multiple Implementations

**User**: "Try implementing this feature using both approach A and B"

**Your action**:

1. Implement approach A normally (Git commit)
2. The user will use `jj new @- -m "approach B"` to create a parallel change
3. Implement approach B (Git will see it as new commits)
4. User compares and chooses the best one

### Scenario 2: User Has Uncommitted Changes

**When you see**:

```bash
$ git status
# Shows modified files
```

**Understand that**:

- In Jujutsu, working copy changes are automatically tracked
- User might be working on a Jujutsu change
- You can proceed with Git operations normally

### Scenario 3: User Asks About Jujutsu State

**User**: "What's the jj status?"

**Your action**:

```bash
jj status
# Report the output to the user
```

### Scenario 4: Merge Conflicts

**If conflicts occur**:

- Jujutsu has better conflict resolution tools
- Suggest the user handle conflicts if they prefer Jujutsu
- Or proceed with standard Git conflict resolution

## Files and Directories

### Files You Created

- `.jjignore`: Jujutsu's equivalent of `.gitignore` (already synced with `.gitignore`)
- `docs/jujutsu-workflow.md`: User-facing workflow documentation

### Directories to Ignore

- `.jj/`: Jujutsu's internal directory (similar to `.git/`)

### Configuration

- User has configured their name/email in Jujutsu
- Git and Jujutsu configurations are separate but should match

## Troubleshooting

### If Git and Jujutsu Seem Out of Sync

```bash
# Jujutsu can import Git changes
jj git import

# Jujutsu can export to Git
jj git export
```

**Note**: In colocated repos, this usually happens automatically.

### If User Reports Issues with Your Commits

- Your Git commits might conflict with Jujutsu's working copy
- User can resolve this with `jj status` and `jj resolve`
- In most cases, synchronization is automatic

## Key Takeaways

1. **Continue using Git commands** for your standard workflows
2. **Jujutsu and Git coexist** peacefully in this project
3. **User manages version control** using Jujutsu
4. **Your commits via Git** are automatically visible in Jujutsu
5. **No breaking changes** to your normal operating procedures

## When to Reference This Guide

- User mentions Jujutsu in their request
- You notice `.jj/` directory in the project
- User asks for multiple parallel implementations
- Conflicts or sync issues arise
- You're unsure whether to use Git or Jujutsu commands

## Resources

- [Jujutsu Workflow Guide](../docs/jujutsu-workflow.md) - User-facing documentation
- [Jujutsu Official Docs](https://martinvonz.github.io/jj/) - External reference

---

**Summary**: Use your normal Git workflow. Jujutsu is the user's tool for managing local experimentation and history editing. The two systems work together seamlessly.
