/*
 * One-time provisioning for the live runner. Run it once with an Anthropic API
 * key that can reach Managed Agents:
 *
 *   ANTHROPIC_API_KEY=sk-ant-... npm run setup:agent --workspace @elvtr/meetball
 *
 * It creates (or updates) the four objects the runner needs and prints the
 * environment block to paste into Railway. Nothing here belongs in the request
 * path — an agent is a persisted, versioned config, created once and referenced
 * by id from then on.
 *
 * Re-running with MEETBALL_AGENT_ID set UPDATES that agent (a new version)
 * rather than creating a second one, which is what you want after editing the
 * system prompt or the tool list.
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { join, relative } from "node:path"

import Anthropic, { toFile } from "@anthropic-ai/sdk"

import { AGENT_CUSTOM_TOOLS, AGENT_SYSTEM_PROMPT } from "../src/lib/runner/agent-protocol"

/*
 * Upstream MCP endpoints. These are the servers themselves — not the
 * per-session proxy URLs a Claude Code session uses, which are not reusable.
 * Auth lives in the vault, keyed by these URLs; the agent declares no secrets.
 */
const MCP_SERVERS = [
  {
    type: "url" as const,
    name: "planna",
    url: "https://design-mcp-production-54f5.up.railway.app/mcp",
  },
  { type: "url" as const, name: "figma", url: "https://mcp.figma.com/mcp" },
  { type: "url" as const, name: "gamma", url: "https://mcp.gamma.app/mcp" },
]

const SKILL_DIR =
  process.env.MEETBALL_SKILL_DIR ??
  join(homedir(), ".claude", "skills", "synced", "creative-gamma-intro-meetings")

const SKILL_NAME = "creative-gamma-intro-meetings"

function skillFiles(dir: string): string[] {
  const out: string[] = []
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry)
      if (statSync(path).isDirectory()) walk(path)
      else out.push(path)
    }
  }
  walk(dir)
  return out
}

async function main() {
  const client = new Anthropic()

  /* ---- 1. the skill ------------------------------------------------------ */
  let files
  try {
    files = skillFiles(SKILL_DIR)
  } catch {
    throw new Error(
      `Could not read the skill at ${SKILL_DIR}. Point MEETBALL_SKILL_DIR at the ` +
        `directory containing its SKILL.md.`,
    )
  }
  if (!files.some((path) => path.endsWith("SKILL.md"))) {
    throw new Error(`No SKILL.md under ${SKILL_DIR}.`)
  }

  // The API wants every file under one top-level directory, SKILL.md at its root.
  const uploads = await Promise.all(
    files.map((path) =>
      toFile(readFileSync(path), `${SKILL_NAME}/${relative(SKILL_DIR, path)}`),
    ),
  )
  const skill = await client.beta.skills.create({
    files: uploads,
    display_title: "ELVTR Intro Meeting deck",
  })
  console.log(`skill        ${skill.id}  (${files.length} file(s) from ${SKILL_DIR})`)

  /* ---- 2. the environment ----------------------------------------------- */
  // Networking must be open: the run reaches Planna, Figma and Gamma.
  const environment =
    process.env.MEETBALL_ENVIRONMENT_ID
      ? { id: process.env.MEETBALL_ENVIRONMENT_ID }
      : await client.beta.environments.create({
          name: "meetball",
          config: { type: "cloud", networking: { type: "unrestricted" } },
        })
  console.log(`environment  ${environment.id}`)

  /* ---- 3. the agent ----------------------------------------------------- */
  const agentConfig = {
    name: "Meetball — ELVTR intro meetings",
    model: "claude-opus-5",
    system: AGENT_SYSTEM_PROMPT,
    skills: [{ type: "custom" as const, skill_id: skill.id, version: "latest" }],
    mcp_servers: MCP_SERVERS,
    tools: [
      // bash + read/write are required: the skill composites the photos with Pillow.
      { type: "agent_toolset_20260401" as const },
      ...MCP_SERVERS.map((server) => ({
        type: "mcp_toolset" as const,
        mcp_server_name: server.name,
      })),
      ...AGENT_CUSTOM_TOOLS,
    ],
  }

  const existingAgentId = process.env.MEETBALL_AGENT_ID
  const agent = existingAgentId
    ? await client.beta.agents.update(existingAgentId, agentConfig)
    : await client.beta.agents.create(agentConfig)
  console.log(
    `agent        ${agent.id}  version ${agent.version}  ` +
      `(${existingAgentId ? "updated" : "created"})`,
  )

  /* ---- 4. the vault ----------------------------------------------------- */
  const vault = process.env.MEETBALL_VAULT_IDS
    ? { id: process.env.MEETBALL_VAULT_IDS.split(",")[0]!.trim() }
    : await client.beta.vaults.create({ display_name: "Meetball MCP credentials" })
  console.log(`vault        ${vault.id}`)

  console.log(`
Put these in the deploy environment:

  MEETBALL_AGENT_ID=${agent.id}
  MEETBALL_ENVIRONMENT_ID=${environment.id}
  MEETBALL_VAULT_IDS=${vault.id}
  ANTHROPIC_API_KEY=<the key this script just used>

Still to do by hand — the vault is empty, and an empty vault means the run
reaches Planna, Figma and Gamma unauthenticated and fails there:

  Add one credential per MCP server to vault ${vault.id}, keyed by the server URL:
${MCP_SERVERS.map((s) => `    ${s.name.padEnd(7)} ${s.url}`).join("\n")}

  Figma and Gamma are hosted MCP servers and want an OAuth bearer (credential
  type mcp_oauth) — NOT the service's own API key; they are different auth
  systems. design-mcp is yours, so whatever it accepts (static_bearer if it
  takes a plain token).

Until MEETBALL_AGENT_ID and MEETBALL_ENVIRONMENT_ID are both set, Meetball
serves the mock runner and generates nothing.`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
