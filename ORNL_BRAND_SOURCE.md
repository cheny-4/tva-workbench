# ORNL branding source

Retrieved November 6, 2026, from official ORNL public web assets.

## Logo

- Page: https://www.ornl.gov/
- Element: the complete inline `<svg id="ornl">` inside `<a class="ornl-logo">` in the official brand header.
- Local asset: `public/assets/brand/ornl-logo.svg`.
- ViewBox: `0 0 100 24.06`.
- SHA256: `60ff1b82680f04daf6095b4e931f2390bd12292189410aa3404c8d1ba33a8efe`.
- The SVG was extracted without changing its paths, dimensions, or presentation attributes. It contains no scripts or external resource references.
- The original SVG does not declare a fill. As an external image it renders black by SVG default. ORNL's homepage applies its white text token through the containing page CSS for the green header. Preserve its aspect ratio and clear space.

## Palette evidence

Official stylesheet: https://www.ornl.gov/wp-content/themes/root/build/css/styles.css

The current official source defines `--color-brand-primary:#00662c`, with `--color--brand--primary:var(--color-brand-primary)`. Its brand header uses this primary color. Other source tokens include `--color-primary-rich:#04682a` and `--color-primary-strong:#0f8723` in the original token scale.

These are verified observations of ORNL's live official web implementation, not a claim to reproduce a separate complete corporate brand manual.
