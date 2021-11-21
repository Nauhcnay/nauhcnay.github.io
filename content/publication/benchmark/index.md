---
title: "A Benchmark for Rough Sketch Cleanup"

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here 
# and it will be replaced with their full name and linked to their profile.
authors:
- admin
- David Vanderhaeghe
- Yotam Gingold

# Author notes (optional)
# author_notes:
# - "Equal contribution"
# - "Equal contribution"

date: "2020-12-01T00:00:00Z"
doi: "10.1145/3414685.3417784"

# Schedule page publish date (NOT publication's date).
publishDate: "2021-11-20T12:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: ACM Transactions on Graphics (TOG)
publication_short: SIGGRAPH Asia

abstract: Sketching is a foundational step in the design process. Decades of sketch processing research have produced algorithms for 3D shape interpretation, beautification, animation generation, colorization, etc. However, there is a mismatch between sketches created in the wild and the clean, sketch-like input required by these algorithms, preventing their adoption in practice. The recent flurry of sketch vectorization, simplification, and cleanup algorithms could be used to bridge this gap. However, they differ wildly in the assumptions they make on the input and output sketches. We present the first benchmark to evaluate and focus sketch cleanup research. Our dataset consists of 281 sketches obtained in the wild and a curated subset of 101 sketches. For this curated subset along with 40 sketches from previous work, we commissioned manual vectorizations and multiple ground truth cleaned versions by professional artists. The sketches span artistic and technical categories and were created by a variety of artists with different styles. Most sketches have Creative Commons licenses; the rest permit academic use. Our benchmark's metrics measure the similarity of automatically cleaned rough sketches to artist-created ground truth; the ambiguity and messiness of rough sketches; and low-level properties of the output parameterized curves. Our evaluation identifies shortcomings among state-of-the-art cleanup algorithms and discusses open problems for future research.

# Summary. An optional shortened abstract.
summary: The first benchmark dataset for rough sketch cleanup methods with deep insight into the definition of "well-cleaned sketch".

tags: [sketch, drawing, design, cleanup, beautification, dataset, benchmark ]

# Display this page in the Featured widget?
featured: true

# Custom links (uncomment lines below)
# links:
# - name: Custom Link
#   url: http://example.org

# url_pdf: ''
# url_code: ''
# url_dataset: ''
# url_poster: ''
url_project: 'https://github.com/Nauhcnay/A-Benchmark-for-Rough-Sketch-Cleanup'
url_slides: 'https://cragl.cs.gmu.edu/sketchbench/A%20Benchmark%20for%20Rough%20Sketch%20Cleanup%20(Chuan%20Yan,%20David%20Vanderhaeghe,%20Yotam%20Gingold%202020%20SIGGRAPH%20Asia)%20presentation.pdf'
# url_source: ''
url_video: 'https://cragl.cs.gmu.edu/sketchbench/A%20Benchmark%20for%20Rough%20Sketch%20Cleanup%20(Chuan%20Yan,%20David%20Vanderhaeghe,%20Yotam%20Gingold%202020%20SIGGRAPH%20Asia)%20presentation.mp4'

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
image:
  caption: 'Samples in our benchmark dataset'
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
# projects:
# - example

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---
