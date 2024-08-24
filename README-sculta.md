# Web server for non-story sentence classifier

Accept URL and return JSON containing news-story-only content (i.e. non-news-story content removed)

## Example call

http://localhost:8000/fetch_content?url=https://www.bbc.com/news/world-middle-east-66304498

## Example JSON response

{"content":
	{"sentences":
		["Sentence A",
		"Sentcne B"
		]
	}
}

Note:
- Low-value BERT NSP features omitted for speed
- Where image captions are repeated, it is often because they also appear in image metadata (alt-text) 
- Training set: BBC, Guardian, NYT, Daily Mail, CNN, Tahoo News
- Trials e.g. NBC, Le Figaro, Wired, Il Sole 24 Ore etc.


# See main_web_app.py for Web Demo of non-story sentence classifier

Demo of non-story sentence classifier e.g. for trying news websites not contained in training set

Usage:

- uvicorn app:main_web_app.py --reload
- Enter URL in sidebar and click button
- Story (green) versus Non-story (red) text is displayed

 
