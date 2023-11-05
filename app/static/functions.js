// --------------
// Python backend
// --------------

// Load variables from json
async function loadConfig() {
    try {
        const response = await fetch('/get_config');
        const configData = await response.json();
        config = configData;
        return config
    } catch (error) {
        console.error('Error loading configuration:', error);
        throw error;
    }
}

// Call backend to fetch feed data
function fetchFeedContent(url) {
    return fetch('/get_feed_content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => {
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status}`);
            throw new Error('Bad metwork response');
        }
        return response.json();
    })
    .catch(error => {
        console.log('Error fetching feed:', error.message);
    });
}

// Call backend to extract story sentences
function fetchSents(url) {
    return fetch('/get_sents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => {
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status}`);
            throw new Error('Bad network response');
        }
        return response.json();
    })
    .catch(error => {
        console.log('Error fetching sentences:', error.message);
    });
}
    
// ------
// config
// ------

function setPref(settingName, value) {
    localStorage.setItem(settingName, value);
    console.log(`Saving: ${settingName}, as ${value}`)
    return value
}

function getPref(settingName) {
    const value = localStorage.getItem(settingName);
    return value
}

function getOrSetPref(settingName, defaultValue) {

    //let settingValue = localStorage.getItem(settingName);
    let settingValue = getPref(settingName);
    
    if (!settingValue && settingValue != 0) {
        settingValue = defaultValue;
        setPref(settingName, settingValue);
    } else {
        console.log(`Keeping preference: ${settingName}, as ${settingValue}`)
    }
    
    return settingValue;
}

// check voice availability
function checkVoiceAvailable(voiceName) {

    let voices = speechSynthesis.getVoices();
    let englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));

    let isAvailable = false;

    englishVoices.forEach((voice) => {             
        if(voice.name === voiceName) {
            isAvailable = true;
        }
    });
    
    if (isAvailable){
        // Voice is available
    } else {
        console.log("Requested voice is not available: ", voiceName)
    }
    
    return isAvailable;
}

// LoadConfigs and use them to set preferences in local storgae
async function loadConfigAndPrefs() {
    try {
        const result = await loadConfig().then(config => {
            
            // Set Sys/Narr voices if valid
            if (checkVoiceAvailable(config.prefVoiceSys)){ 
                config.prefVoiceSys = getOrSetPref('prefVoiceSys', config.prefVoiceSys);
            }

            if (checkVoiceAvailable(config.prefVoiceNarr)){ 
                config.prefVoiceNarr = getOrSetPref('prefVoiceNarr', config.prefVoiceNarr);
            }
            
            // Set other variables
            config.speechRate = getOrSetPref('speechRate', config.speechRate);
            config.lastFeed = getOrSetPref('lastFeed', config.lastFeed);
                        
            // log each feed
            config.rss_feeds.forEach(feed => {
                console.log(`Feed Name: ${feed.name}`);
                });
            });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// -----------------       
// Music utils
// -----------------       

function playMusic() {
    music.play();
    setVolume(config.volumeFac);
}

function pauseMusic() {
    music.pause();
}

function stopMusic() {
    music.pause();
    music.currentTime = 0;  // Set playback time to start
}

function setVolume(value) {
    // Value should be between 0.0 and 1.0
    music.volume = value;
} 

// --------------
// Web Speech API
// --------------

// Check Web Speech API compatibility
function checkWebSpeechTTS() {
    if ('speechSynthesis' in window) {
        // TTS is supported
    } else {
        updateDisplayedText("mainString", "Your browser is not compatible with the Web Speech API text-to-speech functions used in the app, please try a different browser e.g. a recent version of Chrome");
        console.log('TTS not supported');
    }
}

function checkWebSpeechASR() {    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Speech recognition is supported
   } else {
        updateDisplayedText("mainString", "Your browser is not compatible with the Web Speech API speech recognition functions used in the app, please try a different browser e.g. a recent version of Chrome");
        console.log('Speech recognition not supported');
    }
}

// Some browsers might not return the voices list 
// until the speechSynthesis.onvoiceschanged event is fired. 
// Known issue that can cause voices.length = 0 
function getVoices() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
            return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
        };
    });
}

let attempts = 0;
function loadVoices() {
  attempts++;
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    attempts = 0;
    return voices
    //voice = voices.find(_voice => /ja[-_]JP/.test(_voice.lang));
  } else {
    if (attempts < 10) {
      setTimeout(() => {
        console.log(attempts);
        loadVoices();
      }, 250);
    } else {
      console.log('No voices found.');
    }
  }
}

// get list of available voices
async function populateVoiceLists() {

    //let voices = await loadVoices();
    let voices = await getVoices();
    //let voices = speechSynthesis.getVoices();
    
    let englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

    // Use the function to get the stored/preferred voice
    const prefVoiceSys = getPref('prefVoiceSys');
    const prefVoiceNarr = getPref('prefVoiceNarr');

    if (prefVoiceSys) {
        const selectedVoiceSys = voices.find(voice => voice.name === prefVoiceSys);
        voiceListSys.push(selectedVoiceSys);
    } 

    if (prefVoiceNarr) {
        const selectedVoiceNarr = voices.find(voice => voice.name === prefVoiceNarr);
        voiceListNarr.push(selectedVoiceNarr);
    }

    englishVoices.forEach((voice) => {             
        //console.log(voice.name)
        console.log(voice.name, "-", voice.lang);
        if(voice.name !== prefVoiceSys) {
            voiceListSys.push(voice);
        }
        if(voice.name !== prefVoiceNarr) {
            voiceListNarr.push(voice);
        }
    });
    return voiceListSys, voiceListNarr
}

