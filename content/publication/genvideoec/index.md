---
title: "Generative Adversarial Networks Based Error Concealment for Low Resolution Video"

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here 
# and it will be replaced with their full name and linked to their profile.
authors:
- Chongyang Xiang
- Jiajun Xu 
- admin
- Qiang Peng
- Xiao Wu

# Author notes (optional)
# author_notes:
# - "Equal contribution"
# - "Equal contribution"

date: ""
doi: "10.1109/ICASSP.2019.8683622"

# Schedule page publish date (NOT publication's date).
publishDate: "2019-10-21T13:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["1"]

# Publication name and optional abbreviated publication name.
publication:  2019 IEEE International Conference on Acoustics, Speech and Signal Processing
publication_short:  ICASSP2019

abstract: In this paper, a novel deep generative model-based approach for video error concealment is proposed. Our method is comprised of completion network and two critics. The frame completion network is trained to fool the both the local and global critics, which requires completion network to conceal frame distortions with regard to overall consistency as well as in details. Specifically, mask attention convolution layer is proposed, which utilize not only the temporal information of the previous frame, but also the intact pixels of the current distorted frame to mask and re-normalize convolution features. Then, both qualitative and quantitative experiments validate the effectiveness and generality of our approach in advancing the error concealment on low resolution video.
# Summary. An optional shortened abstract.
summary: 

tags: [Convolution, Decoding, Training, Propagation losses, Kernel, Gallium nitride, Network architecture]

# Display this page in the Featured widget?
featured: false

# Custom links (uncomment lines below)
# links:
# - name: Custom Link
#   url: http://example.org

url_pdf: 'https://ieeexplore.ieee.org/abstract/document/8683622'
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