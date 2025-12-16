// Navigation History
let pageHistory = [];

// Theme Management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('contentAI_theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('contentAI_theme', 'light');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('contentAI_theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}

// Check if logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('contentAI_loggedIn');
    
    loadTheme();
    
    if (isLoggedIn === 'true') {
        showPage('home');
    } else {
        showPage('auth');
    }

    // Initialize chatbox as minimized
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
        chatbox.classList.add('minimized');
    }
});

// Auth functions
function switchToSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function login() {
    localStorage.setItem('contentAI_loggedIn', 'true');
    alert('Welcome back! 🎉');
    showPage('home');
}

function signup() {
    localStorage.setItem('contentAI_loggedIn', 'true');
    alert('Account created! Welcome to ContentAI! 🎉');
    showPage('home');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('contentAI_loggedIn');
        pageHistory = [];
        showPage('auth');
    }
}

// Smart Page Navigation with History
function showPage(pageId) {
    const currentPage = document.querySelector('.page.active');
    const currentPageId = currentPage ? currentPage.id : null;
    
    if (currentPageId && currentPageId !== pageId) {
        pageHistory.push(currentPageId);
    }
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (pageId === 'home' || pageId === 'auth' || pageHistory.length === 0) {
            backBtn.classList.remove('show');
        } else {
            backBtn.classList.add('show');
        }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    if (pageHistory.length > 0) {
        const previousPage = pageHistory.pop();
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(previousPage);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            if (previousPage === 'home' || previousPage === 'auth' || pageHistory.length === 0) {
                backBtn.classList.remove('show');
            }
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showPage('home');
    }
}

function scrollToSection(sectionId) {
    const isLoggedIn = localStorage.getItem('contentAI_loggedIn');
    
    if (isLoggedIn === 'true') {
        showPage('home');
        
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    } else {
        alert('Please login to view this content');
        showPage('auth');
    }
}

// VOICE CLONING FUNCTIONS
let mediaRecorder = null;
let recordingChunks = [];
let recordingTimer = null;
let recordingStartTime = 0;
let isRecording = false;

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordingChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordingChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordingChunks, { type: 'audio/wav' });
            // Here you would typically upload the blob to your server
            alert('Voice recording completed! 🎉 Our AI is now analyzing your voice patterns.');
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        document.getElementById('recordIcon').textContent = '⏹️';
        document.getElementById('recordText').textContent = 'Stop Recording';
        document.getElementById('recordBtn').style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        document.getElementById('recordingTimer').style.display = 'block';
        
        // Start timer
        recordingStartTime = Date.now();
        recordingTimer = setInterval(updateTimer, 1000);
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access microphone. Please check your permissions and try again.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        
        // Update UI
        document.getElementById('recordIcon').textContent = '🎤';
        document.getElementById('recordText').textContent = 'Start Recording';
        document.getElementById('recordBtn').style.background = 'linear-gradient(135deg, #10b981, #14b8a6)';
        document.getElementById('recordingTimer').style.display = 'none';
        
        // Clear timer
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = display;
}

function testSpeechRecognition() {
    console.log('Testing speech recognition...');
    
    if (!recognition) {
        initVoiceRecognition();
    }
    
    if (!recognition) {
        alert('❌ Speech recognition is not supported in your browser.\n\nPlease use:\n• Chrome\n• Edge\n• Safari\n\nMake sure you\'re using HTTPS (not HTTP)');
        return;
    }
    
    // Test basic functionality
    currentVoiceTarget = 'test';
    
    try {
        recognition.start();
        showLiveTranscription('');
        
        alert('✅ Speech recognition test started!\n\n🎤 Speak now to test the feature.\n\nYou should see your words appear in real-time.');
        
    } catch (error) {
        console.error('Test failed:', error);
        alert('❌ Test failed: ' + error.message + '\n\nTry refreshing the page and allowing microphone permissions.');
    }
}

// VOICE INPUT FUNCTIONS
let currentVoiceTarget = null;
let recognition = null;
let isListening = false;

