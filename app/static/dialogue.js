// --------------------
// Dialogue State Model 
// --------------------

// Allows user to submit feature request
function submitRequest() {
    window.location.href = "mailto:abc@xyz.org?subject=Feature Request&body=Hi, %0A%20Thanks for your feedback.%0A%0A%20Please describe each of your feature requests in the following format:%0A- I am a... [optional - please say what type of user you are and why you might find the app useful in general],%0A%20- and I would like... [please describe your specific feature request],%0A%20- so that... [please say why the feature is useful]";
}

function resetIndices() {
    menuIndex = 0;
    feedIndex = 0;
    storyIndex = 0;    
    sentIndex = 0;    
}

function navBarMenu() {
    stopSpeakStory();
    resetIndices()
    playMusic();
    setTimeout(() => {initMenu()}, 200);    
    currentState = "waitMainMenu";
}

function navBarAbout() {
    stopSpeakStory();
    resetIndices()
    playMusic();
    dispStr = `Find out more at tympi.io`;
    outStr = `This app is designed to make news more accessible. 
        Find out more at timpee dot I O`;
    updateDisplayedText("mainString", dispStr);
    setTimeout(() => {sayText(outStr, config.prefVoiceNarr, config.speechRate)}, 200);    
    setTimeout(() => {intialiseStartPage()}, 5000);
    currentState = "waitStart";
}

// Start page
function intialiseStartPage() {
    footerStr = "'RIGHT' to select, 'LEFT' to skip, 'UP' to go back"
    outStr = "Swipe or use the arrow keys." + footerStr;
    updateDisplayedText("mainString", outStr);
    updateDisplayedText("footer", footerStr);
    try {
        // TO DO: ckeck TTS allowed e.g. after user event
        //sayText(outStr, config.prefVoiceSys, config.speechRate)
    } catch (error) {
        //console.log('Error:', error);
        console.log('Note: no permission for TTS until user event');
    }
}

function rightOnHome() {
    playMusic();
    initFeedSelect();
}

function leftOnHome() {
    playMusic();
    dispStr = `You should be able to hear instructions being spoken aloud.
        If not check your audio settings, click 'About', or try a different browser.`;
    outStr = `Swipe or use the arrow keys to navigate.
        Use 'RIGHT' to select, 'LEFT' to skip, or 'UP' to go back. 
        First select a news source, for example BBC news. 
        Next select a news story.
        When you are listening to a story you can pause or interrupt 
        using 'LEFT', 'RIGHT', or 'UP'`;
    const footerStr = `'RIGHT' to select, or 'UP' to go back`
    sayText(outStr, config.prefVoiceSys, config.speechRate)
    updateDisplayedText("mainString", dispStr);
    updateDisplayedText("footer", footerStr);
}

function initMenu() {
    outStr = `Please choose from the following list of settings.
        Use 'RIGHT' to select. 'LEFT' to skip, and 'UP'' to go back'`;
    sayText(outStr, config.prefVoiceSys, config.speechRate);
    outStr = menuList[menuIndex];
    updateDisplayedText("mainString", outStr);
    updateDisplayedText("footer", "");
    sayText(outStr, config.prefVoiceNarr, config.speechRate);
}

function initFeedSelect() {
    const instructStr = `'RIGHT' to select, 'LEFT' to skip, or 'UP' to go back`
    updateDisplayedText("footer", instructStr);
    outStr = `Please choose from the following news sources.` + instructStr;
    sayText(outStr, config.prefVoiceSys, config.speechRate)
    rssName = config.rss_feeds[feedIndex].name;
    updateDisplayedText("mainString", rssName);
    sayText(rssName, config.narrVoiceIndex, config.speechRate)
}

function offerSysVoice () {
    const instructStr = `Voice: ${voiceIndex+1}/${voiceListSys.length}`
    outStr = `This is the voice of ${voiceListSys[voiceIndex].name}. 
        Select RIGHT if you want this voice as your system guide`;
    updateDisplayedText("mainString", voiceListSys[voiceIndex].name);
    updateDisplayedText("footer", instructStr);
    sayText(outStr, voiceListSys[voiceIndex].name, config.speechRate);             
}

