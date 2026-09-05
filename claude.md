# Visual Git Project - Development Notes

## Git Operations

**IMPORTANT**: Use `tgit` instead of `git` for all git operations in this repository.

```bash
# Use this:
tgit status
tgit add .
tgit commit -m "message"
tgit push

# Not this:
git status  # ❌
```

## Project Structure

- `/electron` - The Visual Git desktop application (Electron + TypeScript). This is the actively maintained solution.
- `/web` - Website (Astro framework), deployed to Azure Static Web Apps

The legacy `/api` (C# .NET backend) and `/cli` (C# .NET command line app) have been removed.

## Additional Documentation

- See [web/claude.md](web/claude.md) for website-specific development notes (mimic.css workflow, styling conventions)
