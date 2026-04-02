#!/usr/bin/env python3
"""
Google Search Console Optimizer for market.next-aura.com

Fetches GSC performance data, identifies underperforming pages,
and optimizes blog post titles/descriptions for better CTR.

Usage:
    python gsc_optimizer.py            # Analyze only, print report
    python gsc_optimizer.py --apply    # Analyze + apply optimizations
    python gsc_optimizer.py --report   # Show latest report
"""

import argparse
import copy
import json
import os
import re
import shutil
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SITE_URL = "https://market.next-aura.com"
BLOG_DIR = Path(__file__).resolve().parent.parent / "content" / "blog"
SEO_DIR = Path(__file__).resolve().parent
DATA_FILE = SEO_DIR / "gsc_data.json"
BACKUPS_DIR = SEO_DIR / "backups"
REPORTS_DIR = SEO_DIR / "reports"

TITLE_MAX_LEN = 60
DESC_MAX_LEN = 155

# Thresholds
LOW_CTR_THRESHOLD = 0.03        # 3%
HIGH_IMPRESSION_THRESHOLD = 50
ALMOST_PAGE1_POS_MIN = 8
ALMOST_PAGE1_POS_MAX = 20

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

# OAuth Desktop Flow 用の Client ID（Google Cloud Console で作成）
# --setup で自動セットアップ時に使用
OAUTH_TOKEN_PATH = SEO_DIR / "gsc-token.json"
OAUTH_CLIENT_SECRETS_PATH = SEO_DIR / "client_secrets.json"

# ---------------------------------------------------------------------------
# Credentials
# ---------------------------------------------------------------------------


def _get_credentials_path() -> Path:
    """Resolve the service account JSON key path."""
    env_path = os.environ.get("GSC_CREDENTIALS_PATH")
    if env_path:
        return Path(env_path)
    return SEO_DIR / "gsc-credentials.json"


def _build_service():
    """Build an authorized Search Console API service.

    Tries in order:
    1. OAuth token (gsc-token.json) - created by --setup
    2. Service account (gsc-credentials.json)
    """
    try:
        from googleapiclient.discovery import build
    except ImportError:
        print("Required packages not installed. Run:")
        print("  pip install google-auth google-api-python-client google-auth-oauthlib")
        sys.exit(1)

    # Method 1: OAuth token (from --setup)
    if OAUTH_TOKEN_PATH.exists():
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request

            creds = Credentials.from_authorized_user_file(str(OAUTH_TOKEN_PATH), SCOPES)
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                # Save refreshed token
                with open(OAUTH_TOKEN_PATH, "w") as f:
                    f.write(creds.to_json())
            service = build("searchconsole", "v1", credentials=creds)
            print("Authenticated via OAuth token")
            return service
        except Exception as e:
            print(f"OAuth token error: {e}. Trying service account...")

    # Method 2: Service account
    sa_path = _get_credentials_path()
    if sa_path.exists():
        try:
            from google.oauth2 import service_account
            credentials = service_account.Credentials.from_service_account_file(
                str(sa_path), scopes=SCOPES
            )
            service = build("searchconsole", "v1", credentials=credentials)
            print("Authenticated via service account")
            return service
        except Exception as e:
            print(f"Service account error: {e}")

    # Neither method available
    print("=" * 60)
    print("GSC credentials not found. Choose one of:")
    print()
    print("  Option A (recommended): OAuth Desktop Flow")
    print("    python gsc_optimizer.py --setup")
    print("    → ブラウザでGoogleログインするだけ")
    print()
    print("  Option B: Service Account")
    print("    1. https://console.cloud.google.com/ でプロジェクト作成")
    print("    2. Search Console API を有効化")
    print("    3. Service Account を作成しJSONキーをダウンロード")
    print(f"    4. {sa_path} に保存")
    print(f"    5. GSCで Service Account メールを {SITE_URL} のユーザーに追加")
    print("=" * 60)
    sys.exit(1)


