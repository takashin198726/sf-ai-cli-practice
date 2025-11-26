#!/usr/bin/env python3
"""
Multi-Agent Orchestrator for Spec-Driven Development with Jujutsu

This script coordinates multiple AI agents (Claude, Codex, Gemini) working in parallel
on the same specification, then synthesizes their outputs using a judge agent.

Architecture: Trident Topology (3 parallel agents + 1 judge)
VCS: Jujutsu (jj) with first-class conflicts
"""

import subprocess
import sys
import json
import os
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass
import argparse


@dataclass
class AgentConfig:
    """Configuration for an AI agent."""
    name: str
    workspace: str
    role: str
    command: List[str]
    prompt_template: str


@dataclass
class OrchestratorConfig:
    """Configuration for the orchestrator."""
    project_root: Path
    spec_file: Path
    main_workspace: Path
    agents: List[AgentConfig]
    end_phase: int = 4
    non_interactive: bool = False


class JujutsuError(Exception):
    """Exception raised for Jujutsu command failures."""
    pass


class Orchestrator:
    """Main orchestrator for multi-agent workflow."""

    def __init__(self, config: OrchestratorConfig):
        self.config = config
        self.base_revision: Optional[str] = None

    def run_jj(self, args: List[str], cwd: Optional[Path] = None, capture=True) -> subprocess.CompletedProcess:
        """Run a jujutsu command and return the result.

        Args:
            args: Command arguments (without 'jj' prefix)
            cwd: Working directory (defaults to project root)
            capture: Whether to capture output

        Returns:
            CompletedProcess result

        Raises:
            JujutsuError: If command fails
        """
        if cwd is None:
            cwd = self.config.project_root

        cmd = ["jj"] + args
        print(f"[JJ] Running: {' '.join(cmd)} (in {cwd})")

        try:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=capture,
                text=True,
                check=True
            )
            return result
        except subprocess.CalledProcessError as e:
            raise JujutsuError(f"Jujutsu command failed: {e.stderr}") from e

    def phase1_initialize(self):
        """Phase 1: Initialize repository and create workspaces."""
        print("\n" + "=" * 60)
        print("PHASE 1: Initialization & Spec Injection")
        print("=" * 60)

        # Check if spec file exists
        if not self.config.spec_file.exists():
            raise FileNotFoundError(f"Specification file not found: {self.config.spec_file}")

        # Initialize Jujutsu repository if not already initialized
        jj_dir = self.config.project_root / ".jj"
        if not jj_dir.exists():
            print("Initializing Jujutsu repository...")
            self.run_jj(["git", "init", "."])

        # Commit the spec file
        print(f"Committing specification: {self.config.spec_file}")
        self.run_jj(["new", "-m", "Initial commit: Add Specification"])

        # Get the base revision (current commit)
        result = self.run_jj(["log", "-T", "change_id", "--no-graph", "--limit", "1", "-r", "@"])
        self.base_revision = result.stdout.strip()
        print(f"Base revision: {self.base_revision}")

        # Create workspaces for each agent
        for agent in self.config.agents:
            workspace_path = self.config.project_root / agent.workspace
            if not workspace_path.exists():
                print(f"Creating workspace: {agent.workspace} for {agent.name}")
                self.run_jj(["workspace", "add", str(workspace_path), "-r", self.base_revision])
            else:
                print(f"Workspace already exists: {agent.workspace}")

    def phase2_parallel_implementation(self):
        """Phase 2: Run agents in parallel."""
        print("\n" + "=" * 60)
        print("PHASE 2: Parallel Implementation")
        print("=" * 60)

        # Read specification
        with open(self.config.spec_file, 'r') as f:
            spec_content = f.read()

        processes = []

        for agent in self.config.agents:
            print(f"\n[{agent.name}] Starting {agent.role}...")
            workspace_path = self.config.project_root / agent.workspace

            # Ensure workspace is up to date
            try:
                self.run_jj(["workspace", "update-stale"], cwd=workspace_path)
            except JujutsuError:
                pass  # Ignore if not stale or other error, let next command fail if critical

            # Create new change in agent's workspace
            self.run_jj(
                ["new", "-m", f"feat({agent.name.lower()}): Implementation based on spec"],
                cwd=workspace_path
            )

            # Prepare agent-specific prompt
            prompt = agent.prompt_template.format(spec_content=spec_content)

            # Start agent process
            print(f"[{agent.name}] Command: {' '.join(agent.command)}")
            
            if agent.name == "Antigravity":
                print(f"\n[ACTION REQUIRED] Please implement the specification in {workspace_path}")
                print("1. Open a new terminal or use your IDE.")
                print(f"2. Go to {workspace_path}")
                print("3. Implement the requirements in spec.md")
                print("4. Commit your changes using 'jj new' or 'jj commit'")
                
                if self.config.non_interactive:
                    print("[NON-INTERACTIVE] Skipping pause. Assuming implementation will be done separately or is already done.")
                else:
                    input("Press Enter when you have finished implementation...")
            else:
                # Placeholder for other agents
                subprocess.run(agent.command, cwd=workspace_path)

        # Wait for all agents to complete (placeholder)
        print("\n[NOTE] In actual implementation, this would wait for all agent processes to complete.")
        print("[NOTE] For now, you need to manually run agents in their respective workspaces.")

        # For actual implementation:
        # for name, proc in processes:
        #     print(f"Waiting for {name}...")
        #     proc.wait()
        #     if proc.returncode != 0:
        #         print(f"[ERROR] {name} failed with code {proc.returncode}")

    def phase3_convergence(self):
        """Phase 3: Merge all agent outputs."""
        print("\n" + "=" * 60)
        print("PHASE 3: Convergence & Conflict Materialization")
        print("=" * 60)

        # Collect change IDs from each agent workspace
        change_ids = []
        for agent in self.config.agents:
            workspace_path = self.config.project_root / agent.workspace
            # Ensure workspace is up to date
            try:
                self.run_jj(["workspace", "update-stale"], cwd=workspace_path)
            except JujutsuError:
                pass

            result = self.run_jj(
                ["log", "-T", "change_id", "--no-graph", "--limit", "1", "-r", "@"],
                cwd=workspace_path
            )
            change_id = result.stdout.strip()
            change_ids.append(change_id)
            print(f"[{agent.name}] Change ID: {change_id}")

        # Switch to main workspace and create merge commit
        print(f"\nMerging {len(change_ids)} agent outputs...")
        
        # Ensure main workspace is up to date
        try:
            self.run_jj(["workspace", "update-stale"], cwd=self.config.main_workspace)
        except JujutsuError:
            pass

        merge_cmd = ["new"] + change_ids + ["-m", "merge: Integrate agent swarm outputs"]
        self.run_jj(merge_cmd, cwd=self.config.main_workspace)

        # Check for conflicts
        try:
            result = self.run_jj(["resolve", "--list"], cwd=self.config.main_workspace)
            conflicts = result.stdout.strip()
        except JujutsuError:
            conflicts = ""  # Assume no conflicts if command fails (or check specific error)

        if conflicts:
            print(f"\nConflicts detected (as expected):")
            print(conflicts)
            print("\nReady for Phase 4: Synthesis")
        else:
            print("\nNo conflicts detected. All agents produced identical or compatible code.")

    def phase4_synthesis(self):
        """Phase 4: Use judge agent to resolve conflicts and synthesize final code."""
        print("\n" + "=" * 60)
        print("PHASE 4: AI-Powered Synthesis")
        print("=" * 60)

        # Get list of conflicted files
        try:
            result = self.run_jj(["resolve", "--list"], cwd=self.config.main_workspace)
            conflicts = result.stdout.strip()
        except JujutsuError:
            conflicts = ""

        if not conflicts:
            print("No conflicts to resolve. Synthesis complete.")
            return

        print(f"Conflicted files:\n{conflicts}")

        # In actual implementation, you would:
        # 1. Read each conflicted file
        # 2. Extract conflict markers with agent attributions
        # 3. Send to judge agent with synthesis prompt
        # 4. Apply judge's resolution
        # 5. Mark conflicts as resolved

        print("\n[NOTE] Judge agent implementation:")
        print("1. Read conflicted files from ws-main/")
        print("2. Parse conflict markers (snapshot style)")
        print("3. Send to judge LLM (e.g., OpenAI o1, Gemini Pro Reasoning)")
        print("4. Judge synthesizes best approach from all three")
        print("5. Apply resolved code and run tests")

        judge_prompt = """
You are a senior software architect. Three engineers (Claude, Codex, Gemini) have
implemented the same specification with different approaches:

- Side #1 (Claude): Safety-first, well-documented, defensive programming
- Side #2 (Codex): Performance-optimized, efficient algorithms
- Side #3 (Gemini): Modern, innovative, using latest features

Your task:
1. Analyze all three implementations in the conflict markers
2. Extract the best elements from each
3. Synthesize a final implementation that combines:
   - Claude's safety and clarity
   - Codex's performance
   - Gemini's modern approach (if APIs are valid)
4. Remove all conflict markers and output clean code
5. Ensure the result meets the original specification

For each file with conflicts, provide the resolved code.
"""
        print(f"\nJudge prompt template:\n{judge_prompt}")

    def run_workflow(self, start_phase: int = 1):
        """Run the complete multi-agent workflow.

        Args:
            start_phase: Phase to start from (1-4)
        """
        try:
            if start_phase <= 1 and self.config.end_phase >= 1:
                self.phase1_initialize()
            if start_phase <= 2 and self.config.end_phase >= 2:
                self.phase2_parallel_implementation()
            if start_phase <= 3 and self.config.end_phase >= 3:
                self.phase3_convergence()
            if start_phase <= 4 and self.config.end_phase >= 4:
                self.phase4_synthesis()

            print("\n" + "=" * 60)
            print("Workflow complete!")
            print("=" * 60)

        except Exception as e:
            print(f"\n[ERROR] Workflow failed: {e}", file=sys.stderr)
            sys.exit(1)


