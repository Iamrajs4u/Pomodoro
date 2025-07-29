class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60; // 25 minutes in seconds
        this.shortBreakDuration = 5 * 60; // 5 minutes
        this.longBreakDuration = 15 * 60; // 15 minutes
        
        this.currentTime = this.workDuration;
        this.isRunning = false;
        this.currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
        this.cycleCount = 0;
        this.completedPomodoros = 0;
        this.totalTimeSpent = 0;
        
        this.timer = null;
        this.audioContext = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timerDisplay');
        this.sessionInfo = document.getElementById('sessionInfo');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.progressCircle = document.getElementById('progressCircle');
        this.completedPomodorosEl = document.getElementById('completedPomodoros');
        this.currentCycleEl = document.getElementById('currentCycle');
        this.totalTimeEl = document.getElementById('totalTime');
        
        // Set up progress ring
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        this.progressCircle.style.strokeDasharray = circumference;
        this.progressCircle.style.strokeDashoffset = circumference;
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.skipBtn.addEventListener('click', () => this.skip());
    }
    
    start() {
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timer = setInterval(() => {
            this.currentTime--;
            this.totalTimeSpent++;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (this.currentTime <= 0) {
                this.finish();
            }
        }, 1000);
    }
    
    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
    }
    
    reset() {
        this.pause();
        this.currentSession = 'work';
        this.currentTime = this.workDuration;
        this.updateDisplay();
        this.updateProgressRing();
        this.updateBackground();
        this.timerDisplay.classList.remove('finished');
    }
    
    skip() {
        this.pause();
        this.nextSession();
    }
    
    finish() {
        this.pause();
        this.playNotificationSound();
        this.timerDisplay.classList.add('finished');
        
        if (this.currentSession === 'work') {
            this.completedPomodoros++;
            this.completedPomodorosEl.textContent = this.completedPomodoros;
        }
        
        setTimeout(() => {
            this.nextSession();
            this.timerDisplay.classList.remove('finished');
        }, 2000);
    }
    
    nextSession() {
        if (this.currentSession === 'work') {
            this.cycleCount++;
            this.currentCycleEl.textContent = Math.floor(this.cycleCount / 2) + 1;
            
            // Every 4 work sessions, take a long break
            if (this.cycleCount % 8 === 0) {
                this.currentSession = 'longBreak';
                this.currentTime = this.longBreakDuration;
            } else {
                this.currentSession = 'shortBreak';
                this.currentTime = this.shortBreakDuration;
            }
        } else {
            this.currentSession = 'work';
            this.currentTime = this.workDuration;
        }
        
        this.updateDisplay();
        this.updateProgressRing();
        this.updateBackground();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        switch (this.currentSession) {
            case 'work':
                this.sessionInfo.textContent = '🍅 Work Session';
                break;
            case 'shortBreak':
                this.sessionInfo.textContent = '☕ Short Break';
                break;
            case 'longBreak':
                this.sessionInfo.textContent = '🌴 Long Break';
                break;
        }
        
        // Update total time
        const totalMinutes = Math.floor(this.totalTimeSpent / 60);
        this.totalTimeEl.textContent = `${totalMinutes}m`;
    }
    
    updateProgressRing() {
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        let totalDuration;
        
        switch (this.currentSession) {
            case 'work':
                totalDuration = this.workDuration;
                break;
            case 'shortBreak':
                totalDuration = this.shortBreakDuration;
                break;
            case 'longBreak':
                totalDuration = this.longBreakDuration;
                break;
        }
        
        const progress = (totalDuration - this.currentTime) / totalDuration;
        const offset = circumference - (progress * circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    updateBackground() {
        const body = document.body;
        body.className = '';
        
        switch (this.currentSession) {
            case 'work':
                body.classList.add('work-session');
                break;
            case 'shortBreak':
                body.classList.add('short-break');
                break;
            case 'longBreak':
                body.classList.add('long-break');
                break;
        }
    }
    
    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not available');
        }
    }
}

// Initialize the timer when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