def cmd_setup():
    """OAuth Desktop Flow でブラウザ認証 → トークン保存"""
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print("Required package not installed. Run:")
        print("  pip install google-auth-oauthlib")
        sys.exit(1)

    if not OAUTH_CLIENT_SECRETS_PATH.exists():
        print("=" * 60)
        print("OAuth セットアップ手順:")
        print()
        print("1. https://console.cloud.google.com/ にアクセス")
        print("2. プロジェクトを作成（または既存を選択）")
        print("3. 「APIとサービス」→「ライブラリ」→ 'Google Search Console API' を有効化")
        print("4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」")
        print("5. アプリケーションの種類:「デスクトップアプリ」を選択")
        print("6. JSONをダウンロード")
        print(f"7. ダウンロードしたファイルを以下に保存:")
        print(f"   {OAUTH_CLIENT_SECRETS_PATH}")
        print()
        print("保存後にもう一度 --setup を実行してください。")
        print("=" * 60)
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(
        str(OAUTH_CLIENT_SECRETS_PATH), SCOPES
    )
    creds = flow.run_local_server(port=0)

    with open(OAUTH_TOKEN_PATH, "w") as f:
        f.write(creds.to_json())

    print(f"✓ 認証成功！トークンを {OAUTH_TOKEN_PATH} に保存しました。")
    print(f"  これで python gsc_optimizer.py で分析できます。")


# ---------------------------------------------------------------------------
# Data fetching
# ---------------------------------------------------------------------------


def fetch_gsc_data(service) -> dict:
    """Fetch last 28 days of GSC data (queries + pages)."""
    end_date = datetime.now().date() - timedelta(days=3)  # GSC has ~3 day lag
    start_date = end_date - timedelta(days=28)

    print(f"Fetching GSC data: {start_date} to {end_date}")

    all_rows = []
    start_row = 0
    batch_size = 25000

    while True:
        request_body = {
            "startDate": str(start_date),
            "endDate": str(end_date),
            "dimensions": ["query", "page"],
            "rowLimit": batch_size,
            "startRow": start_row,
        }

        try:
            response = (
                service.searchanalytics()
                .query(siteUrl=SITE_URL, body=request_body)
                .execute()
            )
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rateLimitExceeded" in error_str:
                print("Rate limited by GSC API. Waiting 60s...")
                time.sleep(60)
                continue
            raise

        rows = response.get("rows", [])
        if not rows:
            break

        for row in rows:
            all_rows.append(
                {
                    "query": row["keys"][0],
                    "page": row["keys"][1],
                    "clicks": row.get("clicks", 0),
                    "impressions": row.get("impressions", 0),
                    "ctr": row.get("ctr", 0),
                    "position": row.get("position", 0),
                }
            )

        start_row += len(rows)
        if len(rows) < batch_size:
            break

    data = {
        "fetched_at": datetime.now().isoformat(),
        "start_date": str(start_date),
        "end_date": str(end_date),
        "site_url": SITE_URL,
        "total_rows": len(all_rows),
        "rows": all_rows,
    }

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(all_rows)} rows to {DATA_FILE}")
    return data


def load_cached_data() -> dict | None:
    """Load previously fetched GSC data if available."""
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