function initVoiceRecognition() {
    console.log('Checking for speech recognition support...');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Speech recognition is supported!');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            console.log('Speech recognition started');
        };
        
        recognition.onresult = function(event) {
            console.log('Speech recognition result received');
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const fullTranscript = finalTranscript + interimTranscript;
            console.log('Transcript:', fullTranscript);
            
            // Show live transcription
            showLiveTranscription(fullTranscript);
            
            // If we have final results, show confirmation
            if (finalTranscript.trim()) {
                setTimeout(() => {
                    recognition.stop();
                    showVoiceConfirmation(finalTranscript.trim());
                }, 1500);
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Voice recognition failed: ';
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try speaking louder.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Microphone not accessible. Please check permissions.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone permission denied. Please allow microphone access.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            alert(errorMessage);
            stopListening();
            hideLiveTranscription();
        };
        
        recognition.onend = function() {
            console.log('Speech recognition ended');
            stopListening();
            // Don't hide transcription immediately, let user see the result
        };
        
        console.log('Speech recognition initialized successfully');
    } else {
        console.warn('Speech recognition not supported in this browser');
    }
}

function startVoiceInput(targetId) {
    console.log('Starting voice input for:', targetId);
    
    if (!recognition) {
        console.log('Recognition not initialized, initializing now...');
        initVoiceRecognition();
    }
    
    if (!recognition) {
        alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }
    
    // Check if already listening
    if (isListening) {
        console.log('Already listening, stopping first...');
        recognition.stop();
        return;
    }
    
    currentVoiceTarget = targetId;
    isListening = true;
    
    // Update button to show listening state
    const button = event.target;
    button.textContent = '🔴';
    button.style.animation = 'pulse 1s infinite';
    
    try {
        console.log('Starting speech recognition...');
        recognition.start();
        
        // Show live transcription display
        showLiveTranscription('');
        
        // Show listening feedback
        const notification = document.createElement('div');
        notification.className = 'voice-notification';
        notification.textContent = '🎤 Listening... Speak now!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error starting voice recognition:', error);
        alert('Error starting voice recognition: ' + error.message);
        stopListening();
        hideLiveTranscription();
    }
}

function stopListening() {
    isListening = false;
    
    // Reset all voice buttons
    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.textContent = '🎤';
        btn.style.animation = '';
    });
}

function showLiveTranscription(text) {
    let liveDisplay = document.getElementById('liveTranscription');
    
    if (!liveDisplay) {
        // Create live transcription display
        liveDisplay = document.createElement('div');
        liveDisplay.id = 'liveTranscription';
        liveDisplay.className = 'live-transcription';
        liveDisplay.innerHTML = `
            <div class="live-transcription-header">
                <span>🎤 Live Transcription</span>
                <button onclick="hideLiveTranscription()" class="close-transcription">×</button>
            </div>
            <div class="live-transcription-text" id="liveTranscriptionText"></div>
            <div class="live-transcription-footer">
                <small>Speak clearly for better accuracy • Auto-saves when you stop speaking</small>
            </div>
        `;
        document.body.appendChild(liveDisplay);
    }
    
    document.getElementById('liveTranscriptionText').textContent = text || 'Listening...';
    liveDisplay.style.display = 'block';
}

function hideLiveTranscription() {
    const liveDisplay = document.getElementById('liveTranscription');
    if (liveDisplay) {
        liveDisplay.style.display = 'none';
    }
}

function showVoiceConfirmation(transcript) {
    document.getElementById('voiceTextPreview').textContent = transcript;
    document.getElementById('voiceTextEdit').value = transcript;
    document.getElementById('voiceModal').style.display = 'flex';
}

function closeVoiceModal() {
    document.getElementById('voiceModal').style.display = 'none';
    currentVoiceTarget = null;
}

function retryVoiceInput() {
    closeVoiceModal();
    if (currentVoiceTarget) {
        // Find the button for the current target and trigger voice input again
        const targetElement = document.getElementById(currentVoiceTarget);
        if (targetElement) {
            const voiceBtn = targetElement.parentNode.querySelector('.voice-btn');
            if (voiceBtn) {
                startVoiceInput(currentVoiceTarget);
            }
        }
    }
}

