## Tympi News

<div style="display: flex; justify-content: right;">
  <img src="/demo/site_overlay.png" alt="A screenshot showing the web app navigation options. The news site name BBC News Top Stories is shown in white, large-font text on a black background. Three superimposed orange arrows represent commands available to a user via the arrow keys, or swipe commands. The UP arrow is labeled back to Menu, a left arrowm is labeled next site, and a right arrow is labeled select site." width="30%" align="right" />
</div>

### Description

A web app designed to make news more accessible, particularly for people with a visual impairment. The app runs in a browser and reads news stories aloud using a synthetic voice (text-to-speech). It lets a user select a news story from a list of news sites (e.g. BBC News, NPR etc) with a simple, 3-button interface. A machine-learning model improves listening comnfort by extracting salient news text. 

### Demo

Try the web app at: https://news.tympi.io/

### Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Installation](#installation)
-   [Contributing](#contributing)
-   [License](#license)

----------

### Features

- **Text-to-Speech**: Reads news stories out loud 
- **Story Extraction**: Only reads the relevant text  
- **Latest News**: Gets up-to-the-minute news
- **Simple Navigation**: Three-key (three-swipe) interface

----------

### Tech Stack

#### **Frontend (JavaScript)**
-   MDN Web Speech API

#### **Backend (Python)**
- Flask
- Readabilipy  
- Catboost
- Feedparser
- Requests

----------

### Installation

To run the project locally, follow these instructions.

#### Prerequisites

-   Python 3.x

#### Setup

1.  **Clone the repository (use your [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) as password)**:

	```bash
	git clone https://github.com/andythean/tympi_news.git
	cd tympi_news/
	
2. **Set up a virtual environment**:
	
	```bash
	python3 -m venv venv 

3. **Install dependencies**:

	```bash
	pip install -r requirements.txt
	
4. **Launch back-end**:

	```bash
	python -m app.main

5. **Access web app in browser**:

	Open a browser and navigate to local site (e.g. http://127.0.0.1:5000/, see prompt after launch)

----------

### Contributing

We welcome contributions to improve the project, please follow these guidelines:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature-branch`).
3.  Make your changes and commit them (`git commit -m 'Add feature'`).
4.  Push to the branch (`git push origin feature-branch`).
5.  Create a new Pull Request.

### Acknowledgements

Team/Essential contributors: [Luca Foppiano](https://github.com/lfoppiano) and [Patrice Lopez](https://github.com/kermitt2)

Contact: [tympi.news@gmail.com](mailto:tympi.news@gmail.com)

----------

### License

This project is licensed under the Apache 2.0 License - see the [LICENSE](./LICENSE) file for details.

----------

