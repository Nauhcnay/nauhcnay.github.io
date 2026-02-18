<h2 id="publications" style="margin: 2px 0px -15px;">Publications</h2>

<div class="publications">

{% assign featured_pubs = site.data.publications.main | where: "featured", true %}
{% assign other_pubs = site.data.publications.main | where_exp: "item", "item.featured != true" %}

{% if featured_pubs.size > 0 %}
<h3 class="pub-section-title">Selected Publications</h3>
<ol class="bibliography">

{% for link in featured_pubs %}

<li>
<div class="pub-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %}
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% endif %}
    {% if link.conference_short %}
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
      <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    <div class="links">
      {% if link.pdf %}
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">PDF</a>
      {% endif %}
      {% if link.code %}
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Code</a>
      {% endif %}
      {% if link.page %}
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Project Page</a>
      {% endif %}
      {% if link.bibtex %}
      <a href="javascript:void(0)" class="btn btn-sm z-depth-0 bibtex-toggle" role="button" style="font-size:12px;" data-bibtex-url="{{ link.bibtex }}">BibTex</a>
      {% endif %}
      {% if link.notes %}
      <strong> <i style="color:#e74d3c">{{ link.notes }}</i></strong>
      {% endif %}
      {% if link.others %}
      {{ link.others }}
      {% endif %}
    </div>
    {% if link.bibtex %}
    <div class="bibtex-panel" style="display:none;">
      <div class="bibtex-panel-toolbar">
        <button class="bibtex-copy-btn" title="复制 BibTeX">Copy</button>
        <a href="{{ link.bibtex }}" download class="bibtex-download-btn" title="下载 .bib 文件">Download</a>
      </div>
      <pre class="bibtex-content">Loading...</pre>
    </div>
    {% endif %}
  </div>
</div>
</li>

<br>

{% endfor %}

</ol>
{% endif %}

{% if other_pubs.size > 0 %}
<h3 class="pub-section-title">Other Publications</h3>
<ol class="bibliography">

{% for link in other_pubs %}

<li>
<div class="pub-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %}
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% endif %}
    {% if link.conference_short %}
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
      <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    <div class="links">
      {% if link.pdf %}
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">PDF</a>
      {% endif %}
      {% if link.code %}
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Code</a>
      {% endif %}
      {% if link.page %}
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Project Page</a>
      {% endif %}
      {% if link.bibtex %}
      <a href="javascript:void(0)" class="btn btn-sm z-depth-0 bibtex-toggle" role="button" style="font-size:12px;" data-bibtex-url="{{ link.bibtex }}">BibTex</a>
      {% endif %}
      {% if link.notes %}
      <strong> <i style="color:#e74d3c">{{ link.notes }}</i></strong>
      {% endif %}
      {% if link.others %}
      {{ link.others }}
      {% endif %}
    </div>
    {% if link.bibtex %}
    <div class="bibtex-panel" style="display:none;">
      <div class="bibtex-panel-toolbar">
        <button class="bibtex-copy-btn" title="复制 BibTeX">Copy</button>
        <a href="{{ link.bibtex }}" download class="bibtex-download-btn" title="下载 .bib 文件">Download</a>
      </div>
      <pre class="bibtex-content">Loading...</pre>
    </div>
    {% endif %}
  </div>
</div>
</li>

<br>

{% endfor %}

</ol>
{% endif %}

</div>
