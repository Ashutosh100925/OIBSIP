class Calculator {
    constructor(displayElement, historyElement) {
        this.displayElement = displayElement;
        this.historyElement = historyElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
        this.flashDisplay();
    }

    delete() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') {
            this.clear();
            return;
        }
        
        if (this.shouldResetScreen) {
            this.currentOperand = '0';
            this.shouldResetScreen = false;
            return;
        }

        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') {
            this.clear();
        }

        if (this.shouldResetScreen) {
            if (number === '.') {
                this.currentOperand = '0.';
            } else {
                this.currentOperand = number.toString();
            }
            this.shouldResetScreen = false;
            this.updateDisplay();
            return;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') return;

        if (this.currentOperand === '') return;
        
        // If an operation is already queued, compute it before starting a new one
        if (this.previousOperand !== '' && !this.shouldResetScreen) {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    compute() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') return;

        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.currentOperand = 'Cannot divide by zero';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.updateDisplay();
                    this.flashDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Handle floating point precision issues properly
        computation = Math.round(computation * 1000000000) / 1000000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
        this.flashDisplay();
    }
    
    toggleSign() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') return;
        
        if (this.currentOperand !== '0' && this.currentOperand !== '') {
            if (this.currentOperand.startsWith('-')) {
                this.currentOperand = this.currentOperand.slice(1);
            } else {
                this.currentOperand = '-' + this.currentOperand;
            }
            this.updateDisplay();
        }
    }

    percent() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') return;
        
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }

    getDisplayNumber(number) {
        if (number === 'Cannot divide by zero' || number === 'Error') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else if (stringNumber.includes('.')) {
            return `${integerDisplay}`; // Modified to allow trailing decimal without jumping visually too much
        } else {
            return integerDisplay;
        }
    }

    getOperationSymbol(operation) {
        switch (operation) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    updateDisplay() {
        // Adjust font size based on length
        if (this.currentOperand.length > 12 || this.currentOperand === 'Cannot divide by zero') {
            this.displayElement.classList.add('error');
            if (this.currentOperand !== 'Cannot divide by zero') {
                this.displayElement.classList.remove('error');
                this.displayElement.style.fontSize = '24px';
            }
        } else {
            this.displayElement.classList.remove('error');
            this.displayElement.style.fontSize = ''; // revert to CSS default
        }

        // Add decimal if it exists and hasn't been parsed out
        let displayStr = this.getDisplayNumber(this.currentOperand);
        if(this.currentOperand.endsWith('.')) {
            displayStr += '.';
        }
        
        this.displayElement.innerText = displayStr;
        
        if (this.operation != null) {
            this.historyElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.historyElement.innerText = '';
        }

        this.updateActiveOperator();
    }
    
    updateActiveOperator() {
        const operators = document.querySelectorAll('.btn-operator');
        operators.forEach(btn => btn.classList.remove('active'));
        
        if (this.operation) {
            const activeBtn = document.querySelector(`.btn-operator[data-action="${this.operation}"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }

    flashDisplay() {
        this.displayElement.classList.add('flash');
        setTimeout(() => {
            this.displayElement.classList.remove('flash');
        }, 100);
    }
}

// Select Elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('.btn-operator');
const equalsButton = document.querySelector('[data-action="calculate"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const toggleSignButton = document.querySelector('[data-action="toggle-sign"]');
const percentButton = document.querySelector('[data-action="percent"]');
const displayElement = document.getElementById('display');
const historyElement = document.getElementById('history');

// Initialize Calculator
const calculator = new Calculator(displayElement, historyElement);

// Event Listeners for UI
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.action);
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
});

clearButton.addEventListener('click', button => {
    calculator.clear();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
});

toggleSignButton.addEventListener('click', () => {
    calculator.toggleSign();
});

percentButton.addEventListener('click', () => {
    calculator.percent();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
    }
    if (e.key === '.') {
        calculator.appendNumber(e.key);
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
    }
    if (e.key === 'Escape') {
        calculator.clear();
    }
    if (e.key === '+') {
        calculator.chooseOperation('add');
    }
    if (e.key === '-') {
        calculator.chooseOperation('subtract');
    }
    if (e.key === '*' || e.key === 'x') {
        calculator.chooseOperation('multiply');
    }
    if (e.key === '/') {
        e.preventDefault();
        calculator.chooseOperation('divide');
    }
    if (e.key === '%') {
        calculator.percent();
    }
});
