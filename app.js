/**
 * Safe Ride Assist - Core State Machine Simulator
 * 
 * Simulates the backend workflows (Node.js/Flask equivalent) locally
 * using purely HTML/JS due to lack of local runtime constraints.
 */

// UI Elements
const els = {
    // Admin Controls
    btnStop: document.getElementById('btn-stop-detection'),
    btnTimeout: document.getElementById('btn-rider-timeout'),
    btnUnsafe: document.getElementById('btn-rider-unsafe'),
    btnDrvSuspicious: document.getElementById('btn-driver-suspicious'),
    btnDrvNoResp: document.getElementById('btn-driver-no-response'),
    btnReset: document.getElementById('btn-reset'),
    
    // Admin Logs
    logOutput: document.getElementById('log-output'),
    
    // Rider App Elements
    marker: document.getElementById('car-marker'),
    modal: document.getElementById('safety-modal'),
    emergencyOverlay: document.getElementById('emergency-overlay'),
    btnSafe: document.getElementById('btn-app-safe'),
    btnHelp: document.getElementById('btn-app-help'),
    timerFill: document.getElementById('modal-timer-fill'),
    incomingCallOverlay: document.getElementById('incoming-call-overlay'),
    driverCallOverlay: document.getElementById('driver-call-overlay'), // ADDED
    btnCallAnswer: document.getElementById('btn-call-answer'),
    btnCallDecline: document.getElementById('btn-call-decline'),
};

// State Enum
const STATE = {
    RIDING: 'RIDING',
    STOPPED_DETECTED: 'STOPPED_DETECTED',
    RIDER_PROMPTED: 'RIDER_PROMPTED',
    CALLING_RIDER: 'CALLING_RIDER',
    CALLING_DRIVER: 'CALLING_DRIVER',
    EMERGENCY: 'EMERGENCY',
    RESOLVED_SAFE: 'RESOLVED_SAFE'
};

let currentState = STATE.RIDING;
let modalTimeoutInterval = null;

/**
 * UTILS: Logger
 */
function logSystem(message, level = 'info') {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${level}`;
    
    entry.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-msg">${message}</span>
    `;
    
    els.logOutput.appendChild(entry);
    els.logOutput.scrollTop = els.logOutput.scrollHeight;
}

/**
 * STATE MANAGEMENT LOGIC
 */

function transitionState(newState, reason) {
    if (modalTimeoutInterval) {
        clearTimeout(modalTimeoutInterval);
        modalTimeoutInterval = null;
    }
    currentState = newState;
    logSystem(`State transitioned to <strong>${newState}</strong> (${reason})`, 'info');
    updateUIForState();
}

function spawnNearestDrivers() {
    const dispatchLayer = document.getElementById('dispatch-layer');
    if (!dispatchLayer) return;
    
    dispatchLayer.innerHTML = '';
    
    const startPositions = [
        { top: '10%', left: '80%' },
        { top: '80%', left: '10%' }
    ];
    
    startPositions.forEach((pos, index) => {
        const driver = document.createElement('div');
        driver.className = 'dispatch-driver';
        driver.innerHTML = '<i class="fa-solid fa-motorcycle"></i>';
        driver.style.top = pos.top;
        driver.style.left = pos.left;
        
        dispatchLayer.appendChild(driver);
        
        // Trigger reflow
        void driver.offsetWidth;
        
        setTimeout(() => {
            driver.classList.add('active');
            logSystem(`Dispatching Nearest Rescue Driver #${index+1} from vicinity...`, 'info');
            // Move towards stopped car
            driver.style.top = '32%';
            driver.style.left = '32%';
        }, index * 800 + 500);
    });
}

