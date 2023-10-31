# tympi_news


# Feedback (issues TBD)

- getvoices = 0: solve for Android, Linux, Windows (high priority)
- Filter out silly voice options on iOS
- Background music as setting: change volume and allow disable
- Less verbose instructiuons
- Use tones to acknowledge gestures and selection (default volume too high on iPhone)
- Enable audio on while phone sleeping
- Enable control through headphones
- Quickstart setting: go strauight to preferred feed on start
- TTS permission on start: avoif having to click menu on mobile to trigger TTS permission
- Avoid floating navigation bar obscuring main text
- Rename 'Speech rate' -> 'Voice Speed'
- No voice available prompt

# Heroku deployment

See steps described [here](https://www.geeksforgeeks.org/deploy-python-flask-app-on-heroku/)

- pipenv install flask gunicorn requests feedparser
- Create Procfile
- Create runtime.txt - supported Heroku Python versions [here](https://devcenter.heroku.com/articles/python-support)
- Create requirements.txt (pip3 freeze > requirements.txt)
- Create /app/main.py
- Create /wsgi.py
- pipenv shell (enter virtual env)
- Initialise empty git repo 
  - $ git init 
  - $ git add .
  - $ git commit -m "Initial Commit"
- $ heroku login (Heroku CLI login)
- $ heroku create name-of-app
- $ git push heroku main (or $ git push heroku master)

- exit (exit virtual env)

Speechify polyfill for Web Speech API
- [Speechify article](https://www.speechly.com/blog/full-browser-compability-webspeech-api)
- [Github](https://github.com/speechly/speech-recognition-polyfill)

# DNS config

Add domain to Heroku and get DNS target
- $ heroku domains:add news.tympi.io (get Heroku DNS target)
- Check Settings on Heroku web interface

Add domain to Dynadot and point to web app
- Type: CNAME
- Name: news.tympi.io
- Value: classical-castle-ospxy6d485r89vsjycoj4nig.herokudns.com (Heroku DNS target, note: no 'https://')