# ---------------------------------------------------------------------------
# Frontmatter parsing
# ---------------------------------------------------------------------------


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from MDX content.

    Returns (frontmatter_dict, body_after_frontmatter).
    Uses PyYAML if available, falls back to regex.
    """
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return {}, content

    raw_fm = match.group(1)
    body = content[match.end():]

    try:
        import yaml
        fm = yaml.safe_load(raw_fm)
        if not isinstance(fm, dict):
            fm = {}
        return fm, body
    except ImportError:
        pass

    # Regex fallback
    fm = {}
    for line in raw_fm.split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r'^(\w+)\s*:\s*"?(.*?)"?\s*$', line)
        if m:
            key, val = m.group(1), m.group(2)
            # Handle arrays like tags
            if val.startswith("["):
                val = [
                    v.strip().strip('"').strip("'")
                    for v in val.strip("[]").split(",")
                ]
            fm[key] = val

    return fm, body


def serialize_frontmatter(fm: dict) -> str:
    """Serialize frontmatter dict back to YAML string."""
    try:
        import yaml
        return yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False).strip()
    except ImportError:
        pass

    # Manual serialization fallback
    lines = []
    for key, val in fm.items():
        if isinstance(val, list):
            items = ", ".join(f'"{v}"' for v in val)
            lines.append(f"{key}: [{items}]")
        elif isinstance(val, str):
            if any(c in val for c in ':"{}[]#&*!|>\','):
                lines.append(f'{key}: "{val}"')
            else:
                lines.append(f"{key}: {val}")
        else:
            lines.append(f"{key}: {val}")
    return "\n".join(lines)


def rebuild_mdx(fm: dict, body: str) -> str:
    """Rebuild full MDX content from frontmatter + body."""
    return f"---\n{serialize_frontmatter(fm)}\n---\n{body}"


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------


def _aggregate_by_page(rows: list[dict]) -> dict:
    """Group rows by page URL, collect queries for each page."""
    pages = {}
    for row in rows:
        page = row["page"]
        if page not in pages:
            pages[page] = {
                "url": page,
                "total_clicks": 0,
                "total_impressions": 0,
                "queries": [],
            }
        pages[page]["total_clicks"] += row["clicks"]
        pages[page]["total_impressions"] += row["impressions"]
        pages[page]["queries"].append(
            {
                "query": row["query"],
                "clicks": row["clicks"],
                "impressions": row["impressions"],
                "ctr": row["ctr"],
                "position": row["position"],
            }
        )

    # Compute page-level CTR
    for page_data in pages.values():
        imp = page_data["total_impressions"]
        page_data["avg_ctr"] = page_data["total_clicks"] / imp if imp > 0 else 0
        # Sort queries by impressions desc
        page_data["queries"].sort(key=lambda q: q["impressions"], reverse=True)

    return pages


def _url_to_mdx_path(url: str) -> Path | None:
    """Map a GSC page URL to a local MDX file path."""
    # e.g. https://market.next-aura.com/blog/fudousan-kakaku-2026-yosoku
    m = re.search(r"/blog/([^/?#]+)", url)
    if not m:
        return None
    slug = m.group(1)
    mdx_path = BLOG_DIR / f"{slug}.mdx"
    return mdx_path if mdx_path.exists() else None


def analyze(data: dict) -> dict:
    """Analyze GSC data and produce optimization suggestions.

    Returns a report dict.
    """
    rows = data["rows"]
    pages = _aggregate_by_page(rows)

    low_ctr_pages = []
    almost_page1 = []
    missing_keywords = []
    suggestions = []

    for url, page_data in pages.items():
        mdx_path = _url_to_mdx_path(url)
        imp = page_data["total_impressions"]
        ctr = page_data["avg_ctr"]

        # --- Low CTR, High Impressions ---
        if imp > HIGH_IMPRESSION_THRESHOLD and ctr < LOW_CTR_THRESHOLD:
            low_ctr_pages.append(
                {
                    "url": url,
                    "impressions": imp,
                    "ctr": round(ctr * 100, 2),
                    "top_queries": [
                        q["query"] for q in page_data["queries"][:5]
                    ],
                }
            )

        # --- Almost page 1 queries ---
        for q in page_data["queries"]:
            if (
                ALMOST_PAGE1_POS_MIN <= q["position"] <= ALMOST_PAGE1_POS_MAX
                and q["impressions"] > 10
            ):
                almost_page1.append(
                    {
                        "query": q["query"],
                        "page": url,
                        "position": round(q["position"], 1),
                        "impressions": q["impressions"],
                    }
                )

        # --- Missing keywords in title/description ---
        if mdx_path:
            content = mdx_path.read_text(encoding="utf-8")
            fm, _ = parse_frontmatter(content)
            title = fm.get("title", "")
            desc = fm.get("description", "")
            title_desc_text = f"{title} {desc}".lower()

            top_queries = page_data["queries"][:5]
            for q in top_queries:
                query_words = q["query"].lower().split()
                # Check if any significant word (len >= 2) is missing
                missing = [
                    w for w in query_words
                    if len(w) >= 2 and w not in title_desc_text
                ]
                if missing and q["impressions"] > 20:
                    missing_keywords.append(
                        {
                            "page": url,
                            "query": q["query"],
                            "missing_words": missing,
                            "impressions": q["impressions"],
                        }
                    )

        # --- Generate suggestions ---
        if mdx_path and imp > HIGH_IMPRESSION_THRESHOLD and ctr < LOW_CTR_THRESHOLD:
            content = mdx_path.read_text(encoding="utf-8")
            fm, _ = parse_frontmatter(content)
            top_query = (
                page_data["queries"][0]["query"]
                if page_data["queries"]
                else ""
            )

            suggestion = {
                "url": url,
                "file": str(mdx_path),
                "current_title": fm.get("title", ""),
                "current_description": fm.get("description", ""),
                "top_query": top_query,
                "impressions": imp,
                "ctr_pct": round(ctr * 100, 2),
                "suggested_title": _suggest_title(
                    fm.get("title", ""), top_query
                ),
                "suggested_description": _suggest_description(
                    fm.get("description", ""), top_query, page_data["queries"][:3]
                ),
            }
            suggestions.append(suggestion)

    # Sort
    low_ctr_pages.sort(key=lambda x: x["impressions"], reverse=True)
    almost_page1.sort(key=lambda x: x["impressions"], reverse=True)
    suggestions.sort(key=lambda x: x["impressions"], reverse=True)

    report = {
        "generated_at": datetime.now().isoformat(),
        "data_period": f"{data['start_date']} to {data['end_date']}",
        "total_pages_analyzed": len(pages),
        "low_ctr_high_impression_pages": low_ctr_pages,
        "almost_page1_queries": almost_page1[:20],
        "missing_keywords": missing_keywords[:20],
        "optimization_suggestions": suggestions,
    }

    return report


def _suggest_title(current_title: str, top_query: str) -> str:
    """Generate an optimized title suggestion.

    Strategy: if the top query keyword is not in the title, prepend or
    weave it in while keeping under TITLE_MAX_LEN.
    """
    if not top_query:
        return current_title

    # Extract significant words from top query
    query_words = [w for w in top_query.split() if len(w) >= 2]
    title_lower = current_title.lower()

    # Check which words are already in the title
    missing_words = [w for w in query_words if w.lower() not in title_lower]

    if not missing_words:
        # All keywords already present - just ensure length
        if len(current_title) <= TITLE_MAX_LEN:
            return current_title
        return current_title[:TITLE_MAX_LEN - 1] + "…"

    # Try to incorporate missing keyword
    keyword_insert = "".join(missing_words[:2])

    # Strategy 1: Replace the part after the separator if there is one
    separators = ["｜", "|", "—", "：", " - "]
    for sep in separators:
        if sep in current_title:
            parts = current_title.split(sep, 1)
            candidate = f"{parts[0].strip()}{sep}{keyword_insert}".strip()
            if len(candidate) <= TITLE_MAX_LEN:
                return candidate

    # Strategy 2: Prepend keyword
    candidate = f"{top_query}｜{current_title}"
    if len(candidate) <= TITLE_MAX_LEN:
        return candidate

    # Strategy 3: Truncate current title and prepend
    available = TITLE_MAX_LEN - len(top_query) - 1
    if available > 10:
        return f"{top_query}｜{current_title[:available - 1]}…"

    # Fallback: keep original if we can't improve
    if len(current_title) <= TITLE_MAX_LEN:
        return current_title
    return current_title[:TITLE_MAX_LEN - 1] + "…"


def _suggest_description(
    current_desc: str, top_query: str, top_queries: list[dict]
) -> str:
    """Generate an optimized meta description suggestion.

    Strategy: ensure top query appears in description, keep under DESC_MAX_LEN.
    """
    if not top_query:
        return current_desc

    desc_lower = current_desc.lower()
    query_lower = top_query.lower()

    # If top query is already present, keep description
    if query_lower in desc_lower:
        if len(current_desc) <= DESC_MAX_LEN:
            return current_desc
        return current_desc[:DESC_MAX_LEN - 1] + "…"

    # Try to prepend the keyword naturally
    candidate = f"{top_query}について徹底解説。{current_desc}"
    if len(candidate) <= DESC_MAX_LEN:
        return candidate

    # Truncate original to fit
    prefix = f"{top_query}について。"
    available = DESC_MAX_LEN - len(prefix)
    if available > 30:
        return f"{prefix}{current_desc[:available - 1]}…"

    # Fallback
    if len(current_desc) <= DESC_MAX_LEN:
        return current_desc
    return current_desc[:DESC_MAX_LEN - 1] + "…"


# ---------------------------------------------------------------------------
# Apply optimizations
# ---------------------------------------------------------------------------


def apply_optimizations(suggestions: list[dict]) -> list[dict]:
    """Apply title/description changes to MDX files.

    Creates backups before modifying. Returns list of changes made.
    """
    if not suggestions:
        print("No optimizations to apply.")
        return []

    date_str = datetime.now().strftime("%Y%m%d")
    backup_dir = BACKUPS_DIR / date_str
    backup_dir.mkdir(parents=True, exist_ok=True)

    changes = []

    for suggestion in suggestions:
        mdx_path = Path(suggestion["file"])
        if not mdx_path.exists():
            print(f"  SKIP (file not found): {mdx_path.name}")
            continue

        new_title = suggestion["suggested_title"]
        new_desc = suggestion["suggested_description"]
        old_title = suggestion["current_title"]
        old_desc = suggestion["current_description"]

        # Skip if no change
        if new_title == old_title and new_desc == old_desc:
            print(f"  SKIP (no change): {mdx_path.name}")
            continue

        # Read current content
        content = mdx_path.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(content)

        # Backup
        backup_path = backup_dir / mdx_path.name
        shutil.copy2(mdx_path, backup_path)

        # Update frontmatter
        if new_title != old_title:
            fm["title"] = new_title
        if new_desc != old_desc:
            fm["description"] = new_desc

        # Write back
        new_content = rebuild_mdx(fm, body)
        mdx_path.write_text(new_content, encoding="utf-8")

        change = {
            "file": str(mdx_path),
            "backup": str(backup_path),
            "title_changed": new_title != old_title,
            "old_title": old_title,
            "new_title": new_title,
            "description_changed": new_desc != old_desc,
            "old_description": old_desc,
            "new_description": new_desc,
        }
        changes.append(change)
        print(f"  UPDATED: {mdx_path.name}")
        if change["title_changed"]:
            print(f"    Title: {old_title}")
            print(f"        -> {new_title}")
        if change["description_changed"]:
            print(f"    Desc:  {old_desc[:50]}...")
            print(f"        -> {new_desc[:50]}...")

    return changes


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------


def save_report(report: dict, changes: list[dict] | None = None) -> Path:
    """Save analysis report to JSON."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    report_path = REPORTS_DIR / f"report_{date_str}.json"

    output = copy.deepcopy(report)
    if changes is not None:
        output["changes_applied"] = changes

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nReport saved to: {report_path}")
    return report_path


