# ORNL and Genesis Mission branding

The interface embeds original logo artwork locally so it remains available during an offline laptop presentation. Logos are displayed as separate institutional identities, at their original proportions, without redrawing or recoloring their paths/pixels.

## Oak Ridge National Laboratory

- Source page: https://www.ornl.gov/
- Original homepage SVG wordmark: `public/assets/brand/ornl-logo.svg`.
- Source color stylesheet: https://www.ornl.gov/wp-content/themes/root/build/css/styles.css
- Observed official website tokens: primary `#00662c`, secondary `#00454d`, body text `#2c2c2c`, white `#ffffff`.
- SVG SHA-256: `60ff1b82680f04daf6095b4e931f2390bd12292189410aa3404c8d1ba33a8efe`.

The extracted SVG retains the source paths and viewBox. It renders in its default black on the white header. ORNL green is used for the interface’s primary actions, selection, status and prediction line.

## Genesis Mission

- Source page: https://www.energy.gov/undersecretaryforscience/genesis-mission/genesis-mission
- Original asset: https://www.energy.gov/sites/default/files/2026-03/Genesis_Logomark%20-%20Black.png
- Local preferred mark: `public/assets/brand/genesis-mission-black.png`.
- SHA-256: `79c4eaf970b51f307cd7f88f76a70be22cac71d634edde64ae85911f25644f3a`.
- The current DOE page identifies this as its new black-and-white Genesis logo. The PNG’s transparency and built-in clearspace are preserved. Adjacent “Genesis Mission” text is an interface label.

The source artwork is monochrome. Navy `#13263f`, cool grays and map tints are complementary UI choices, not a claim of a prescribed Genesis Mission color palette. The logo itself remains unchanged. An optional original white-on-black icon is also retained among the source assets.

## Implementation

`public/brand-theme.css` centralizes the interface palette and overrides the earlier prototype colors. Map SVGs use the same CSS variables; prediction charts use ORNL green with a contrasting navy reference series. Status distinctions remain explicit through labels and symbols.

Detailed acquisition records are in `ORNL_BRAND_SOURCE.md` and `GENESIS_BRAND_SOURCE.md`. Assets were checked against the official sources on November 6, 2026.