function updateUIForState() {
    // Reset control buttons
    els.btnTimeout.disabled = true;
    els.btnUnsafe.disabled = true;
    els.btnDrvSuspicious.disabled = true;
    els.btnDrvNoResp.disabled = true;
    
    switch (currentState) {
        case STATE.RIDING:
            els.marker.classList.remove('stopped');
            els.modal.classList.add('hidden');
            els.incomingCallOverlay?.classList.add('hidden');
            els.driverCallOverlay?.classList.add('hidden'); // ADDED
            els.emergencyOverlay.classList.add('hidden');
            els.btnStop.disabled = false;
            
            const dispatchLayer = document.getElementById('dispatch-layer');
            if(dispatchLayer) dispatchLayer.innerHTML = '';
            break;
            
        case STATE.STOPPED_DETECTED:
            els.btnStop.disabled = true;
            els.marker.classList.add('stopped');
            logSystem(`Vehicle stopped over 60s at coordinates [22.7196, 75.8577]`, 'warn');
            
            // Advance to prompt immediately for demo
            setTimeout(() => {
                transitionState(STATE.RIDER_PROMPTED, 'Triggering Safety Workflow');
            }, 1000);
            break;
            
        case STATE.RIDER_PROMPTED:
            els.modal.classList.remove('hidden');
            logSystem(`API Call formatting... Sending Push/SMS Notification to Rider.`, 'info');
            
            // Enable admin overrides
            els.btnTimeout.disabled = false;
            
            // UI Timer Effect
            let width = 100;
            els.timerFill.style.transition = 'none';
            els.timerFill.style.width = '100%';
            
            setTimeout(() => {
                els.timerFill.style.transition = 'width 10s linear';
                els.timerFill.style.width = '0%';
            }, 50);
            
            // Automatically transition if timer runs out (10 seconds)
            modalTimeoutInterval = setTimeout(() => {
                logSystem(`Automatic Rider timeout (No response to notification)`, 'warn');
                transitionState(STATE.CALLING_RIDER, 'Notification Timeout');
            }, 10000);
            break;
            
        case STATE.CALLING_RIDER:
            els.modal.classList.add('hidden');
            els.incomingCallOverlay?.classList.remove('hidden');
            els.btnUnsafe.disabled = false; // allow simulation of answering "unsafe"
            logSystem(`Triggering Twilio Voice API -> Calling Rider +91-9876543210...`, 'warn');
            
            // Automatically transition if call rings for 10 seconds with no answer
            modalTimeoutInterval = setTimeout(() => {
                logSystem(`Automatic Call timeout (Rider did not answer the phone)`, 'warn');
                transitionState(STATE.CALLING_DRIVER, 'Missed Call Timeout');
            }, 10000);
            break;
            
        case STATE.CALLING_DRIVER:
            els.incomingCallOverlay?.classList.add('hidden');
            els.driverCallOverlay?.classList.remove('hidden'); // ADDED
            els.btnDrvSuspicious.disabled = false;
            els.btnDrvNoResp.disabled = false;
            logSystem(`Rider unreachable. Calling Driver +91-8765432109...`, 'warn');
            
            // Automatically transition to EMERGENCY after 8 seconds
            modalTimeoutInterval = setTimeout(() => {
                logSystem(`Automatic Call timeout (Driver unresponsive/suspicious)`, 'critical');
                transitionState(STATE.EMERGENCY, 'Driver Unresponsive');
            }, 8000);
            break;
            
        case STATE.EMERGENCY:
            els.modal.classList.add('hidden');
            els.incomingCallOverlay?.classList.add('hidden');
            els.driverCallOverlay?.classList.add('hidden'); // ADDED
            els.emergencyOverlay.classList.remove('hidden');
            logSystem(`CRITICAL: Escalate triggered. Sharing Ride tracking link via SMS to emergency contacts.`, 'critical');
            logSystem(`Notifying central dispatch & nearest riders.`, 'critical');
            spawnNearestDrivers();
            break;
            
        case STATE.RESOLVED_SAFE:
            els.modal.classList.add('hidden');
            els.incomingCallOverlay?.classList.add('hidden');
            els.driverCallOverlay?.classList.add('hidden'); // ADDED
            els.marker.classList.remove('stopped');
            logSystem(`Safety confirmed. Resuming normal trip tracking.`, 'success');
            setTimeout(() => { transitionState(STATE.RIDING, 'Normal resumption'); }, 3000);
            break;
    }
}

/**
 * EVENT LISTENERS (Rider App Interaction)
 */
els.btnSafe.addEventListener('click', () => {
    logSystem(`Rider clicked: "YES, I'm safe"`, 'success');
    transitionState(STATE.RESOLVED_SAFE, 'Rider Verified');
});

els.btnHelp.addEventListener('click', () => {
    logSystem(`Rider clicked: "NO, Need Help!"`, 'critical');
    transitionState(STATE.EMERGENCY, 'Direct SOS from Rider');
});

els.btnCallAnswer?.addEventListener('click', () => {
    logSystem(`Rider answered the incoming call and verified they are safe.`, 'success');
    transitionState(STATE.RESOLVED_SAFE, 'Rider Call Safe');
});

els.btnCallDecline?.addEventListener('click', () => {
    logSystem(`Rider declined the incoming call! Escalating to driver.`, 'warn');
    transitionState(STATE.CALLING_DRIVER, 'Rider Call Declined');
});


/**
 * EVENT LISTENERS (Admin Simulation Triggers)
 */
els.btnStop.addEventListener('click', () => {
    transitionState(STATE.STOPPED_DETECTED, 'Admin Simulation');
});

els.btnTimeout.addEventListener('click', () => {
    logSystem(`Simulated Rider timeout (No response to notification)`, 'warn');
    transitionState(STATE.CALLING_RIDER, 'Notification Timeout');
});

els.btnUnsafe.addEventListener('click', () => {
    logSystem(`Simulated Rider answering call and stating they feel unsafe`, 'critical');
    transitionState(STATE.EMERGENCY, 'Rider Call Unsafe');
});

els.btnDrvSuspicious.addEventListener('click', () => {
    logSystem(`Simulated calling driver -> Driver gave suspicious explanation`, 'critical');
    transitionState(STATE.EMERGENCY, 'Driver Suspicious');
});

els.btnDrvNoResp.addEventListener('click', () => {
    logSystem(`Simulated no answer from whoever was called last -> Escalate!`, 'critical');
    transitionState(STATE.EMERGENCY, 'Unresponsive Parties');
});

els.btnReset.addEventListener('click', () => {
    els.logOutput.innerHTML = '';
    logSystem(`SYSTEM RESET.`, 'info');
    transitionState(STATE.RIDING, 'Manual Reset');
});


// Initialization
window.onload = () => {
    logSystem(`Safe Ride AI Engine Booted v1.0.`, 'success');
    logSystem(`Awaiting telemetry data...`, 'info');
    updateUIForState();
};
