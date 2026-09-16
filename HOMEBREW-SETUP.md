# Homebrew setup

This is a clone of [mindsocket/brewfather-mcp](https://github.com/mindsocket/brewfather-mcp) with two local additions:

- `taplist/`: public Astro "what's on tap" page, deployed to Netlify (see `taplist/README.md`)
- this file

Everything else is upstream, untouched, so pulling updates stays conflict-free.

## 1. Brewfather API keys

Brewfather → **Settings → API → Generate API Key**.

- **For Claude (recipe planning):** read access to recipes, batches and inventory. Add edit scopes only if you want Claude to update inventory or batch values.
- **For Netlify (tap list):** a second key with read access to batches only.

## 2. Use the MCP server in Claude Desktop (Windows)

Install [uv](https://docs.astral.sh/uv/) if you don't have it (PowerShell):

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Then, from this folder:

```powershell
uv sync
uv run --env-file .env brewfather-cli auth status   # confirms the keys in .env work
```

`uv sync` downloads Python 3.13 automatically if needed.

Add this to `%APPDATA%\Claude\claude_desktop_config.json` and restart Claude Desktop:

```json
{
  "mcpServers": {
    "brewfather": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\Users\\kepow\\Documents\\repos\\brewfather-mcp",
        "run",
        "brewfather-mcp"
      ]
    }
  }
}
```

The server reads your keys from `.env` in this folder, so they don't need to go in the config.

If Claude Desktop can't find `uv`, use its full path, e.g. `"C:\\Users\\kepow\\.local\\bin\\uv.exe"` (check with `where.exe uv`).

Things to ask Claude once it's connected:

- "What could I brew with what's in my inventory right now?"
- "Plan a 20 L oatmeal stout using hops I already have, and tell me what I'd need to buy."
- "Compare my last three IPA batches: attenuation, efficiency, and what changed."

## 3. Git

Remotes are set up as:

- `upstream` → mindsocket/brewfather-mcp (pull updates from here)
- You're on `main`, with `taplist/` and this file not yet committed.

To deploy the tap list you'll need your own GitHub repo. Either fork on GitHub, or create an empty repo, then:

```bash
git add taplist HOMEBREW-SETUP.md
git commit -m "Add tap list site"
git remote add origin https://github.com/<you>/brewfather-mcp.git
git push -u origin main
```

Pulling upstream changes later:

```bash
git fetch upstream
git merge upstream/main
```