function confirmVoiceInput() {
    const editedText = document.getElementById('voiceTextEdit').value;
    
    if (currentVoiceTarget && editedText.trim()) {
        const targetElement = document.getElementById(currentVoiceTarget);
        if (targetElement) {
            targetElement.value = editedText;
            
            // Trigger change event for any listeners
            const event = new Event('change', { bubbles: true });
            targetElement.dispatchEvent(event);
        }
    }
    
    closeVoiceModal();
}

// Initialize voice recognition when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing voice recognition...');
    initVoiceRecognition();
    
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported in this browser');
        // Hide voice buttons if not supported
        document.querySelectorAll('.voice-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        console.log('Speech recognition is supported!');
    }
});

// TEMPLATE FUNCTIONS
let currentTemplate = null;
let templateData = {
    mainText: '',
    subtitleText: '',
    ctaText: '',
    background: 'gradient1',
    textColor: '#ffffff'
};

function showTemplateCategory(category) {
    // Hide all template categories
    document.querySelectorAll('.template-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected category
    const selectedCategory = document.getElementById(category + '-templates');
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function openTemplateEditor(templateType) {
    currentTemplate = templateType;
    
    const titles = {
        'instagram-post': '📸 Instagram Post Template',
        'instagram-story': '📖 Instagram Story Template',
        'youtube-thumbnail': '🎬 YouTube Thumbnail Template',
        'twitter-post': '🐦 Twitter Post Template',
        'business-card': '💼 Business Card Template',
        'presentation': '📊 Presentation Template',
        'flyer': '📢 Marketing Flyer Template',
        'banner': '🎯 Web Banner Template',
        'infographic': '📊 Infographic Template',
        'worksheet': '📚 Worksheet Template'
    };
    
    document.getElementById('editor-title').textContent = titles[templateType] || '🎨 Template Editor';
    document.getElementById('editor-subtitle').textContent = 'Customize this template with your content and branding';
    
    // Reset template data
    templateData = {
        mainText: 'Your Amazing Content',
        subtitleText: 'Your Subtitle Here',
        ctaText: 'Call to Action',
        background: 'gradient1',
        textColor: '#ffffff'
    };
    
    // Update form fields
    document.getElementById('mainText').value = templateData.mainText;
    document.getElementById('subtitleText').value = templateData.subtitleText;
    document.getElementById('ctaText').value = templateData.ctaText;
    
    renderTemplate();
    showPage('template-editor');
}

function updateTemplate() {
    templateData.mainText = document.getElementById('mainText').value || 'Your Amazing Content';
    templateData.subtitleText = document.getElementById('subtitleText').value || 'Your Subtitle Here';
    templateData.ctaText = document.getElementById('ctaText').value || 'Call to Action';
    
    renderTemplate();
}

function changeBackground(bgType) {
    templateData.background = bgType;
    renderTemplate();
}

function changeTextColor(color) {
    templateData.textColor = color;
    renderTemplate();
}

function renderTemplate() {
    const canvas = document.getElementById('templateCanvas');
    
    const backgrounds = {
        'gradient1': 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'gradient2': 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        'gradient3': 'linear-gradient(135deg, #10b981, #14b8a6)',
        'dark': '#1f2937',
        'light': '#ffffff'
    };
    
    let templateHTML = '';
    
    switch(currentTemplate) {
        case 'instagram-post':
            templateHTML = `
                <div class="instagram-template" style="background: ${backgrounds[templateData.background]}; color: ${templateData.textColor};">
                    <div class="template-header">
                        <div class="profile-pic"></div>
                        <div class="profile-info">
                            <div class="username">@yourbrand</div>
                            <div class="location">Your Location</div>
                        </div>
                    </div>
                    <div class="template-main">
                        <h2>${templateData.mainText}</h2>
                        <p>${templateData.subtitleText}</p>
                        <button class="template-cta">${templateData.ctaText}</button>
                    </div>
                </div>
            `;
            break;
            
        case 'youtube-thumbnail':
            templateHTML = `
                <div class="youtube-template" style="background: ${backgrounds[templateData.background]}; color: ${templateData.textColor};">
                    <div class="thumbnail-content">
                        <h1>${templateData.mainText}</h1>
                        <p>${templateData.subtitleText}</p>
                        <div class="play-button">▶</div>
                        <div class="cta-badge">${templateData.ctaText}</div>
                    </div>
                </div>
            `;
            break;
            
        default:
            templateHTML = `
                <div class="generic-template" style="background: ${backgrounds[templateData.background]}; color: ${templateData.textColor};">
                    <h1>${templateData.mainText}</h1>
                    <p>${templateData.subtitleText}</p>
                    <button class="template-cta">${templateData.ctaText}</button>
                </div>
            `;
    }
    
    canvas.innerHTML = templateHTML;
}

function downloadTemplate() {
    alert('Template downloaded! 📥 Check your downloads folder.');
}

function saveTemplate() {
    alert('Template saved to your library! 💾');
}

// CONTENT GENERATOR FUNCTIONS
let generationsUsed = 0;
const maxGenerations = 5;

function showContentGenerator(contentType) {
    const titles = {
        // Instagram
        'reel-scripts': '🎬 Generate Reel Scripts',
        'instagram-captions': '📝 Generate Instagram Captions', 
        'instagram-stories': '📖 Generate Instagram Stories',
        
        // YouTube
        'youtube-scripts': '🎥 Generate Video Scripts',
        'youtube-shorts': '⚡ Generate Shorts Scripts',
        'youtube-thumbnails': '🖼️ Generate Thumbnail Ideas',
        
        // LinkedIn
        'linkedin-posts': '💼 Generate Professional Posts',
        'linkedin-articles': '📄 Generate LinkedIn Articles',
        'linkedin-carousels': '🎠 Generate Carousel Posts',
        
        // Twitter
        'twitter-tweets': '🔥 Generate Viral Tweets',
        'twitter-threads': '🧵 Generate Thread Content',
        'twitter-trending': '📈 Generate Trending Content',
        
        // Blog
        'blog-posts': '📝 Generate Blog Posts',
        'blog-listicles': '📋 Generate Listicles',
        'blog-tutorials': '🎯 Generate Tutorials',
        
        // Education - Students
        'essay-generator': '📝 Generate Essays',
        'research-paper': '🔬 Generate Research Papers',
        'study-notes': '📊 Generate Study Notes',
        
        // Education - Students  
        'assignment-help': '📋 Generate Assignment Help',
        'presentation-slides': '📊 Generate Presentation Slides',
        'book-summary': '📚 Generate Book Summaries',
        
        // Education - Teachers
        'question-paper': '📋 Generate Question Papers',
        'concept-explanation': '💡 Generate Concept Explanations',
        'worksheet-creator': '📄 Generate Worksheets',
        'lesson-plan': '📚 Generate Lesson Plans',
        'rubric-generator': '⭐ Generate Assessment Rubrics',
        'parent-communication': '📧 Generate Parent Communications',
        
        // Companies
        'marketing-copy': '📢 Generate Marketing Copy',
        'social-media-business': '📱 Generate Business Social Posts',
        'press-release': '📰 Generate Press Releases'
    };
    
    const subtitles = {
        // Instagram
        'reel-scripts': 'Create engaging 15-60 second video scripts that hook viewers instantly',
        'instagram-captions': 'Write compelling captions that drive engagement and match your voice',
        'instagram-stories': 'Generate story content that keeps your audience coming back for more',
        
        // YouTube
        'youtube-scripts': 'Full-length video scripts with natural flow and your speaking style',
        'youtube-shorts': 'Quick, punchy scripts for YouTube Shorts that grab attention fast',
        'youtube-thumbnails': 'Creative thumbnail concepts and text overlays that increase click-through rates',
        
        // LinkedIn
        'linkedin-posts': 'Thought leadership posts that establish your expertise and authority',
        'linkedin-articles': 'Long-form LinkedIn articles that showcase your knowledge and insights',
        'linkedin-carousels': 'Multi-slide carousel posts that educate and engage your professional network',
        
        // Twitter
        'twitter-tweets': 'Craft engaging tweets that spark conversations and drive engagement',
        'twitter-threads': 'Create compelling Twitter threads that tell stories and share insights',
        'twitter-trending': 'Jump on trending hashtags with content that fits your voice and brand',
        
        // Blog
        'blog-posts': 'Comprehensive blog posts that establish authority and drive organic traffic',
        'blog-listicles': 'Engaging list-format articles that are easy to read and highly shareable',
        'blog-tutorials': 'Step-by-step guides that provide real value to your readers',
        
        // Education - Students
        'essay-generator': 'Create essay outlines with proper structure. Perfect for any topic!',
        'research-paper': 'Structure research papers with citations and methodology sections',
        'study-notes': 'Convert complex topics into clear, organized study notes',
        
        // Education - Students
        'assignment-help': 'Get structured help with homework and assignments in any subject',
        'presentation-slides': 'Create engaging presentation content for class projects',
        'book-summary': 'Generate comprehensive summaries of books and articles',
        
        // Education - Teachers
        'question-paper': 'Create comprehensive question papers with MCQs, short answers, and essay questions',
        'concept-explanation': 'Transform complex topics into clear, easy-to-understand explanations for students',
        'worksheet-creator': 'Design engaging worksheets with practice problems, activities, and assessments',
        'lesson-plan': 'Create detailed lesson plans with objectives, activities, and assessments',
        'rubric-generator': 'Generate assessment rubrics for projects, assignments, and presentations',
        'parent-communication': 'Draft professional emails and letters to communicate with parents',
        
        // Companies
        'marketing-copy': 'Create compelling marketing content that converts and drives sales',
        'social-media-business': 'Generate engaging social media content that builds your brand',
        'press-release': 'Draft professional press releases for company announcements and news'
    };
    
    document.getElementById('generator-title').textContent = titles[contentType] || '✨ Generate Content';
    document.getElementById('generator-subtitle').textContent = subtitles[contentType] || 'Create content that sounds like you';
    
    // Update generations counter
    document.getElementById('generationsUsed').textContent = generationsUsed;
    
    showPage('content-generator');
}

function generateContent() {
    if (generationsUsed >= maxGenerations) {
        alert('You\'ve reached your daily limit of 5 free generations! Upgrade to Pro for unlimited content.');
        return;
    }
    
    const topic = document.getElementById('contentTopic').value;
    const tone = document.getElementById('contentTone').value;
    const length = document.getElementById('contentLength').value;
    const notes = document.getElementById('additionalNotes').value;
    
    if (!topic.trim()) {
        alert('Please enter a topic or idea for your content!');
        return;
    }
    
    // Simulate content generation
    const generatedText = generateSampleContent(topic, tone, length, notes);
    
    document.getElementById('generatedText').textContent = generatedText;
    document.getElementById('generatedContent').style.display = 'block';
    
    // Update counter
    generationsUsed++;
    document.getElementById('generationsUsed').textContent = generationsUsed;
    
    // Scroll to generated content
    document.getElementById('generatedContent').scrollIntoView({ behavior: 'smooth' });
}

function generateSampleContent(topic, tone, length, notes) {
    const samples = {
        casual: `Hey everyone! 👋 Let me share something amazing about ${topic}. 

Did you know that ${topic} can completely change your day? Here's what I discovered... [Your authentic experience with ${topic}]. The key is to start small and be consistent.

Try this today and let me know how it goes! Drop a comment below 👇

#${topic.replace(/\s+/g, '')} #authentic #tips`,

        professional: `Professional insight on ${topic}:

As someone who's studied ${topic}, here's what you need to know. The three key principles are: 

1) [First principle] 
2) [Second principle] 
3) [Third principle] 

This approach has proven effective because it addresses the core challenges most people face. Implement these strategies and you'll see measurable results.

What's your experience with ${topic}? I'd love to hear your thoughts in the comments.`,

        funny: `Okay, let's talk about ${topic} but make it fun! 😂

Me trying ${topic} vs. reality... 

So there I was, thinking I had ${topic} figured out... NOPE! Here's what actually happened: [Insert your funny story/experience here]. 

Moral of the story: ${topic} is harder than it looks! Who else can relate? 🙋‍♀️

#${topic.replace(/\s+/g, '')} #fail #relatable`,

        inspiring: `✨ Transform your life with ${topic} ✨

Every expert was once a beginner. Every success story started with a single step. Today, that step is ${topic}.

Here's the truth: ${topic} isn't just about [surface level benefit]. It's about becoming the person who [deeper transformation]. 

Your future self is counting on the decision you make today. Are you ready to begin?

Start with just 5 minutes today. Your journey begins now. 💪

#${topic.replace(/\s+/g, '')} #motivation #transformation`,

        educational: `📚 Everything you need to know about ${topic}

Let's break this down step by step:

🔹 What is ${topic}?
[Clear definition and explanation]

🔹 Why does it matter?
[Key benefits and importance]

🔹 How to get started:
1. [First step]
2. [Second step] 
3. [Third step]

🔹 Common mistakes to avoid:
- [Mistake 1]
- [Mistake 2]

Save this post for later and share it with someone who needs to see this!

#${topic.replace(/\s+/g, '')} #education #tips #howto`
    };
    
    return samples[tone] || samples.casual;
}

function regenerateContent() {
    if (generationsUsed >= maxGenerations) {
        alert('You\'ve reached your daily limit! Upgrade for unlimited regenerations.');
        return;
    }
    generateContent();
}

function copyContent() {
    const text = document.getElementById('generatedText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Content copied to clipboard! 📋');
    });
}

