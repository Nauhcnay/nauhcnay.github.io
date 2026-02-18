"""论文信息解析服务：支持 BibTeX / 论文 URL / Google Scholar URL 三种导入方式"""

import re
from typing import Dict, Any, Optional

import bibtexparser
import requests
from bs4 import BeautifulSoup

REQUEST_TIMEOUT = 10
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; HomepageCMS/1.0)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── 常见会议/期刊缩写映射 ──────────────────────────────────────────────

VENUE_ABBREVIATIONS = {
    "ACM Symposium on User Interface Software and Technology": "UIST",
    "ACM SIGGRAPH": "SIGGRAPH",
    "SIGGRAPH Asia": "SIGGRAPH Asia",
    "ACM CHI Conference on Human Factors in Computing Systems": "CHI",
    "CHI Conference on Human Factors in Computing Systems": "CHI",
    "IEEE Conference on Virtual Reality": "IEEE VR",
    "IEEE Virtual Reality": "IEEE VR",
    "IEEE International Symposium on Mixed and Augmented Reality": "ISMAR",
    "International Symposium on Mixed and Augmented Reality": "ISMAR",
    "ACM SIGCHI Symposium on Engineering Interactive Computing Systems": "EICS",
    "ACM Computing Surveys": "CSUR",
    "IEEE Transactions on Visualization and Computer Graphics": "TVCG",
    "ACM Transactions on Graphics": "TOG",
    "ACM Transactions on Computer-Human Interaction": "TOCHI",
    "Computer Graphics Forum": "CGF",
    "Eurographics": "EG",
    "International Conference on Computer Vision": "ICCV",
    "IEEE/CVF Conference on Computer Vision and Pattern Recognition": "CVPR",
    "Conference on Computer Vision and Pattern Recognition": "CVPR",
    "Neural Information Processing Systems": "NeurIPS",
    "International Conference on Machine Learning": "ICML",
    "International Conference on Learning Representations": "ICLR",
    "AAAI Conference on Artificial Intelligence": "AAAI",
}


def _guess_venue_short(venue: str, year: str = "") -> str:
    """尝试从完整会议/期刊名推导缩写 + 年份"""
    venue_lower = venue.lower()
    for full_name, abbr in VENUE_ABBREVIATIONS.items():
        if full_name.lower() in venue_lower:
            return f"{abbr} {year}".strip()
    # 兜底：取每个单词首字母（跳过介词等）
    skip = {"of", "the", "on", "in", "and", "for", "a", "an"}
    initials = "".join(
        w[0].upper() for w in venue.split() if w.lower() not in skip and w[0].isalpha()
    )
    if initials and len(initials) >= 2:
        return f"{initials} {year}".strip()
    return f"{venue} {year}".strip() if year else venue


# ── BibTeX 解析 ─────────────────────────────────────────────────────────

def _clean_braces(s: str) -> str:
    """移除 LaTeX 花括号"""
    return re.sub(r"[{}]", "", s).strip()


def _format_authors_from_bibtex(author_str: str) -> str:
    """将 BibTeX 作者格式 'Last, First and ...' 转为 'First Last, ...'"""
    author_str = _clean_braces(author_str)
    authors = [a.strip() for a in re.split(r"\s+and\s+", author_str)]
    formatted = []
    for author in authors:
        if "," in author:
            parts = [p.strip() for p in author.split(",", 1)]
            formatted.append(f"{parts[1]} {parts[0]}")
        else:
            formatted.append(author)
    return ", ".join(formatted)


def parse_bibtex(bibtex_string: str) -> Dict[str, Any]:
    """解析 BibTeX 字符串，返回 Publication 字段字典"""
    library = bibtexparser.parse_string(bibtex_string)
    if not library.entries:
        raise ValueError("未找到有效的 BibTeX 条目")

    entry = library.entries[0]
    fields = entry.fields_dict

    title = _clean_braces(fields["title"].value) if "title" in fields else ""
    if not title:
        raise ValueError("BibTeX 条目缺少 title 字段")

    authors = ""
    if "author" in fields:
        authors = _format_authors_from_bibtex(fields["author"].value)

    venue = ""
    if "booktitle" in fields:
        venue = _clean_braces(fields["booktitle"].value)
    elif "journal" in fields:
        venue = _clean_braces(fields["journal"].value)

    year = _clean_braces(fields["year"].value) if "year" in fields else ""

    conference_short = _guess_venue_short(venue, year) if venue else year

    pdf = ""
    if "doi" in fields:
        doi_val = _clean_braces(fields["doi"].value)
        pdf = f"https://doi.org/{doi_val}"
    elif "url" in fields:
        pdf = _clean_braces(fields["url"].value)

    result = {
        "title": title,
        "authors": authors,
        "conference": venue,
        "conference_short": conference_short,
    }
    if pdf:
        result["pdf"] = pdf
    return result


