/**
 * System Configuration
 */
const mapData = {
    'node-gate-1': { name: 'Gate 1 (West)', crowd: 'High', wait: '18m', type: 'gate' },
    'node-gate-2': { name: 'Gate 2 (North)', crowd: 'High', wait: '12m', type: 'gate' },
    'node-gate-3': { name: 'Gate 3 (South)', crowd: 'Medium', wait: '6m', type: 'gate' },
    'node-food-a': { name: 'Food Court A', crowd: 'High', wait: '15m', type: 'food' },
    'node-food-b': { name: 'Food Court B', crowd: 'Low', wait: '2m', type: 'food' },
    'node-seat-a': { name: 'Section A', crowd: 'Medium', wait: 'N/A', type: 'seat' },
    'node-seat-b': { name: 'Section B', crowd: 'Low', wait: 'N/A', type: 'seat' },
    'node-seat-c': { name: 'Section C', crowd: 'Medium', wait: 'N/A', type: 'seat' },
    'node-wash-n': { name: 'North Washrooms', crowd: 'Low', wait: '1m', type: 'wash' },
    'node-wash-s': { name: 'South Washrooms', crowd: 'Medium', wait: '5m', type: 'wash' },
    'node-exit-nw': { name: 'NW Emergency Exit', crowd: 'None', wait: '0m', type: 'exit' },
    'node-exit-se': { name: 'SE Emergency Exit', crowd: 'None', wait: '0m', type: 'exit' },
    'node-field': { name: 'Main Field', crowd: 'Restricted', wait: 'N/A', type: 'other' }
};

const gateMapping = { 'Gate 1': 'node-gate-1', 'Gate 2': 'node-gate-2', 'Gate 3': 'node-gate-3' };
const goalMapping = { 
    'food': 'node-food-b', 
    'washroom': 'node-wash-n', 
    'seat': 'node-seat-c', 
    'exit': 'node-exit-se' 
};

/**
 * Auth System
 */
const authOverlay = document.getElementById('auth-overlay');
const signinView = document.getElementById('signin-view');
const signupView = document.getElementById('signup-view');
const appContainer = document.getElementById('app');
const displayName = document.getElementById('display-name');

if (document.getElementById('to-signup')) {
    document.getElementById('to-signup').onclick = () => { signinView.style.display = 'none'; signupView.style.display = 'block'; };
}
if (document.getElementById('to-signin')) {
    document.getElementById('to-signin').onclick = () => { signupView.style.display = 'none'; signinView.style.display = 'block'; };
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('stadiumUser'));
    if (user && user.isLoggedIn) showApp(user.name);
    else showAuth();
}

function showApp(name) { 
    if (authOverlay) authOverlay.style.display = 'none'; 
    if (appContainer) appContainer.style.display = 'flex'; 
    if (displayName) displayName.innerText = name; 
}

function showAuth() { 
    if (authOverlay) authOverlay.style.display = 'flex'; 
    if (appContainer) appContainer.style.display = 'none'; 
}

if (document.getElementById('btn-signup')) {
    document.getElementById('btn-signup').onclick = () => {
        const name = document.getElementById('signup-name').value;
        const newUser = { name, email: document.getElementById('signup-email').value, isLoggedIn: true };
        localStorage.setItem('stadiumUser', JSON.stringify(newUser));
        showApp(name);
    };
}

if (document.getElementById('btn-signin')) {
    document.getElementById('btn-signin').onclick = () => {
        const user = JSON.parse(localStorage.getItem('stadiumUser')) || { name: "Guest" };
        user.isLoggedIn = true;
        localStorage.setItem('stadiumUser', JSON.stringify(user));
        showApp(user.name);
    };
}

if (document.getElementById('google-signin')) {
    document.getElementById('google-signin').onclick = () => {
        localStorage.setItem('stadiumUser', JSON.stringify({ name: "Google User", isLoggedIn: true }));
        showApp("Google User");
    };
}

if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').onclick = () => {
        const user = JSON.parse(localStorage.getItem('stadiumUser'));
        if(user) user.isLoggedIn = false;
        localStorage.setItem('stadiumUser', JSON.stringify(user));
        showAuth();
    };
}

checkAuth();

/**
 * Map Interactivity Logic
 */