function saveContent() {
    alert('Content saved to your drafts! 💾');
}

// EDUCATION TABS FUNCTIONS
function showEducationTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('#education .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.department-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// CREATOR TABS FUNCTIONS
function showCreatorTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.creator-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// CHATBOX FUNCTIONS
function toggleChatbox() {
    const chatbox = document.getElementById('chatbox');
    const toggle = document.getElementById('chatToggle');
    
    if (chatbox.classList.contains('minimized')) {
        chatbox.classList.remove('minimized');
        toggle.textContent = '▲';
    } else {
        chatbox.classList.add('minimized');
        toggle.textContent = '▼';
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Content creation responses
    if (message.includes('content') || message.includes('write') || message.includes('create')) {
        return "I can help you create authentic content! Try our tools for students (essays, research), HR (job descriptions), companies (marketing copy), or creators (social media). What type of content do you want to create?";
    }
    
    // Getting started responses
    if (message.includes('start') || message.includes('begin') || message.includes('how')) {
        return "Getting started is easy! 1) Upload some of your existing content so I can learn your voice, 2) Choose a template that fits your needs, 3) Fill in the details and generate content that sounds like YOU. Want to try it?";
    }
    
    // Voice/AI responses
    if (message.includes('voice') || message.includes('sound') || message.includes('authentic')) {
        return "That's our specialty! ContentAI analyzes your writing style, tone, and vocabulary to create content that sounds exactly like you wrote it - not like a robot. Upload some of your past content to get started!";
    }
    
    // Pricing responses
    if (message.includes('price') || message.includes('cost') || message.includes('free')) {
        return "We have a free plan with 5 generations per month! Our Creator plan ($29/month) gives you unlimited content generation. Check out our Pricing page for full details.";
    }
    
    // Tools responses
    if (message.includes('tool') || message.includes('template') || message.includes('feature')) {
        return "We have tools for everyone! Students can create essays and research papers, HR can generate job descriptions and emails, Companies can create marketing content, and Creators can make social media posts. What's your role?";
    }
    
    // Default responses
    const defaultResponses = [
        "I'm here to help you create amazing content! What would you like to know about ContentAI?",
        "ContentAI helps you create content that sounds like YOU, not a robot. What can I help you with today?",
        "Whether you're a student, HR professional, business owner, or creator, we have tools to help you create authentic content. What's your goal?",
        "I can help you with content creation, getting started, or finding the right tools. What would you like to explore?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}