def print_report(report: dict) -> None:
    """Print a human-readable summary of the analysis."""
    print()
    print("=" * 60)
    print("GSC OPTIMIZATION REPORT")
    print(f"Period: {report['data_period']}")
    print(f"Pages analyzed: {report['total_pages_analyzed']}")
    print("=" * 60)

    # Low CTR pages
    low_ctr = report.get("low_ctr_high_impression_pages", [])
    print(f"\n--- Low CTR / High Impression Pages ({len(low_ctr)}) ---")
    for p in low_ctr[:10]:
        print(f"  {p['url']}")
        print(f"    Impressions: {p['impressions']}, CTR: {p['ctr']}%")
        print(f"    Top queries: {', '.join(p['top_queries'][:3])}")

    # Almost page 1
    ap1 = report.get("almost_page1_queries", [])
    print(f"\n--- Almost Page 1 Queries ({len(ap1)}) ---")
    for q in ap1[:10]:
        print(f"  [{q['position']}] \"{q['query']}\" - {q['impressions']} imp")
        print(f"    Page: {q['page']}")

    # Missing keywords
    mk = report.get("missing_keywords", [])
    print(f"\n--- Missing Keywords in Title/Desc ({len(mk)}) ---")
    for item in mk[:10]:
        print(f"  \"{item['query']}\" ({item['impressions']} imp)")
        print(f"    Missing: {', '.join(item['missing_words'])}")

    # Suggestions
    sugs = report.get("optimization_suggestions", [])
    print(f"\n--- Optimization Suggestions ({len(sugs)}) ---")
    for s in sugs[:10]:
        print(f"  {s['url']}")
        print(f"    CTR: {s['ctr_pct']}%, Impressions: {s['impressions']}")
        print(f"    Current title: {s['current_title']}")
        print(f"    Suggested:     {s['suggested_title']}")
        print()

    print("=" * 60)