function offerNarrVoice () {
    const instructStr = `Voice: ${voiceIndex+1}/${voiceListNarr.length}`
    outStr = `This is the voice of ${voiceListNarr[voiceIndex].name}. 
        Select RIGHT if you want this voice to read the news stories`;
    updateDisplayedText("mainString", voiceListNarr[voiceIndex].name);
    updateDisplayedText("footer", instructStr);
    sayText(outStr, voiceListNarr[voiceIndex].name, config.speechRate);             
}

function offerSpeechRate () {
    const instructStr = `Option: ${speechRateIndex+1}/${speechRateList.length}`
    outStr = `This is what a ${speechRateList[speechRateIndex]} voice sounds like. 
        Select RIGHT if you want the synthetic voices to read at this speed`;
    updateDisplayedText("mainString", speechRateList[speechRateIndex]);
    updateDisplayedText("footer", instructStr);
    sayText(outStr, config.prefVoiceSys, speechRateVals[speechRateIndex]);             
}

function announceLastVoice () {
    outStr = `That was the last voice in the list. 
        Let's start again`;
    sayText(outStr, config.prefVoiceSys, config.speechRate);  
}

// -----------
// State Model 
// -----------

async function handleRight() {

    switch (currentState) {
        case "waitStart":
            rightOnHome();
            currentState = "waitSelectFeed"; 
            break;
        case "waitSelectFeed":
            try {
                // Fetch feed info and read story headline
                const selectedFeed = config.rss_feeds[feedIndex];
                rssName = selectedFeed.name;
                rssUrl = selectedFeed.url;
                
                outStr = `Okay, getting news from`;
                sayText(outStr, config.prefVoiceSys, config.speechRate)
                sayText(rssName, config.prefVoiceNarr, config.speechRate)
                
                outStr = `Please select from the following news headlines`;
                // Fetch feed data and speak prompt concurrently
                [feedData, dummyData] = await Promise.all([fetchFeedContent(rssUrl), sayText(outStr, config.prefVoiceSys, config.speechRate)]);
                        
                // Read story headline                    
                storyTitle = feedData[storyIndex].title;
                storySummary = feedData[storyIndex].summary;
                updateDisplayedText("mainString", storyTitle);
                updateDisplayedText("footer", rssName);
                sayText(storyTitle, config.narrVoiceIndex, config.speechRate)

                currentState = "waitSelectStory"; 
            } catch {
                outStr = `Sorry, it wasn't possible to retreive news from ${rssName}`;
                sayText(outStr, config.sysVoiceIndex, config.speechRate)
            }
            break;
        case "waitSelectStory":
            try {
                // Get selected news story
                const selectedStory = feedData[storyIndex];
    
                storyTitle = selectedStory.title;
                storySummary = selectedStory.summary;
    
                outStr = `Okay, getting story`;
                sayText(outStr, config.prefVoiceSys, config.speechRate)
                pauseMusic();
                        
                // get sentences
                sentIndex = 0;
                sentences = await fetchSents(selectedStory.link);
                startSpeakStory();
    
                currentState = "readingStory"; 
            } catch {
                outStr = `Sorry, it wasn't possible to retrieve that story`;
                sayText(outStr, config.sysVoiceIndex, config.speechRate)
            }

            break;
        case "readingStory":
            // Restart play
            startSpeakStory()
            
            // Stop reading and select next story
            if (false){
                stopSpeakStory();
                playMusic();
                storyIndex = storyIndex + 1;
                sentIndex = 0;
                currentState = "waitSelectStory";
                outStr = `Done. The next story is.`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);
                // Read the title and wait
                storyName = feedData[storyIndex].title;
                updateDisplayedText("mainString", storyName);
                sayText(storyName, config.narrVoiceIndex, config.speechRate);
            }
            
            break;
        case "waitMainMenu":
            console.log(menuList[menuIndex])
            switch (menuList[menuIndex]) {
                case "System Voice":                    
                    currentState = "waitSelectSysVoice";
                    offerSysVoice();
                    break;
                case "Narration Voice":                    
                    currentState = "waitSelectNarrVoice";
                    offerNarrVoice();
                    break;
                case "Voice Speed":                    
                    currentState = "waitSelectSpeechRate";
                    offerSpeechRate();
                    break;
            }
            break;
        case "waitSelectSysVoice":
            config.prefVoiceSys = setPref('prefVoiceSys', voiceListSys[voiceIndex].name); 
            outStr = `Good. This is the new guide voice`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            voiceIndex = 0;
            currentState = "waitStart";
            intialiseStartPage();
            break;
        case "waitSelectNarrVoice":
            config.prefVoiceNarr = setPref('prefVoiceNarr', voiceListNarr[voiceIndex].name); 
            outStr = `Done. This is the new voice for reading news stories`;
            sayText(outStr, config.prefVoiceNarr, config.speechRate);
            voiceIndex = 0;
            currentState = "waitStart";
            intialiseStartPage();
            break;
        case "waitSelectSpeechRate":
            config.speechRate = setPref('speechRate', speechRateVals[speechRateIndex]); 
            outStr = `Okay. This is the new voice speed`;
            sayText(outStr, config.prefVoiceNarr, config.speechRate);
            speechRateIndex = 0;
            currentState = "waitStart";
            intialiseStartPage();
            break;
        
        default:
            console.error("Invalid state: ", currentState);
    }
}

