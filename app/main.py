from flask import Flask, render_template, jsonify, request
import json
import feedparser
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_config')
def get_config():
    try:
        with open('config.json', 'r') as f:
            data = json.load(f)
            return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_feed_content', methods=['POST'])
def get_feed_content():
    url = request.json.get('url')
    if not url:
        return jsonify({"error": "Invalid feed URL"}), 400

    feed = feedparser.parse(url)
    # Extract the title and summary of the first N entries
    n_select = min(30, len(feed.entries))
    entries = [{"title": entry.title, "summary": entry.summary, "link": entry.link} for entry in feed.entries[0:n_select]]
    return jsonify(entries)

@app.route('/get_sents', methods=['POST'])
def get_sents():

    url = request.json.get('url')
    if not url:
        return jsonify({"error": "Invalid story URL"}), 400
    
    server_url = "https://sculta-server-4ddf18fa5a16.herokuapp.com/fetch_content?url="
    r = requests.get(server_url + url)

    #r = requests.get("https://sculta-server-4ddf18fa5a16.herokuapp.com/fetch_content?url=https://www.bbc.com/news/science-environment-66950930");
    story_sent = r.json()['content']['sentences']
    #story_sent[0] = server_url + url
    return jsonify(story_sent)
    
if __name__ == '__main__':
    app.run(debug=True)
