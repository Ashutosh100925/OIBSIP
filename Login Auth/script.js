/**
 * NexusAuth - Premium Authentication Logic
 * A fully functional frontend-only auth simulation using localStorage.
 */

// Generic UI Functions
const togglePasswordVisibility = () => {
    const toggleBtns = document.querySelectorAll('.btn-toggle-password');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon (simple visual change)
            if (type === 'text') {
                this.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                this.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    });
};

const showFeedback = (elementId, message, isError = true) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.textContent = message;
    el.classList.remove('hidden');
    
    if (isError) {
        el.classList.add('error');
        el.classList.remove('success');
    } else {
        el.classList.add('success');
        el.classList.remove('error');
    }
};

const hideFeedback = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('hidden');
};

const setInputFeedback = (inputEl, isValid) => {
    const errorSpan = inputEl.parentElement.querySelector('.inline-error') || 
                      inputEl.parentElement.parentElement.querySelector('.inline-error');
    if (isValid) {
        inputEl.classList.remove('invalid');
        if (errorSpan) errorSpan.classList.add('hidden');
    } else {
        inputEl.classList.add('invalid');
        if (errorSpan) errorSpan.classList.remove('hidden');
    }
};

// Data Management
const getUsers = () => {
    const usersInfo = localStorage.getItem('nexusUsers');
    return usersInfo ? JSON.parse(usersInfo) : [];
};

const saveUser = (user) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('nexusUsers', JSON.stringify(users));
};

const findUser = (email) => {
    const users = getUsers();
    return users.find(u => u.email === email.toLowerCase());
};

const createSession = (user) => {
    // We only store the necessary safe info in session
    const sessionData = {
        name: user.name,
        email: user.email,
        timestamp: new Date().getTime()
    };
    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
};

// Page Logic
const initLoginPage = () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideFeedback('generalError');
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const btn = document.getElementById('loginBtn');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Basic empty check
        let valid = true;
        if (!email) { setInputFeedback(emailInput, false); valid = false; } else { setInputFeedback(emailInput, true); }
        if (!password) { setInputFeedback(passwordInput, false); valid = false; } else { setInputFeedback(passwordInput, true); }
        
        if (!valid) return;

        // UI Loading state
        btn.classList.add('loading');
        btn.disabled = true;

        // Simulate network delay
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;

            const user = findUser(email);
            
            if (user && user.password === password) {
                // Success
                createSession(user);
                window.location.href = 'dashboard.html';
            } else {
                // Fail
                showFeedback('generalError', 'Incorrect email or password.', true);
                setInputFeedback(emailInput, false);
                setInputFeedback(passwordInput, false);
            }
        }, 800);
    });
};

const initRegisterPage = () => {
    const regForm = document.getElementById('registerForm');
    if (!regForm) return;

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideFeedback('generalError');
        hideFeedback('generalSuccess');
        
        const nameInput = document.getElementById('regName');
        const emailInput = document.getElementById('regEmail');
        const passwordInput = document.getElementById('regPassword');
        const confirmInput = document.getElementById('regConfirmPassword');
        const btn = document.getElementById('registerBtn');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        
        // Validation
        let valid = true;
        
        if (name.length < 2) { setInputFeedback(nameInput, false); valid = false; } else { setInputFeedback(nameInput, true); }
        
        // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { setInputFeedback(emailInput, false); valid = false; } else { setInputFeedback(emailInput, true); }
        
        if (password.length < 6) { setInputFeedback(passwordInput, false); valid = false; } else { setInputFeedback(passwordInput, true); }
        
        if (password !== confirm || confirm === '') { 
            setInputFeedback(confirmInput, false); 
            valid = false; 
        } else { 
            setInputFeedback(confirmInput, true); 
        }
        
        if (!valid) return;

        if (findUser(email)) {
            showFeedback('generalError', 'An account with this email already exists.', true);
            setInputFeedback(emailInput, false);
            return;
        }

        // Loading state
        btn.classList.add('loading');
        btn.disabled = true;

        // Simulate network delay
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
            
            // In a real app password should be hashed. Here we store it raw for demo.
            saveUser({ name, email: email.toLowerCase(), password });
            
            showFeedback('generalSuccess', 'Account created successfully! Redirecting...', false);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        }, 1200);
    });

    // Real-time password match validation
    const confirmInput = document.getElementById('regConfirmPassword');
    const passwordInput = document.getElementById('regPassword');
    
    if(confirmInput && passwordInput) {
        confirmInput.addEventListener('input', () => {
            if(confirmInput.value !== passwordInput.value) {
                setInputFeedback(confirmInput, false);
            } else {
                setInputFeedback(confirmInput, true);
            }
        });
    }
};

const initDashboard = () => {
    const welcomeMsg = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const userAvatar = document.getElementById('userAvatar');
    
    if (!welcomeMsg || !logoutBtn) return; // Not on dashboard
    
    const sessionStr = sessionStorage.getItem('currentUser');
    if (!sessionStr) {
        window.location.replace('index.html');
        return;
    }
    
    const currentUser = JSON.parse(sessionStr);
    
    // Personalize dashboard
    welcomeMsg.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
    
    // Set Avatar Initials
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    if(userAvatar) userAvatar.textContent = initials;
    
    // Logout Logic
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.replace('index.html');
    });
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    togglePasswordVisibility();
    initLoginPage();
    initRegisterPage();
    initDashboard();
});
