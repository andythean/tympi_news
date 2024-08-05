#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
#from fastapi.templating import Jinja2Templates
from NewsStory_sculta import NewsStory
import requests
from catboost import CatBoostClassifier
from readabilipy import simple_json_from_html_string
import numpy as np
import subprocess

def fetch_website_html(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Error fetching the URL. Status code: {response.status_code}")
        return None

def mark_html_sent(sent_list, tags):
    """ Create an HTML string with color-coded sentences """
    html_output = "<!DOCTYPE html><html><head></head><body>"
    sentences = sent_list
    for sentence, tag in zip(sentences, tags):
        color = tag_to_col(tag)
        html_output += f'{tag:2.0f}: <p style="color: {color}; display: inline;"> {sentence}<br /></p> '
    html_output += "</body></html>"

    return html_output
    
def tag_to_col(tag):
    """ Convert prediction to a color """ 
    red = int(0) 
    green = int(0)
    blue = int(0)
    if tag == 1:
        red = int(255)
    elif tag == 0:
        green = int(155)
    elif tag == -1:
        blue = int(255)
        
    return f"rgb({red}, {green}, {blue})"

def get_node_version():
    command = "node -v"
    process = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
    output, error = process.communicate()
    return output.decode('utf-8').strip()

# Run locally with: uvicorn main:app --reload

# Initialise e.g. load the model
model = CatBoostClassifier()  
model.load_model('catboost_model_2023-07-11.dump')
story = NewsStory()

# Initialise app
app = FastAPI()
#templates = Jinja2Templates(directory="templates")

@app.get("/fetch_content")
async def fetch_content(url: str):
    content = {}
    if url:
        try:
            html = fetch_website_html(url)   
            #print(f"Node.js version: {get_node_version()}")
            if html:
                # Use Readabilipy to extract body
                readabilipy_json = simple_json_from_html_string(html, use_readability=True)
                #story.sentences = [item['text'] for item in readabilipy_json['plain_text']]
                
                # May 1, 2021 workaround for 'extra entries' issue
                # https://github.com/alan-turing-institute/ReadabiliPy/issues/96
                readabilipy_json = simple_json_from_html_string(html, use_readability=True)
                text_array = [item['text'] for item in readabilipy_json['plain_text']]
                story.sentences = list(dict.fromkeys(text_array))

                # Extract features
                story.do_sent_feat()
                story.do_cosine_sim()
                #story.do_NSP_ave()  
            
                # Re-shape feature data
                X_data = {}
                keys = ['cosine_similarities', 'frac_begin_capital', 'frac_digits', 'frac_punct', 'frac_sent_idx', 'is_last_char_punct', 'n_tokens', 'n_unique_punc', 'punct_profile']
                for key in keys:        
                    X_data[key] = getattr(story, key)        
                X_extract = np.array(list(X_data.values())).T
            
                # Get predicted classes
                y_pred = model.predict(X_extract)
            
                # Display filtered sentences
                #[print(f"{y_pred[i]}: {story.sentences[i]}") for i in range(0,len(y_pred))]
                #html_filtered = mark_html_sent(story.sentences, y_pred)
                #content = html_filtered
                
                # y_pred=0 for good sentences 
                content['sentences'] = [sent for sent, y in zip(story.sentences, y_pred) if y < 1]
                
                return JSONResponse(content={"content": content})
        except Exception as e:
            return JSONResponse(content={"error": str(e)})
            #content = str(e)
    #return templates.TemplateResponse("index.html", {"request": request, "content": content})
 