def show_latest_report() -> None:
    """Load and display the latest saved report."""
    if not REPORTS_DIR.exists():
        print("No reports found.")
        return

    reports = sorted(REPORTS_DIR.glob("report_*.json"), reverse=True)
    if not reports:
        print("No reports found.")
        return

    latest = reports[0]
    print(f"Loading latest report: {latest}")

    with open(latest, "r", encoding="utf-8") as f:
        report = json.load(f)

    print_report(report)

    changes = report.get("changes_applied", [])
    if changes:
        print(f"\n--- Changes Applied ({len(changes)}) ---")
        for c in changes:
            fname = Path(c["file"]).name
            parts = []
            if c.get("title_changed"):
                parts.append("title")
            if c.get("description_changed"):
                parts.append("description")
            print(f"  {fname}: updated {', '.join(parts)}")


# ---------------------------------------------------------------------------
# Email report (for PM2 cron)
# ---------------------------------------------------------------------------


def send_email_report(report: dict) -> bool:
    """Send report summary via Resend API."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print("RESEND_API_KEY not set. Skipping email.")
        return False

    import requests  # noqa: E402 - only import when needed

    low_ctr = report.get("low_ctr_high_impression_pages", [])
    ap1 = report.get("almost_page1_queries", [])
    sugs = report.get("optimization_suggestions", [])

    # Build HTML body
    html = f"""
    <h2>GSC Weekly Report - market.next-aura.com</h2>
    <p>Period: {report['data_period']}</p>
    <p>Pages analyzed: {report['total_pages_analyzed']}</p>

    <h3>Low CTR / High Impression Pages ({len(low_ctr)})</h3>
    <ul>
    """
    for p in low_ctr[:10]:
        html += f"<li>{p['url']} - {p['impressions']} imp, CTR: {p['ctr']}%</li>\n"
    html += "</ul>"

    html += f"<h3>Almost Page 1 Queries ({len(ap1)})</h3><ul>"
    for q in ap1[:10]:
        html += f"<li>[{q['position']}] \"{q['query']}\" - {q['impressions']} imp</li>\n"
    html += "</ul>"

    html += f"<h3>Optimization Suggestions ({len(sugs)})</h3><ul>"
    for s in sugs[:5]:
        html += f"""<li>
            {s['url']}<br>
            CTR: {s['ctr_pct']}% | Imp: {s['impressions']}<br>
            Current: {s['current_title']}<br>
            Suggested: {s['suggested_title']}
        </li>"""
    html += "</ul>"

    payload = {
        "from": "GSC Optimizer <noreply@next-aura.com>",
        "to": ["admin@next-aura.com"],
        "subject": f"[GSC] Weekly Report - {report['data_period']}",
        "html": html,
    }

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )
        if resp.status_code in (200, 201):
            print("Email sent successfully.")
            return True
        else:
            print(f"Email failed: {resp.status_code} {resp.text}")
            return False
    except Exception as e:
        print(f"Email error: {e}")
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="GSC Optimizer for market.next-aura.com"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply optimization suggestions to MDX files",
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="Show the latest saved report",
    )
    parser.add_argument(
        "--email",
        action="store_true",
        help="Send report via email (used by PM2 cron)",
    )
    parser.add_argument(
        "--use-cache",
        action="store_true",
        help="Use cached GSC data instead of fetching fresh data",
    )
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Run OAuth setup wizard (browser login)",
    )
    args = parser.parse_args()

    # Setup wizard
    if args.setup:
        cmd_setup()
        return

    # Show latest report
    if args.report:
        show_latest_report()
        return

    # Fetch or load data
    if args.use_cache:
        data = load_cached_data()
        if not data:
            print("No cached data found. Fetching from GSC...")
            service = _build_service()
            data = fetch_gsc_data(service)
    else:
        service = _build_service()
        data = fetch_gsc_data(service)

    # Analyze
    print("\nAnalyzing...")
    report = analyze(data)
    print_report(report)

    # Apply optimizations
    changes = None
    if args.apply:
        print("\n--- Applying Optimizations ---")
        changes = apply_optimizations(report["optimization_suggestions"])
        if changes:
            print(f"\n{len(changes)} file(s) updated.")
        else:
            print("\nNo files were modified.")

    # Save report
    save_report(report, changes)

    # Send email if requested
    if args.email:
        send_email_report(report)


if __name__ == "__main__":
    main()
