from flask import Flask, render_template, jsonify, request, redirect, url_for
import json
import feedparser
import requests
import os
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/feedback')
def about():
    return render_template('feedbackForm.html')

@app.route('/feedback-received')
def feedback_received():
    return render_template('feedbackReceived.html')

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
    
#  Form handling
@app.route('/submit-form', methods=['POST'])
def submit_form():
    # TO-DO: CSRF protection with Flask-WTF

    # Extract form data
    name = request.form.get('name')
    email = request.form.get('email')
    userType = request.form.get('userType')
    browserOs = request.form.get('browserOs')
    featureDef = request.form.get('featureDef')
    comments = request.form.get('comments')

    email_content = f" Name: {name},\n Email: {email}, \n userType: {userType}, \n browserOs: {browserOs}, \n featureDef: {featureDef}, \n Comments: {comments}\n"
     
    #print(email_content)
        
    # Send email
    send_email(email_content)

    return redirect(url_for('feedback_received'))

def send_email(email_content):
    
    sender = os.environ.get('TYMPI_MAIL_SENDER')
    recipients = os.environ.get('TYMPI_MAIL_RECIPIENTS')
    password = os.environ.get('TYMPI_MAIL_PASS')

    msg = MIMEText(email_content)
    msg['Subject'] = "Tympi feedback"
    msg['From'] = sender
    msg['To'] = recipients
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail(sender, recipients, msg.as_string())
    
    print("Feednack sent!")


if __name__ == '__main__':
    app.run(debug=True)
