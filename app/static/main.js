// Set background music
let music = document.getElementById('backgroundMusic');

// Set TTS variables. Speech rate may vary between 0.1 and 10
//let speechQueue = [];

// Set variables
let config = {};
let feedData = {};
let sentences = {};

// let voices = loadVoices();

let voiceListSys = [];
let voiceListNarr = [];
let menuList = ["System Voice", "Narration Voice", "Voice Speed", "Music Volume"];
let speechRateList = ["Slower", "Normal Speed", "Slightly Faster", "Fast", "Very Fast"];
let speechRateVals = [0.75, 1.0, 1.25, 1.5, 2.0];
let volumeFacList = ["Moderate", "Soft", "Softer", "Softest", "Silent"];
let volumeFacVals = [1, 0.075, 0.05, 0.025, 0];

let iosNoveltyVoices = ["Rocko", "Shelley", "Grandma", "Grandpa", "Flo", "Zarvox", "Superstar", "Jester", //
        "Eddy", "Reed", "Sandy", "Ralph", "Kathy", "Bahh", "Albert", "Fred", "Organ", "Junior", "Bad News", "Bells", "Boing", //
        "Bubbles", "Cellos", "Good News", "Pipe Organ", "Trinoids", "Whisper", "Wobble"]
let availableVoices = [];
let isVoicesLoaded = false;

let verbose = false;
let feedIndex = 0;
let storyIndex = 0;
let sentIndex = 0;
let voiceIndex = 0;
let menuIndex = 0;
let speechRateIndex = 0;
let volumeFacIndex = 0;

let isSpeaking = false;
let keepSpeaking = true;
let isAcceptSent = true;
const readStoryEvent = new Event('readStoryComplete');

let touchStartX;
let touchStartY;
let touchEndX;
let touchEndY;
let currentState = "waitStart";
let outStr = "";
let rssName = "";

document.addEventListener('DOMContentLoaded', (event) => {
    checkWebSpeechTTS(); // Check browser compatibility
    loadConfigAndPrefs().then((config) => {
        populateVoiceLists().then((voiceListSys, VoiceListNarr) => {
            //if (speechSynthesis.onvoiceschanged !== undefined) {              
            //  speechSynthesis.onvoiceschanged = populateVoiceLists;
            //}
            updateDisplayedText("footer", "Number of voices available: " + voiceListSys.length);
        });
        intialiseStartPage();
    });
});

// Listen for arrow keys
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowRight') {
        stopSpeaking();
        setTimeout(() => {handleRight()},300); // delay to ensure cancel complete
    } else if (event.code === 'ArrowLeft'){
        stopSpeaking();
        setTimeout(() => {handleLeft()},300);
    } else if (event.code === 'ArrowUp'){
        stopSpeaking();
        setTimeout(() => {handleUp()},300);
    }
});

// Listen for swipe events
document.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
});

document.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    if (touchEndX > touchStartX + 75) {  // Threshold for swipe detection
        // Swipe right
        stopSpeaking();
        setTimeout(() => {handleRight()},300); // delay to ensure cancel complete
    } else if (touchEndX < touchStartX - 75){
        // Swipe left
        stopSpeaking();
        setTimeout(() => {handleLeft()}, 300); // delay to ensure cancel complete
    } else if (touchEndY < touchStartY - 75){
        // Swipe up~
        stopSpeaking();
        setTimeout(() => {handleUp()}, 300); // delay to ensure cancel complete
    }
});

document.getElementById('enableSpeech-link').addEventListener('click', function(event) {
    event.preventDefault();
    enableSpeech();
});

document.getElementById('settings-link').addEventListener('click', function(event) {
    event.preventDefault();
    navBarSettings();
});

document.getElementById('feedback-link').addEventListener('click', function(event) {
  window.open('/feedback', '_blank');
});

document.getElementById('about-link').addEventListener('click', function(event) {
    event.preventDefault();
    navBarAbout();
});

// Listen for end of story
document.addEventListener('readStoryComplete', () => {
    console.log('Finished reading story');
    currentState = "readingStory";
});
