#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Apr  5 17:36:36 2023

@author: Andy
"""
import json

from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def set_LM(name):
    """ Initialise Language Model """

    print("Removed transformer dependency: No language model initialised")
    model_name = ''

    # print(f"Inititialised with: {model_name}")

    return model_name


def get_punctuation_chars(sentence):
    """ striips non-punctuation characters from a sentence """

    # allowed_chars = string.punctuation
    # allowed_chars = set('（[•*,:;?.!/)）-−–‐«»„"“”‘’\'`$#@]*\u2666\u2665\u2663\u2660\u00A0。、，・') 
    allowed_chars = set(
        '（[•*,‚:;?.!/)）-−–‐—–«»„"“”‘’‟\'`$#@]*\u2666\u2665\u2663\u2660\u00A0。、，・')  # Unclude n-dash and m-dash
    punct_profile = ''.join(c for c in sentence if c in allowed_chars)

    return punct_profile


class NewsStory:
    """ News Story """

    # def __init__(self, name = 'BERT_NSP'):
    def __init__(self, name=''):
        # Load pre-trained BERT model and tokenizer
        if name:
            model_name = set_LM(name)
            self.model_name = model_name

    def __str__(self):
        return f"{self.sentences}"

    def print_probs(self):
        for idx in range(len(self.sentences)):
            print(f"{self.probs[idx]:.4f}, {self.sentences[idx]}")

    def print_sent(self):
        for idx in range(len(self.sentences)):
            print(f"{self.sentences[idx]}")

    def set_from_txt(self, filename):
        try:
            print(f"Reading: {filename}")
            with open(filename) as f:
                txt_str = f.read()

            # Split on sentences and remove empty strings
            string_list = self.split_sent(txt_str)
            self.sentences = [s for s in string_list if s]

        except IOError:
            print(f"Could not read fileL {filename}")

    def set_sentences_from_list(self, sentence_list):
        self.sentences = sentence_list

    def split_sent(self, str):
        # split unto sentences
        # TBD: Check self.story_text exists
        return str.split("\n")

    def do_cosine_sim(self):
        """ Calculating cosine similarity between sentences """

        cosine_similarities = []
        for sent_idx in range(1, len(self.sentences)):  # Skip first sentence
            # Calculate cosine similarity between sentences
            sentences = [self.sentences[sent_idx - 1], self.sentences[sent_idx]]
            vectorizer = CountVectorizer().fit_transform(sentences)
            vectors = vectorizer.toarray()
            csim = cosine_similarity(vectors)
            cosine_similarities.append(csim[0][1] if len(csim) > 1 else 1)

        # Let similarity for each sentence be average of each pair it is part of        
        csim_pad = [0.5] + cosine_similarities + [0.5]
        ave_cosine_similarities = []
        for i in range(1, len(csim_pad)):
            ave_cosine_similarities.append(round((csim_pad[i - 1] + csim_pad[i]) / 2, 8))

        self.cosine_similarities = ave_cosine_similarities

    def prob_to_col(self, prob):
        # Convert probability to a color 
        red = int(255 * (1 - prob))
        blue = int(255 * prob)
        return f"rgb({red}, 0, {blue})"

    def write_html_col(self, filename):
        # Create an HTML string with color-coded sentences
        html_output = "<!DOCTYPE html><html><head></head><body>"
        sentences = self.sentences
        probabilities = self.probs
        for sentence, prob in zip(sentences, probabilities):
            color = self.prob_to_col(prob)
            html_output += f'{prob:.4f}: <p style="color: {color}; display: inline;"> {sentence}<br /></p> '
        html_output += "</body></html>"

        # Save the HTML string to a file
        with open(filename, "w") as f:
            f.write(html_output)

        print(f"HTML file created: {filename}")

    def write_probs_to_json(self, file_path):
        data = {}
        data['url'] = self.url
        data['model_name'] = self.model_name
        data['sentences'] = self.sentences
        data['probs'] = self.probs
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
        print(f"Write JSON to: '{file_path}'")

    def write_feat_to_json(self, file_path):
        data = {}
        data['url'] = self.url
        data['model_name'] = self.model_name
        data['sentences'] = self.sentences
        data['probs'] = self.probs
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
        print(f"Write JSON to: '{file_path}'")

    def do_sent_feat(self):
        """ Extract features from sentences """
        sentences = self.sentences

        # self.sent_idx = []
        self.frac_sent_idx = []
        self.n_tokens = []
        self.frac_begin_capital = []
        # self.frac_all_capital = []
        self.frac_digits = []
        self.punct_profile = []
        self.frac_punct = []
        self.n_unique_punc = []
        self.is_last_char_punct = []

        n_sentences = len(sentences)

        for sent_idx, sentence in enumerate(sentences):
            words = word_tokenize(sentence)
            n_tokens = len(words)
            self.frac_sent_idx.append(round((sent_idx / n_sentences), 5))
            self.n_tokens.append(n_tokens)
            frac_begin_capital = sum(1 for word in words if word[0].isupper()) / n_tokens
            self.frac_begin_capital.append(round(frac_begin_capital, 4))
            # self.frac_all_capital.append(sum(1 for word in words if word.isupper())/n_tokens)
            # WARNING: should normalise by n_char NOT n_tokens
            frac_digits = sum(1 for char in sentence if char.isdigit()) / n_tokens
            self.frac_digits.append(round(frac_digits, 4))
            punct_profile = get_punctuation_chars(sentence)
            self.punct_profile.append(punct_profile)
            # self.frac_punc.append(sum(1 for char in sentence if char in string.punctuation + '”')/n_tokens)
            # WARNING: should normalise by n_char NOT n_tokens
            self.frac_punct.append(round(len(punct_profile) / n_tokens, 4))
            self.n_unique_punc.append(len(set(punct_profile)))
            # self.is_last_char_punct.append(int(words[-1] in (string.punctuation + '”')))
            if sentences and punct_profile:
                self.is_last_char_punct.append(sentence[-1] == punct_profile[-1])
            else:
                self.is_last_char_punct.append(False)
