# Herork deployment Cookbook

Steps described [here](https://www.geeksforgeeks.org/deploy-python-flask-app-on-heroku/)

# Build procedure

- pipenv install flask gunicorn requests feedparser
- Create Procfile
- Create runtime.txt - supported Heroku Python versions [here](https://devcenter.heroku.com/articles/python-support)
- Create /app/main.py
- Create /wsgi.py
- pipenv shell (enter virtual env)
- Initialise empty git repo 
  - $ git init 
  - $ git add .
  - $ git commit -m "Initial Commit"
- $ heroku login (Heroku CLI login)
- $ heroku create name-of-app
- $ git push heroku master

- exit (exit virtual env)

Speechify polyfill for Web Speech API
- [Speechify article](https://www.speechly.com/blog/full-browser-compability-webspeech-api)
- [Github](https://github.com/speechly/speech-recognition-polyfill)

CNAME record
- Type: CNAME
- Name: app1.mydomain.io
- Value: my-app1.herokuapp.com (no 'https://')
