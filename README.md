# Visual Git

A desktop application for visualizing Git internals. See how commits, trees, blobs, branches, and tags are connected in your repository.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Download

Download the latest version for your platform:

| Platform | Download |
|----------|----------|
| Windows (x64) | [visualgit-win-x64.exe](https://github.com/MarkJamesHoward/Visual-Git/releases/latest/download/visualgit-win-x64.exe) |
| macOS (ARM) | [visualgit-mac-arm64.dmg](https://github.com/MarkJamesHoward/Visual-Git/releases/latest/download/visualgit-mac-arm64.dmg) |
| Linux (amd64) | [visualgit-linux-amd64.deb](https://github.com/MarkJamesHoward/Visual-Git/releases/latest/download/visualgit-linux-amd64.deb) |

See all releases: [GitHub Releases](https://github.com/MarkJamesHoward/Visual-Git/releases)

## Features

- Visualize git object graph (commits, trees, blobs)
- View branch and tag relationships
- See HEAD position and remote branches
- Toggle visibility of trees, blobs, and tags
- Keyboard navigation for accessibility (WCAG 2 AA compliant)
- File watcher for live updates when repository changes

## Project Structure

```
/
├── electron/    # Desktop application (Electron + TypeScript)
├── web/         # Website (Astro)
├── cli/         # Command line tool (C# .NET)
├── api/         # Backend API (C# .NET)
└── .github/     # CI/CD workflows
```

## Development

### Electron App

```bash
cd electron
npm install
npm run dev
```

### Website

```bash
cd web
npm install
npm run dev
```

The website runs at `http://localhost:4321`.

### CLI

```bash
cd cli
dotnet build
```

## Testing

### Accessibility Tests

```bash
cd electron
npm run test:a11y
```

Runs axe-core accessibility audit against the application.

### Integration Tests

```bash
cd electron
npm run test:integration
```

Tests that opening a repository correctly renders the git graph visualization.

## Accessibility

Visual Git includes keyboard navigation for the graph visualization:

- **Arrow keys**: Navigate between nodes
- **Tab/Shift+Tab**: Move between node type groups
- **Home/End**: Jump to first/last node
- **Enter/Space**: Select a node
- **Escape**: Clear focus

Screen readers announce node type and name via ARIA live regions.

## License

MIT
