# Personal Academic Homepage

A Jekyll-based academic personal homepage with a built-in CMS (Content Management System) for managing publications, news, profile, and analytics.

Based on the [Minimal Light](https://github.com/yaoyao-liu/minimal-light) theme.

## Features

- Simple and elegant academic homepage
- Jekyll theme, automatically deployed by GitHub Pages
- **Built-in CMS** with web-based admin interface
  - Publication management (add, edit, reorder, import from BibTeX/URL)
  - News/updates management
  - Profile editing (about, research interests, services, social links, CV upload)
  - Git integration (commit & push from the browser)
  - Analytics dashboard (GitHub Traffic API, 14-day views/clones chart)
  - Jekyll local preview
- Supporting Markdown and HTML
- Supporting dark mode
- Mobile friendly

## Project Architecture

```
.
├── _config.yml                  # Jekyll site configuration
├── index.md                     # Homepage content (About Me, News, etc.)
├── _data/
│   └── publications.yml         # Publication data (YAML)
├── _includes/
│   ├── publications.md          # Publication list template (Liquid)
│   └── services.md              # Services section (HTML)
├── _layouts/
│   └── homepage.html            # Homepage HTML layout
├── _sass/
│   ├── minimal-light.scss       # Stylesheet (with dark mode)
│   └── minimal-light-no-dark-mode.scss
├── assets/
│   ├── css/                     # Additional CSS (publications, fonts)
│   ├── img/                     # Images (avatar, publication thumbnails)
│   ├── bib/                     # BibTeX files
│   ├── files/                   # Uploaded files (CV, etc.)
│   └── js/                      # Frontend JS (favicon switcher, etc.)
├── cms/
│   ├── backend/                 # FastAPI backend
│   │   ├── main.py              # App entry point
│   │   ├── api/                 # API routes
│   │   │   ├── publications.py  #   /api/publications
│   │   │   ├── news.py          #   /api/news
│   │   │   ├── profile.py       #   /api/profile
│   │   │   ├── git_api.py       #   /api/git
│   │   │   ├── preview.py       #   /api/preview
│   │   │   └── analytics.py     #   /api/analytics
│   │   ├── models/              # Pydantic schemas
│   │   └── services/            # Business logic
│   │       ├── yaml_handler.py  #   YAML read/write
│   │       ├── markdown_handler.py  # Markdown section parsing
│   │       ├── git_handler.py   #   Git operations (GitPython)
│   │       └── publication_parser.py  # BibTeX/URL import
│   └── frontend/                # CMS web interface
│       ├── index.html           # Single-page app
│       ├── css/app.css          # CMS styles
│       └── js/                  # CMS JavaScript modules
│           ├── app.js           #   Core (tabs, API, notifications)
│           ├── publications.js  #   Publication CRUD + author chips
│           ├── news.js          #   News CRUD + date picker
│           ├── profile.js       #   Profile editing + CV upload
│           ├── analytics.js     #   Traffic chart (Chart.js)
│           ├── git.js           #   Git status/commit/push
│           └── preview.js       #   Jekyll preview control
├── Gemfile                      # Ruby/Jekyll dependencies
└── README.md
```

## Getting Started

### Prerequisites

- **Python 3.9+**
- **Ruby** and **Jekyll** (for local preview; not required if only deploying via GitHub Pages)
- **Git**
- **GitHub CLI (`gh`)** — required for the analytics dashboard

### 1. Clone the Repository

```bash
git clone https://github.com/Nauhcnay/nauhcnay.github.io.git
cd nauhcnay.github.io
```

### 2. Install Python Dependencies (CMS Backend)

```bash
pip install fastapi uvicorn pyyaml gitpython httpx python-multipart bibtexparser requests beautifulsoup4
```

Or with a single command:

```bash
pip install fastapi uvicorn pyyaml gitpython httpx python-multipart "bibtexparser>=2.0.0b7" requests beautifulsoup4
```

### 3. Install GitHub CLI (for Analytics)

The analytics dashboard uses `gh api` to fetch traffic data. Install `gh`:

- **Ubuntu/Debian**: `sudo apt install gh`
- **macOS**: `brew install gh`
- **Windows**: `winget install GitHub.cli`

Then authenticate:

```bash
gh auth login
```

### 4. Install Jekyll Dependencies (for Local Preview)

```bash
gem install bundler
bundle install
```

## Running the CMS

### Start the CMS Backend

From the repository root directory, run:

```bash
python3 -m uvicorn cms.backend.main:app --reload --reload-dir cms --host 0.0.0.0 --port 8000
```

Then open your browser and go to:

```
http://localhost:8000
```

You will see the CMS admin interface with tabs for:

| Tab | Description |
|-----|-------------|
| **Publications** | Add/edit/delete/reorder papers. Import from BibTeX or URL. Toggle author bold. Upload thumbnails. |
| **News** | Add/edit/delete news items with month/year picker. |
| **Profile** | Edit name, position, affiliation, social links, About Me, Research Interests, Services. Upload CV. |
| **Analytics** | View 14-day page views, unique visitors, clones chart. See traffic sources and popular pages. |
| **Git** | View repo status, diff preview, commit and push changes. |

### Start Jekyll Local Preview

You can start Jekyll preview from within the CMS (click the "Preview" button in the top bar), or manually:

```bash
bundle exec jekyll serve
```

Then visit `http://localhost:4000` to see your homepage.

### Common Workflow

1. Start the CMS: `python3 -m uvicorn cms.backend.main:app --reload --reload-dir cms --host 0.0.0.0 --port 8000`
2. Open `http://localhost:8000` in your browser
3. Make edits (publications, news, profile, etc.)
4. Click "Preview" to check your changes locally
5. Click "Commit & Push" to deploy to GitHub Pages

## Deploying to GitHub Pages

Any push to the `main` branch will automatically trigger a GitHub Pages build and deploy. No additional configuration is needed — just commit and push your changes (either via the CMS or via git CLI).

## License

This work is licensed under a [Creative Commons Zero v1.0 Universal](https://github.com/yaoyao-liu/minimal-light/blob/master/LICENSE) License.

## Acknowledgements

- [minimal-light](https://github.com/yaoyao-liu/minimal-light) — the base Jekyll theme
- [pages-themes/minimal](https://github.com/pages-themes/minimal)
- [orderedlist/minimal](https://github.com/orderedlist/minimal)
- [al-folio](https://github.com/alshedivat/al-folio)