const tooltip = document.getElementById('map-tooltip');
document.querySelectorAll('.map-node').forEach(node => {
    node.addEventListener('click', (e) => {
        const data = mapData[node.id];
        if (!data) return;
        
        document.getElementById('tt-name').innerText = data.name;
        document.getElementById('tt-crowd').innerText = data.crowd;
        document.getElementById('tt-wait').innerText = data.wait;

        const rect = node.getBoundingClientRect();
        const parentRect = document.getElementById('stadium-map').getBoundingClientRect();
        
        tooltip.style.left = (rect.left - parentRect.left + rect.width/2) + 'px';
        tooltip.style.top = (rect.top - parentRect.top) + 'px';
        tooltip.style.display = 'block';

        setTimeout(() => tooltip.style.display = 'none', 3000);
    });
});

// App Logic
const btnAction = document.getElementById('btnAction');
const loader = document.getElementById('loader-overlay');
const output = document.getElementById('output');
const goalSelect = document.getElementById('goalSelect');

if (btnAction) {
    btnAction.addEventListener('click', () => {
        btnAction.disabled = true;
        loader.style.display = 'flex';
        output.style.display = 'none';
        
        const userType = document.getElementById('userType').value;
        const locationName = document.getElementById('location').value;
        const targetGoal = goalSelect.value;

        setTimeout(() => {
            processJourney(userType, locationName, targetGoal);
            btnAction.disabled = false;
            loader.style.display = 'none';
            output.style.display = 'flex';
        }, 1500);
    });
}

function processJourney(userType, locationName, targetGoal) {
    // Reset Map
    document.querySelectorAll('.map-node').forEach(n => n.classList.remove('active-user', 'recommended'));
    
    const startId = gateMapping[locationName];
    const endId = goalMapping[targetGoal];
    
    document.getElementById(startId).classList.add('active-user');
    document.getElementById(endId).classList.add('recommended');

    let res = "", time = "4m", path = "", crowd = "Low", alert = "";

    if (targetGoal === 'food') {
        res = `I've analyzed the queues. **Food Court B** is currently at 20% capacity. Proceed via the South Corridor.`;
        path = "S Corridor → Sector 104";
        crowd = "Low";
        alert = "Food Court A is currently experiencing a data surge (85% density).";
    } else if (targetGoal === 'washroom') {
        res = `The **North Washrooms** are nearest. Wait time is under 1 minute.`;
        path = "N Wing → Section 204";
        crowd = "Low";
        alert = "Maintenance is scheduled at the South facilities in 20 minutes.";
    } else if (targetGoal === 'exit') {
        res = `EMERGENCY ALERT: Correcting exit path. **SE Exit** is cleared for prioritized throughput.`;
        path = "SE Exit → Perimeter B";
        crowd = "Zero";
        alert = "Emergency vehicles detected at NW Exit. Stay clear of the North Perimeter.";
    } else {
        res = `Path optimized for your seat in **Section C**. The elevators are operational for accessibility needs.`;
        path = "Tunnel 5 → Block D, Row 12";
        crowd = "Medium";
        alert = "Minor congestion at Tunnel 2. Maintain a steady pace.";
    }

    // Sync UI
    document.getElementById('aiResponse').innerHTML = res;
    document.getElementById('estTime').innerText = time;
    document.getElementById('optPath').innerText = path;
    document.getElementById('statusBadge').innerText = crowd + " Crowd";
    document.getElementById('statusBadge').className = `status-badge badge-${crowd.toLowerCase()}`;
    document.getElementById('alertMsg').innerText = alert;
    document.getElementById('aiAlert').className = "alert-box " + (crowd === 'High' ? "alert-warn" : "alert-info");
}

// Emergency Mode
if (document.getElementById('btnEmergency')) {
    document.getElementById('btnEmergency').onclick = () => document.getElementById('emergency-modal').style.display = 'flex';
}
if (document.getElementById('closeEmergency')) {
    document.getElementById('closeEmergency').onclick = () => document.getElementById('emergency-modal').style.display = 'none';
}

// Voice Simulation
const micBtn = document.getElementById('micBtn');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    micBtn.onclick = () => { recognition.start(); micBtn.classList.add('active'); };
    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript.toLowerCase();
        if (text.includes('food')) goalSelect.value = 'food';
        else if (text.includes('exit')) goalSelect.value = 'exit';
        micBtn.classList.remove('active');
        btnAction.click();
    };
}
