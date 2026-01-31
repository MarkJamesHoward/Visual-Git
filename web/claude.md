# Visual Git Website - Development Notes

## CSS Framework: Mimic.css

The website uses a **Tailwind-like utility CSS generator** for styling.

**Documentation**: https://mimic-css.net

### Important: DO NOT Edit CSS Files Directly

- `web/src/styles/mimic.css` - **AUTO-GENERATED** ❌ Do not edit manually
- `web/src/styles/mimic.css.js` - **AUTO-GENERATED** ❌ Do not edit manually

### How It Works

1. The build tool scans all `.astro` files for CSS utility classes
2. It automatically generates corresponding CSS rules in `mimic.css` and `mimic.css.js`
3. Only classes that are actually used in the HTML are generated

### Making Style Changes

✅ **DO**: Add or modify utility classes in `.astro` files
```html
<div class="color:c5text1 font-size:sm margin-top:md">
  Content here
</div>
```

❌ **DON'T**: Edit mimic.css or mimic.css.js directly
```css
/* This will be overwritten on next build! */
.color\:c5text1 {
  color: #DDDDDD;
}
```

### Available Utility Patterns

- Colors: `color:c1background1`, `background:c5background2`
- Typography: `font-size:sm`, `font-size:md`, `font-weight:xl`
- Spacing: `margin:md`, `padding:lg`, `margin-top:xl`
- Layout: `display:flex`, `text-align:center`
- Responsive: `lg?font-size:xl` (applies only on large screens)

### Build Process

When you run the build:
1. The tool analyzes all component files
2. Extracts all utility classes
3. Regenerates `mimic.css` with only the classes being used
4. This keeps the CSS file size minimal

### Scoped Styles

For custom styles that don't fit the utility pattern, use scoped `<style>` blocks in Astro files:

```astro
<style>
  .custom-component {
    /* Custom styles here */
  }
</style>
```

## Recent Changes (2026-01-31)

### Homepage Steps 1-3 Refactor
- Restructured terminal cards to only show actual commands
- Removed terminal styling from Step 3 (no commands to show)
- Fixed CSS class typo: `text-decoration:unerline` → `text-decoration:underline`
- Added scoped `.terminal-card-link` styles for consistent link behavior
- Consolidated all instructional text to use site color scheme classes instead of inline styles

### Link Styling
- All links now use class-based styling for consistency
- Terminal card links use scoped `.terminal-card-link` class
- No underlines by default, underline on hover for terminal links