// TTS
//async function speakText(text, voiceIndex, rate) {
    //speechQueue.push({ text, voiceIndex, rate });
    //processQueue();  
//    speakTextNoQueue(text, voiceIndex, rate);
//}

// Get around known issue that can cause voices.length = 0 
//async function processQueue_deprecaed() {
//    if (isSpeaking || speechQueue.length === 0) {
//      return;
//    }
    
//    isSpeaking = true;
    
//    const { text, voiceIndex, rate } = speechQueue.shift();
    
//    const voices = await getVoices();
//    const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
    
    // Check if voice index is valid
//    if (voiceIndex < 0 || voiceIndex >= englishVoices.length) {
//      console.log('Invalid voice index:', voiceIndex);
//      console.log('Setting to 0');
//      voiseIndex = 0;
//      return;
//    }
    
//    const utterance = new SpeechSynthesisUtterance(text);
//    utterance.voice = englishVoices[voiceIndex];
//    utterance.rate = rate;
    
//    utterance.onerror = function(event) {
//      console.error('Speech synthesis error:', event.error);
//    };
    
//    utterance.onend = function() {
//      isSpeaking = false;
//      processQueue();
//    };
    
//    window.speechSynthesis.speak(utterance);
//}

// Not always desirable to queue speech instructions e.g. to allow interrupt
//async function speakTextNoQueue(text, voiceIndex, rate) {
    
//    const voices = await getVoices();
//    const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));

//    const utterance = new SpeechSynthesisUtterance(text);
//    utterance.voice = englishVoices[voiceIndex];
//    utterance.rate = rate;
    
//    utterance.onerror = function(event) {
//        if (event.error === 'interrupted' || event.error === 'canceled'){
//            // do nothing
//       } else {    
//            console.error('Speech synthesis error:', event.error);
//        }
//    };
    
//    utterance.onend = function() {
//        isAcceptSent = true;
//    };
    
//    window.speechSynthesis.speak(utterance);    
//}

// Take name as argument
async function sayText(text, voiceName, rate) {
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Retrieve the list of available voices
    const voices = window.speechSynthesis.getVoices();
    // const voices = loadVoices();
    
    // Find and set the desired voice
    const selectedVoice = voices.find(voice => voice.name === voiceName);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    
    utterance.onerror = function(event) {
        if (event.error === 'interrupted' || event.error === 'canceled'){
            // do nothing
        } else {    
            console.error('Speech synthesis error:', event.error);
        }
    };
    
    utterance.onend = function() {
        isAcceptSent = true;
    };
    
    window.speechSynthesis.speak(utterance);    
}

// Process to read sentences and allow interrupt
function speakStory() {
    // Use requestAnimationFrame to create a continuous, non-blocking loop 

    if (sentIndex < sentences.length && isAcceptSent){
        isAcceptSent = false; // set to true by sayText at end of utterance
        sayText(sentences[sentIndex], config.prefVoiceNarr, config.speechRate);
        sentIndex = sentIndex + 1;
    } 
    
    // Dispatch event at end of story 
    if (sentIndex >= sentences.length){
        keepSpeaking = false;
        document.dispatchEvent(readStoryEvent);
    }

    // Check if interrupt 
    if (keepSpeaking) {
        requestAnimationFrame(speakStory);
    }
    
}

function startSpeakStory() {
    keepSpeaking = true;
    isAcceptSent = true;
    speakStory();
}

function stopSpeakStory() {
    keepSpeaking = false;
    isAcceptSent = false;
    stopSpeaking();
}

// A function to stop speaking
function stopSpeaking() {
    window.speechSynthesis.cancel();
};


// ---       
// ASR
// --- 

function startRecognition(callback) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        callback(speechResult);
        console.log('ASR result:');
        console.log(speechResult);
    };

    recognition.onerror = (event) => {
        console.error('Error occurred:', event.error);
    };

    recognition.start();
}

// ---
// UI
// ---

// Update plain text in browser window 
function updateDisplayedText(elementId, newText) {
    // Get the element by its ID
    const displayElement = document.getElementById(elementId);

    // Check if the element exists to avoid null reference errors
    if (displayElement) {
        // dynamically scale main text according to text length
        if (elementId === "mainString") {
            //console.log(newText.length)            
            displayElement.style.fontSize = '32px';
            if (newText.length > 75) {
                displayElement.style.fontSize = '28px';
            } else if (newText.length > 125) {
                contentEl.style.fontSize = '24px';
            }
        }

        // Set the new text
        displayElement.textContent = newText;
        
    } else {
        console.error(`Element with id "${elementId}" not found.`);
    }
}

// Update text with hyperlinlks in browser window 
function updateDisplayedTextwithLink(elementId, href, innerText, preLinkText, postLinkText) {
    
    // Get the element
    const displayElement = document.getElementById(elementId);

    const link = '&nbsp<a href="' + href + '" target="_blank">' + innerText + '</a>&nbsp';
    displayElement.innerHTML = preLinkText + link + postLinkText;
}