def create_default_config(project_root: Path) -> OrchestratorConfig:
    """Create default orchestrator configuration.

    Args:
        project_root: Root directory of the project

    Returns:
        OrchestratorConfig with default settings
    """
    agents = [
        AgentConfig(
            name="Antigravity",
            workspace="ws-claude",
            role="The Architect",
            command=["echo", "Antigravity (You) should implement the spec in ws-claude now."],
            prompt_template="{spec_content}\n\n[Antigravity] Please implement the specification in ws-claude/force-app/main/default/classes/."
        ),
        AgentConfig(
            name="Codex",
            workspace="ws-codex",
            role="The Optimizer",
            command=["echo", "Skipping Codex execution (Placeholder)"],
            prompt_template="{spec_content}\n\nImplement with focus on performance and algorithmic efficiency."
        ),
        AgentConfig(
            name="Gemini",
            workspace="ws-gemini",
            role="The Innovator",
            command=["echo", "Skipping Gemini execution (Placeholder)"],
            prompt_template="{spec_content}\n\nImplement with modern, innovative approaches using latest features."
        ),
    ]

    return OrchestratorConfig(
        project_root=project_root,
        spec_file=project_root / "spec.md",
        main_workspace=project_root / "ws-main",
        agents=agents,
        end_phase=4,
        non_interactive=False
    )


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Multi-Agent Orchestrator for Spec-Driven Development"
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Project root directory (default: current directory)"
    )
    parser.add_argument(
        "--spec",
        type=Path,
        help="Path to specification file (default: spec.md in project root)"
    )
    parser.add_argument(
        "--start-phase",
        type=int,
        default=1,
        choices=[1, 2, 3, 4],
        help="Phase to start from (1=init, 2=implement, 3=merge, 4=synthesize)"
    )
    parser.add_argument(
        "--end-phase",
        type=int,
        default=4,
        choices=[1, 2, 3, 4],
        help="Phase to end at (default: 4)"
    )
    parser.add_argument(
        "--non-interactive",
        action="store_true",
        help="Run in non-interactive mode (skip pauses)"
    )

    args = parser.parse_args()

    # Create configuration
    config = create_default_config(args.project_root)
    if args.spec:
        config.spec_file = args.spec
    config.end_phase = args.end_phase
    config.non_interactive = args.non_interactive

    # Create and run orchestrator
    orchestrator = Orchestrator(config)
    orchestrator.run_workflow(start_phase=args.start_phase)


if __name__ == "__main__":
    main()
