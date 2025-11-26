---
description: Implement a specification using the multi-agent workflow
---

# Implement Specification Workflow

This workflow guides the agent to implement a specification using the multi-agent orchestrator.

## 1. Initialize

Initialize the repository and workspaces.

```bash
// turbo
npm run agent:init
```

## 2. Read Specification

Read the specification file to understand requirements.

```bash
// turbo
cat spec.md
```

## 3. Implement

Implement the requirements in the `ws-claude` workspace.
_Note: The orchestrator is skipped here because we are doing the work manually/agentically._

## 4. Register Implementation

Run the implementation phase of the orchestrator in non-interactive mode to register the changes in `ws-claude`.

```bash
// turbo
npm run agent:implement
```

## 5. Merge and Synthesize

Merge the changes from all agents and synthesize the final result.

```bash
// turbo
npm run agent:merge
```