function handleLeft() {
    switch (currentState) {
        case "waitStart":
            leftOnHome();
            //currentState = "waitMainMenu"
            break;
        case "waitSelectFeed":
            // Go to next feed in list
            feedIndex = feedIndex + 1;


            outStr = `Skipping`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            
            if (feedIndex >= config.rss_feeds.length) {
                // Return to first feed
                feedIndex = 0;
                outStr = `Here's the list again`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);
                // Announce first feed name
                rssName = config.rss_feeds[feedIndex].name;
                updateDisplayedText("mainString", rssName);
                sayText(rssName, config.narrVoiceIndex, config.speechRate);              
            } else {
                // Read the feed name
                rssName = config.rss_feeds[feedIndex].name;
                updateDisplayedText("mainString", rssName);
                sayText(rssName, config.narrVoiceIndex, config.speechRate);
            }

            updateDisplayedText("footer", `Option: ${feedIndex+1}/${config.rss_feeds.length}`);

            break;           
        case "waitSelectStory":
            // Go to next news story in list
            outStr = `Skipping`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            storyIndex = storyIndex + 1;
            
            if (storyIndex >= feedData.length) {
                // Return to feed dialogue
                feedIndex = feedIndex + 1;              
                if (feedIndex < feedData.length){
                    // do nothing
                } else {
                    feedIndex = 0;
                }
                storyIndex = 0;
                currentState = "waitSelectFeed"
      
                outStr = `That's the last story in the list.`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);
      
                initFeedSelect();

            } else {
                // Read the title and wait
                storyName = feedData[storyIndex].title;
                updateDisplayedText("mainString", storyName);
                sayText(storyName, config.narrVoiceIndex, config.speechRate);
                updateDisplayedText("footer", `${rssName}: ${storyIndex+1}/${feedData.length}`);
            }
            break;           
        case "readingStory":
        
            // Pause play
            //if (keepSpeaking) {
                //sayText("Pause", config.prefVoiceSys, config.speechRate);
                stopSpeakStory()
            //} else {
                // do nothing
            //}

            if (false) {
                stopSpeakStory();
                playMusic();
                storyIndex = storyIndex + 1;
                sentIndex = 0;
                currentState = "waitSelectStory"
    
                if (storyIndex < feedData.length){
                    outStr = `Here's the next story`;
                    sayText(outStr, config.prefVoiceSys, config.speechRate);
                    
                    // Read the title and wait
                    storyName = feedData[storyIndex].title;
                    updateDisplayedText("mainString", storyName);
                    sayText(storyName, config.narrVoiceIndex, config.speechRate);
                } else {
                    feedIndex = feedIndex + 1;
                    storyIndex = 0;
                    currentState = "waitSelectFeed"
                    outStr = `That was the last story in the list.
                         Let's select another news source`;
                    sayText(outStr, config.prefVoiceSys, config.speechRate);
                    rssName = config.rss_feeds[feedIndex].name;
                    updateDisplayedText("mainString", rssName);
                    sayText(rssName, config.narrVoiceIndex, config.speechRate)
                }      
            }
      
            break;           
        case "waitMainMenu":
            menuIndex = menuIndex + 1;
            if (menuIndex < menuList.length) {
                sayText("Skipping", config.prefVoiceSys, config.speechRate);    
                outStr = menuList[menuIndex];
                updateDisplayedText("mainString", outStr);
                sayText(outStr, config.prefVoiceNarr, config.speechRate);
            } else {
                outStr = `That was the last option in the settings list`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);  
                menuIndex = 0;
                initMenu();
            }
            break;
        case "waitSelectSysVoice":
            voiceIndex = voiceIndex + 1;            
            if (voiceIndex < voiceListSys.length) {
                offerSysVoice();
            } else {
                announceLastVoice();
                menuIndex = 0;
                voiceIndex = 0;
                initMenu();
                currentState ="waitMainMenu";
            }
            break;
        case "waitSelectNarrVoice":
            voiceIndex = voiceIndex + 1;            
            if (voiceIndex < voiceListNarr.length) {
                offerNarrVoice();
            } else {
                announceLastVoice();
                menuIndex = 0;
                voiceIndex = 0;
                initMenu();
                currentState ="waitMainMenu";
            }
            break;
        case "waitSelectSpeechRate":
            speechRateIndex = speechRateIndex + 1;
            if (speechRateIndex < speechRateList.length){
                offerSpeechRate();
            } else {
                outStr = `That was the last voice speed option. 
                    Let's start again.`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);  
                speechRateIndex = 0;
                menuIndex = 0;
                initMenu();
                currentState = "waitMainMenu"; 
            }     
       
            break;
        default:
            console.error("Invalid state");
    }
}

