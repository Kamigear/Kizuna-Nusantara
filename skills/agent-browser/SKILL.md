---
name: agent-browser
description: Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating any browser task.
allowed-tools: Bash(agent-browser:*)
hidden: true
---

# agent-browser

Fast browser automation CLI for AI agents. Chrome/Chromium via CDP with accessibility-tree snapshots and compact `@eN` element refs.

Install: `npm i -g agent-browser && agent-browser install`

## Start here

This file is a discovery stub, not the usage guide.
Before running any `agent-browser` command, load the actual workflow content from the CLI:

```bash
agent-browser skills get core             # start here: the loop, waits, common tasks, troubleshooting
```

The core guide ends with a table of references to load for detailed commands and flags.
Use `agent-browser skills get core --full` only when you need every reference at once; it is several times larger.

## Specialized skills

```bash
agent-browser skills get electron          # Electron desktop apps
agent-browser skills get slack             # Slack workspace automation
agent-browser skills get dogfood           # Exploratory testing / QA / bug hunts
agent-browser skills get derive-client     # Record a HAR, derive a standalone API client
agent-browser skills get webmcp-gen        # Build and validate WebMCP tools for a page
agent-browser skills get vercel-sandbox    # agent-browser inside Vercel Sandbox microVMs
agent-browser skills get protected-vercel-deployments
agent-browser skills get agentcore         # AWS Bedrock AgentCore cloud browsers
```

Run `agent-browser skills list` to see everything available on the installed version.

Upstream: https://github.com/vercel-labs/agent-browser