# ── Crossref API 辅助 ───────────────────────────────────────────────────

def _fetch_crossref_by_doi(doi: str) -> Dict[str, Any]:
    """通过 DOI 从 Crossref API 获取元数据"""
    url = f"https://api.crossref.org/works/{doi}"
    resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers=REQUEST_HEADERS)
    if resp.status_code != 200:
        raise ValueError(f"Crossref API 返回错误 (HTTP {resp.status_code})，DOI 可能无效")
    data = resp.json()["message"]
    return _crossref_to_publication(data)


def _search_crossref_by_title(title: str) -> Dict[str, Any]:
    """通过标题搜索 Crossref API"""
    url = "https://api.crossref.org/works"
    params = {"query.title": title, "rows": 1}
    resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT, headers=REQUEST_HEADERS)
    if resp.status_code != 200:
        raise ValueError(f"Crossref API 搜索失败 (HTTP {resp.status_code})")
    items = resp.json()["message"].get("items", [])
    if not items:
        raise ValueError("Crossref 未找到匹配的论文")
    return _crossref_to_publication(items[0])


def _crossref_to_publication(data: dict) -> Dict[str, Any]:
    """将 Crossref API 响应转为 Publication 字段字典"""
    title = ""
    if data.get("title"):
        title = data["title"][0]

    authors = ""
    if data.get("author"):
        names = []
        for a in data["author"]:
            given = a.get("given", "")
            family = a.get("family", "")
            if given and family:
                names.append(f"{given} {family}")
            elif family:
                names.append(family)
        authors = ", ".join(names)

    venue = ""
    if data.get("container-title"):
        venue = data["container-title"][0]

    year = ""
    date_parts = None
    if data.get("published-print", {}).get("date-parts"):
        date_parts = data["published-print"]["date-parts"][0]
    elif data.get("published-online", {}).get("date-parts"):
        date_parts = data["published-online"]["date-parts"][0]
    elif data.get("created", {}).get("date-parts"):
        date_parts = data["created"]["date-parts"][0]
    if date_parts and date_parts[0]:
        year = str(date_parts[0])

    conference_short = _guess_venue_short(venue, year) if venue else year

    doi = data.get("DOI", "")
    pdf = f"https://doi.org/{doi}" if doi else ""

    result = {
        "title": title,
        "authors": authors,
        "conference": venue,
        "conference_short": conference_short,
    }
    if pdf:
        result["pdf"] = pdf
    return result


# ── URL 解析 ────────────────────────────────────────────────────────────

def _extract_doi_from_url(url: str) -> Optional[str]:
    """从 URL 中提取 DOI"""
    # doi.org/10.xxxx/yyyy 或 dl.acm.org/doi/10.xxxx/yyyy
    m = re.search(r"(10\.\d{4,}/[^\s?#]+)", url)
    return m.group(1).rstrip("/") if m else None


def _extract_arxiv_id(url: str) -> Optional[str]:
    """从 arXiv URL 中提取论文 ID"""
    m = re.search(r"arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5}(?:v\d+)?)", url)
    return m.group(1) if m else None


def _fetch_arxiv(arxiv_id: str) -> Dict[str, Any]:
    """通过 arXiv Atom API 获取元数据"""
    api_url = f"http://export.arxiv.org/api/query?id_list={arxiv_id}"
    resp = requests.get(api_url, timeout=REQUEST_TIMEOUT, headers=REQUEST_HEADERS)
    if resp.status_code != 200:
        raise ValueError(f"arXiv API 返回错误 (HTTP {resp.status_code})")

    soup = BeautifulSoup(resp.text, "lxml-xml")
    entry = soup.find("entry")
    if not entry:
        raise ValueError("arXiv 未找到该论文")

    title = entry.find("title").get_text(strip=True) if entry.find("title") else ""
    title = re.sub(r"\s+", " ", title)  # 合并多余空白

    authors_tags = entry.find_all("author")
    authors = ", ".join(
        a.find("name").get_text(strip=True) for a in authors_tags if a.find("name")
    )

    # arXiv 论文可能有 journal_ref
    venue = ""
    journal_ref = entry.find("journal_ref")
    if journal_ref:
        venue = journal_ref.get_text(strip=True)

    # 发布日期
    published = entry.find("published")
    year = ""
    if published:
        m = re.match(r"(\d{4})", published.get_text(strip=True))
        if m:
            year = m.group(1)

    conference_short = _guess_venue_short(venue, year) if venue else (f"arXiv {year}" if year else "arXiv")

    pdf_link = f"https://arxiv.org/abs/{arxiv_id}"

    result = {
        "title": title,
        "authors": authors,
        "conference": venue if venue else "arXiv preprint",
        "conference_short": conference_short,
        "pdf": pdf_link,
    }
    return result