function handleUp() {
    switch (currentState) {
        case "waitStart":
            playMusic();
            menuIndex = 0;
            initMenu();
            currentState = "waitMainMenu"
            break;
        case "waitSelectFeed":
            feedIndex = 0;
            outStr = `Returning to home`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            intialiseStartPage();
            currentState = "waitStart";
            stopMusic();
            break;           
        case "waitSelectStory":
            feedindex = feedIndex + 1;
            storyIndex = 0;
            outStr = `Let's select a different news feed`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            intialiseStartPage();
            currentState = "waitSelectFeed"
            initFeedSelect();
            break;           
        case "readingStory":
            console.log(isAcceptSent)
            stopSpeakStory();
            playMusic();
            storyIndex = storyIndex + 1;
            sentIndex = 0;
            currentState = "waitSelectStory"
    
            if (storyIndex < feedData.length){
                outStr = `Here's the next story`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);
                
                // Read the title and wait
                storyName = feedData[storyIndex].title;
                updateDisplayedText("mainString", storyName);
                sayText(storyName, config.narrVoiceIndex, config.speechRate);
                currentState = "waitSelectStory"
            } else {
                feedIndex = feedIndex + 1;
                storyIndex = 0;
                currentState = "waitSelectFeed"
                outStr = `That was the last story in the list.`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);
                rssName = config.rss_feeds[feedIndex].name;
                updateDisplayedText("mainString", rssName);
                sayText(rssName, config.narrVoiceIndex, config.speechRate)
            }      

            if (false) {
                outStr = `Here's the first story ftom the list`;
                sayText(outStr, config.prefVoiceSys, config.speechRate);
                stopSpeakStory();
                storyIndex = 0;
                storyName = feedData[storyIndex].title;
                updateDisplayedText("mainString", storyName);
                sayText(storyName, config.narrVoiceIndex, config.speechRate);
                currentState = "waitSelectStory"
            }
            break;           
        case "waitMainMenu":
            outStr = `Returning to home`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            currentState = "waitStart"
            stopMusic();
            intialiseStartPage();
            break;
        case "waitSelectSysVoice":
            outStr = `Okay, let's set a different option`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            currentState = "waitMainMenu"
            menuIndex = 0;
            voiceIndex = 0;
            initMenu();
            break;
        case "waitSelectNarrVoice":
            outStr = `Okay, let's set a different option`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            currentState = "waitMainMenu"
            menuIndex = 0;
            voiceIndex = 0;
            initMenu();
            break;
        case "waitSelectSpeechRate":
            outStr = `Okay, let's set a different option`;
            sayText(outStr, config.prefVoiceSys, config.speechRate);
            currentState = "waitMainMenu"
            menuIndex = 0;
            speechRateIndex = 0;
            initMenu();
            break;
        default:
            console.error("Invalid state");
    }
}


