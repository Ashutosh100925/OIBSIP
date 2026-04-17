document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const form = document.getElementById('converter-form');
    const tempInput = document.getElementById('temperature');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const swapBtn = document.getElementById('swap-btn');
    const resetBtn = document.getElementById('reset-btn');
    const errorMessage = document.getElementById('error-message');
    const resultArea = document.getElementById('result-area');
    const resultEquation = document.getElementById('result-equation');
    const resultValue = document.getElementById('result-value');
    const resultUnitText = document.getElementById('result-unit');
    const shape1 = document.querySelector('.shape-1');
    const shape2 = document.querySelector('.shape-2');
    
    // --- Constants ---
    const unitSymbols = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    };

    // --- Event Listeners ---

    // Form Submission (Trigger on convert button click)
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        convertTemperature();
    });

    // Keyboard Support: Trigger conversion on 'Enter' key inside input
    tempInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            convertTemperature();
        }
    });

    // Swap Feature: Switches "From" and "To" selected units
    swapBtn.addEventListener('click', () => {
        // Add a smooth micro-animation on click
        swapBtn.style.transform = 'scale(0.85) rotate(180deg)';
        setTimeout(() => {
            // Remove inline style to return to CSS defaults/hover states
            swapBtn.style.transform = '';
        }, 300);

        // Swap unit values
        const tempFrom = fromUnit.value;
        const tempTo = toUnit.value;
        
        fromUnit.value = tempTo;
        toUnit.value = tempFrom;
        
        // Auto-convert if there's already valid input
        if (tempInput.value.trim() !== '') {
            convertTemperature();
        }
    });

    // Reset Feature: Clears input and results cleanly
    resetBtn.addEventListener('click', () => {
        tempInput.value = '';
        hideError();
        hideResult();
        resetThemeColors();
        tempInput.focus(); // Emphasize readiness to user
    });

    // Validation Feedback: Remove error message immediately on user typing
    tempInput.addEventListener('input', () => {
        hideError();
        // Hide result space gracefully if input becomes empty manually
        if (tempInput.value.trim() === '') {
            hideResult();
            resetThemeColors();
        }
    });

    // Change listeners for dropdowns to trigger real-time updates seamlessly
    fromUnit.addEventListener('change', () => {
        if(tempInput.value.trim() !== '') convertTemperature();
    });
    
    toUnit.addEventListener('change', () => {
        if(tempInput.value.trim() !== '') convertTemperature();
    });

    // --- Core Logic Functions ---

    function convertTemperature() {
        const inputValue = tempInput.value.trim();
        
        // 1. Validation for empty
        if (inputValue === '') {
            showError('Please enter a temperature.');
            hideResult();
            return;
        }

        const temperature = parseFloat(inputValue);

        // 2. Validation for non-numeric (if users bypass step limits)
        if (isNaN(temperature)) {
            showError('Please enter a valid number.');
            hideResult();
            return;
        }

        hideError();

        const from = fromUnit.value;
        const to = toUnit.value;
        let result = 0;

        // Same-unit fallback
        if (from === to) {
            result = temperature;
        } 
        // Celsius Logic
        else if (from === 'celsius' && to === 'fahrenheit') {
            result = (temperature * 9/5) + 32;
        } else if (from === 'celsius' && to === 'kelvin') {
            result = temperature + 273.15;
        }
        // Fahrenheit Logic
        else if (from === 'fahrenheit' && to === 'celsius') {
            result = (temperature - 32) * 5/9;
        } else if (from === 'fahrenheit' && to === 'kelvin') {
            result = (temperature - 32) * 5/9 + 273.15;
        }
        // Kelvin Logic
        else if (from === 'kelvin' && to === 'celsius') {
            result = temperature - 273.15;
        } else if (from === 'kelvin' && to === 'fahrenheit') {
            result = (temperature - 273.15) * 9/5 + 32;
        }

        displayResult(temperature, from, result, to);
    }

    function displayResult(inputVal, from, resultVal, to) {
        // Formatting: If it's pure integer, show integer. Else limit to 2 decimals cleanly.
        const formattedResult = Number.isInteger(resultVal) ? resultVal : parseFloat(resultVal.toFixed(2));
        const formattedInput = Number.isInteger(inputVal) ? inputVal : parseFloat(inputVal.toFixed(2));
        
        const fromSymbol = unitSymbols[from];
        const toSymbol = unitSymbols[to];

        resultEquation.textContent = `${formattedInput}${fromSymbol} =`;
        
        // Count up animation logic for the result value for premium feel
        animateValue(resultValue, parseFloat(resultValue.textContent) || 0, formattedResult, 600);
        
        resultUnitText.textContent = toSymbol;

        // Dynamic Visual Change based on target temp (Hot vs Cold Theme)
        updateThemeColors(resultVal, to);

        // Reveal effect
        resultArea.classList.add('show');
    }

    // --- UI/UX Enhancements ---

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Apply easeOutQuart easing for very smooth number tick
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const current = start + easeOut * (end - start);
            
            obj.textContent = Number.isInteger(end) ? Math.round(current) : current.toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end; // Ensure absolute accuracy at completion
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateThemeColors(result, toUnit) {
        let celsiusValue = result;
        
        // Normalize everything to Celsius to gauge temperature ranges easily
        if (toUnit === 'fahrenheit') {
            celsiusValue = (result - 32) * 5/9;
        } else if (toUnit === 'kelvin') {
            celsiusValue = result - 273.15;
        }

        const root = document.documentElement;
        
        // Base Palette (Cyan/Purple)
        let primary = '#0ea5e9';
        let secondary = '#8b5cf6';

        if (celsiusValue > 30) {
            // Hot visual mapping (Orange/Red)
            primary = '#f97316'; // Vivid orange
            secondary = '#ef4444'; // Bold red
        } else if (celsiusValue < 10) {
            // Cold visual mapping (Light blue/Indigo)
            primary = '#38bdf8'; // Frosty sky
            secondary = '#6366f1'; // Deep ice indigo
        }

        // Apply dynamically across entire CSS scope
        root.style.setProperty('--accent-primary', primary);
        root.style.setProperty('--accent-secondary', secondary);
        
        // Update shape specific styles directly occasionally for layered visuals
        resultUnitText.style.color = primary;
    }

    function resetThemeColors() {
        // Revert to cool default state
        const root = document.documentElement;
        root.style.setProperty('--accent-primary', '#0ea5e9');
        root.style.setProperty('--accent-secondary', '#8b5cf6');
        resultUnitText.style.color = 'var(--accent-primary)';
    }

    // --- Error Handling & Helpers ---

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('active');
        tempInput.style.borderColor = 'var(--error-color)';
        // Shake animation for error
        form.style.animation = 'shake 0.4s ease';
        setTimeout(() => { form.style.animation = ''; }, 400);
    }

    function hideError() {
        errorMessage.classList.remove('active');
        tempInput.style.borderColor = '';
    }

    function hideResult() {
        resultArea.classList.remove('show');
    }

    // Inject shake animation styles dynamically
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }
    `;
    document.head.appendChild(styleSheet);

    // Give focus on cold load to minimize user resistance
    tempInput.focus();
});
