# NExT theme.json Setup

English | [日本語](README.md)

A WordPress plugin that lets you view, edit, and manage the active theme's `theme.json` settings from the admin GUI.

---

## Features

- **Never touches theme files** — override settings are stored in the database (`wp_options`)
- **48-item toggle switch UI** — lists theme.json v3 boolean settings by category (including new settings from WordPress 7.1)
- **Viewport width settings (using a WordPress core component)** — set tablet/mobile breakpoint widths in px / em / rem using WordPress core's `UnitControl` (WordPress 7.1+, [Gutenberg #79104](https://github.com/WordPress/gutenberg/pull/79104))
- **OnyX-style sidebar navigation** — switch between categories to review and change settings
- **Custom / theme-default visualization** — overridden items are marked with a badge and can be cleared individually at any time
- **Raw JSON edit mode** — an editor for advanced users to edit JSON directly
- **Theme reference panel** — a read-only view of the theme's original `theme.json`

---

## How it works

theme.json in WordPress has a cascade (priority order):

```
default < blocks < theme < user  ← this plugin injects here
```

The plugin uses the `wp_theme_json_data_user` filter to apply saved settings at the highest priority. The theme's `theme.json` file itself is never modified.

---

## Setting categories

| Category | # of settings | Main settings |
|---|---|---|
| General | 2 | Bulk-enable appearance tools, root-padding-aware alignment |
| Background | 3 | Background image, background size/position (WP 6.5 / 6.6+), gradient background (WP 7.1+) |
| Border | 4 | Color, radius, style, width |
| Color | 12 | Background color, custom color, gradient, palette, per-element (text / link / heading / button / caption) |
| Typography | 13 | Font size, line height, letter spacing, text align, writing mode, etc. |
| Spacing | 5 | Block gap, margin, padding, spacing presets |
| Dimensions | 4 | Min height, aspect ratio, min width (WP 7.1+) |
| Position | 1 | Sticky positioning |
| Shadow | 1 | Default shadow presets |
| Lightbox | 2 | Enable, allow editing (WP 6.4+) |
| Block visibility | 1 | Allow editing show/hide UI (WP 7.1+) |
| Viewport | 2 | Mobile/tablet width (px/em/rem via `UnitControl`, WP 7.1+) |

---

## Requirements

- **WordPress**: 6.6 or later (theme.json v3)
- **PHP**: 8.0 or later

---

## Installation

1. Place the plugin directory at `/wp-content/plugins/NExT-theme-json-setup/`
2. Activate **NExT theme.json Setup** from WordPress admin > Plugins
3. Open admin > Appearance > **theme.json Setup**

---

## Usage

### Change settings with toggle switches

1. Select a category from the sidebar on the left
2. Switch the toggle for the setting you want to change ON / OFF
3. Click the **Save** button at the top right

### Set the viewport width (mobile / tablet)

In the "Viewport" category, turning a toggle ON reveals WordPress core's `UnitControl` component, where you can enter a number and choose a unit (px / em / rem) from the dropdown.

### About setting states

| Display | Meaning |
|---|---|
| Toggle only (no badge) | Showing the theme's or WordPress's default value |
| **Custom** badge present | Currently overridden by this plugin |
| `Theme default: true/false` | The value explicitly set in the theme's `theme.json` |

### Clear an individual override

Clicking the **× Clear** button on a row with the **Custom** badge removes the override for that item only, reverting it to the theme default.

### Reset all overrides

Clicking the **Reset** button in the header removes all changes made by the plugin.

---

## File structure

```
NExT-theme-json-setup/
├── next-theme-json-setup.php                    # Main plugin file
├── includes/
│   ├── class-next-theme-json-override.php       # Filter hook + DB read/write
│   ├── class-next-theme-json-rest-api.php       # REST API endpoints
│   └── class-next-theme-json-admin-page.php     # Admin page registration/rendering
├── assets/
│   ├── js/admin.js                              # Admin page frontend
│   └── css/admin.css                            # Admin page styles
├── README.md
├── README.en.md
├── SPEC.md
├── CLAUDE.md
└── .gitignore
```

---

## REST API

The plugin provides the following endpoints. Permission: `edit_theme_options`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/wp-json/next-theme-json/v1/theme-json` | Get the theme's theme.json (read-only) |
| `GET` | `/wp-json/next-theme-json/v1/override` | Get the saved override settings |
| `POST` | `/wp-json/next-theme-json/v1/override` | Save override settings |
| `POST` | `/wp-json/next-theme-json/v1/override/reset` | Delete override settings |

---

## Development

### Requirements

- Node.js 18+ / npm
- Composer
- Docker (for `@wordpress/env`)

### Setup

```bash
composer install   # dev dependencies such as phpcs / phpunit
npm install        # wp-env / Playwright / husky
npx wp-env start   # local dev environment (dev: :8888 / tests: :8889)
```

`npm install` enables husky's pre-commit hook, which runs phpcs on staged PHP files before each commit.

### Coding standards check (phpcs)

```bash
composer run phpcs   # check
composer run phpcbf  # auto-fix
```

### PHPUnit tests

```bash
# Unit tests (no WordPress dependency, run locally)
composer run test:unit

# Integration tests (run in wp-env's tests environment)
npx wp-env run tests-cli --env-cwd=wp-content/plugins/NExT-theme-json-setup \
  vendor/bin/phpunit --testsuite integration --bootstrap=tests/phpunit/bootstrap.php
```

### E2E tests (Playwright)

```bash
npx playwright install chromium  # first time only
npx wp-env start
npm run test:e2e
```

### CI / Release

- `.github/workflows/ci.yml` — runs phpcs, PHPUnit (WP latest + 6.8 × PHP 8.3 / 8.4), Plugin Check, and E2E on push/PR
- `.github/workflows/release.yml` — pushing a tag in `0.0.0` format builds a distributable zip and creates a GitHub Release (verifies the tag matches the plugin header's Version)

---

## License

GPL-2.0-or-later