def _extract_doi_from_page(url: str) -> Optional[str]:
    """抓取页面 HTML，尝试从 meta 标签中提取 DOI"""
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers=REQUEST_HEADERS)
        resp.raise_for_status()
    except requests.RequestException:
        return None
    soup = BeautifulSoup(resp.text, "lxml")
    # <meta name="citation_doi" content="10.xxxx/yyyy">
    meta = soup.find("meta", attrs={"name": "citation_doi"})
    if meta and meta.get("content"):
        return meta["content"].strip()
    # <meta name="dc.identifier" content="doi:10.xxxx/yyyy">
    meta = soup.find("meta", attrs={"name": "dc.identifier"})
    if meta and meta.get("content", "").startswith("doi:"):
        return meta["content"][4:].strip()
    return None


def parse_paper_url(url: str) -> Dict[str, Any]:
    """解析论文 URL，返回 Publication 字段字典"""
    url = url.strip()
    if not url:
        raise ValueError("URL 不能为空")

    # arXiv
    arxiv_id = _extract_arxiv_id(url)
    if arxiv_id:
        return _fetch_arxiv(arxiv_id)

    # 直接含 DOI 的 URL（doi.org、ACM DL 等）
    doi = _extract_doi_from_url(url)
    if doi:
        return _fetch_crossref_by_doi(doi)

    # IEEE 等：抓取页面提取 DOI
    if "ieeexplore.ieee.org" in url:
        doi = _extract_doi_from_page(url)
        if doi:
            return _fetch_crossref_by_doi(doi)
        raise ValueError("无法从 IEEE 页面提取 DOI，请尝试粘贴 BibTeX")

    # 兜底：抓取页面寻找 DOI meta 标签
    doi = _extract_doi_from_page(url)
    if doi:
        return _fetch_crossref_by_doi(doi)

    raise ValueError("无法从该 URL 提取论文信息，请尝试粘贴 BibTeX")


# ── Google Scholar URL 解析 ─────────────────────────────────────────────

def parse_scholar_url(url: str) -> Dict[str, Any]:
    """解析 Google Scholar 论文页面 URL，返回 Publication 字段字典"""
    url = url.strip()
    if not url:
        raise ValueError("URL 不能为空")

    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers=REQUEST_HEADERS)
    except requests.RequestException as e:
        raise ValueError(f"无法访问 Google Scholar: {e}")

    if resp.status_code == 429 or "CAPTCHA" in resp.text:
        raise ValueError(
            "Google Scholar 暂时封锁了请求（频率限制/验证码），"
            "请改用 BibTeX 粘贴方式导入"
        )

    if resp.status_code != 200:
        raise ValueError(f"Google Scholar 返回错误 (HTTP {resp.status_code})")

    soup = BeautifulSoup(resp.text, "lxml")

    # 尝试提取论文标题
    title = ""
    # Scholar 论文页面的标题通常在 <meta name="title"> 或 <title> 中
    title_meta = soup.find("meta", attrs={"name": "title"})
    if title_meta and title_meta.get("content"):
        title = title_meta["content"].strip()

    if not title:
        title_tag = soup.find("title")
        if title_tag:
            title = title_tag.get_text(strip=True)
            # 去除 " - Google Scholar" 后缀
            title = re.sub(r"\s*[-–—]\s*Google Scholar\s*$", "", title)

    if not title:
        # 尝试从引用页面 (#d=gs_cit) 获取标题
        heading = soup.find("a", class_="gsc_oci_title_link") or soup.find("div", id="gsc_oci_title")
        if heading:
            title = heading.get_text(strip=True)

    if not title:
        raise ValueError("无法从 Google Scholar 页面提取论文标题，请改用 BibTeX 粘贴方式")

    # 用标题搜索 Crossref
    return _search_crossref_by_title(title)
