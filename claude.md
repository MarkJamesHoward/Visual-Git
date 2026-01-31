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

- `/cli` - Command line application (C# .NET)
- `/web` - Website (Astro framework)
- `/api` - Backend API (C# .NET)

## Additional Documentation

- See [web/claude.md](web/claude.md) for website-specific development notes (mimic.css workflow, styling conventions)
