---
title: "A novel weighted boundary matching error concealment Schema for HEVC"

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here 
# and it will be replaced with their full name and linked to their profile.
authors:
- Jiajun Xu 
- Wei Jiang
- admin
- Qiang Peng
- Xiao Wu

# Author notes (optional)
# author_notes:
# - "Equal contribution"
# - "Equal contribution"

date: ""
doi: "10.1109/ICIP.2018.8451175"

# Schedule page publish date (NOT publication's date).
publishDate: "2018-10-07T13:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: 2018 25th IEEE International Conference on Image Processing
publication_short: ICIP2018

abstract: In this paper, a novel weighted boundary matching error concealment schema for HEVC is proposed, which is based on the CU depths and PU partitions in reference frame. Firstly, the information of CU depths in reference frames is used for lost slices. For each LCU in a lost slice, the LCUs surrounding to the co-located LCU are used to calculate summed CU-depth weight, which is used to determine the conceal order of each CU. Then, the co-located partition decision from the reference frame is adopted for PUs in each lost CU. The sequence of PUs to conceal is sorted based on the texture randomness index weight and the PU with the largest weight will be concealed next. Finally, the best estimated motion vector for the lost PU is selected for concealment. The experimental results show that our method achieves higher PSNR gains and has a better visual quality than the state-of-the-art methods.
# Summary. An optional shortened abstract.
summary: 

tags: [Indexes, Encoding, Partitioning algorithms, Visualization, Video coding, Copper, Decoding]

# Display this page in the Featured widget?
featured: false

# Custom links (uncomment lines below)
# links:
# - name: Custom Link
#   url: http://example.org

url_pdf: 'https://ieeexplore.ieee.org/abstract/document/8451175'
# url_code: ''
# url_dataset: ''
# url_poster: ''
# url_project: ''
# url_slides: ''
# url_source: ''
# url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
# image:
#   caption: 'FlatMagic framework'
#   focal_point: ""
#   preview_only: false

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