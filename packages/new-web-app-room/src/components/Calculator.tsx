'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

const Calculator = () => {
  const { theme } = useTheme();
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const inputNumber = useCallback((num: string) => {
    setState(prevState => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: num,
          waitingForOperand: false,
        };
      }
      
      return {
        ...prevState,
        display: prevState.display === '0' ? num : prevState.display + num,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState(prevState => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: '0.',
          waitingForOperand: false,
        };
      }
      
      if (prevState.display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: prevState.display + '.',
        };
      }
      
      return prevState;
    });
  }, []);

  const clear = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    });
  }, []);

  const performOperation = useCallback((nextOperation: string) => {
    setState(prevState => {
      const inputValue = parseFloat(prevState.display);

      if (prevState.previousValue === null) {
        return {
          ...prevState,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForOperand: true,
        };
      }

      if (prevState.operation) {
        const currentValue = prevState.previousValue || 0;
        let result: number;

        switch (prevState.operation) {
          case '+':
            result = currentValue + inputValue;
            break;
          case '-':
            result = currentValue - inputValue;
            break;
          case '×':
            result = currentValue * inputValue;
            break;
          case '÷':
            result = inputValue !== 0 ? currentValue / inputValue : 0;
            break;
          default:
            return prevState;
        }

        return {
          display: String(result),
          previousValue: result,
          operation: nextOperation,
          waitingForOperand: true,
        };
      }

      return prevState;
    });
  }, []);

  const calculate = useCallback(() => {
    performOperation('');
    setState(prevState => ({
      ...prevState,
      previousValue: null,
      operation: null,
      waitingForOperand: true,
    }));
  }, [performOperation]);

  const toggleSign = useCallback(() => {
    setState(prevState => {
      const value = parseFloat(prevState.display);
      return {
        ...prevState,
        display: String(value * -1),
      };
    });
  }, []);

  const percentage = useCallback(() => {
    setState(prevState => {
      const value = parseFloat(prevState.display);
      return {
        ...prevState,
        display: String(value / 100),
      };
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        performOperation('+');
      } else if (key === '-') {
        performOperation('-');
      } else if (key === '*') {
        performOperation('×');
      } else if (key === '/') {
        event.preventDefault();
        performOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        calculate();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      } else if (key === '%') {
        percentage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputDecimal, performOperation, calculate, clear, percentage]);

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    
    // Handle very large or very small numbers
    if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(3);
    }
    
    // Handle long decimal numbers
    if (value.includes('.') && value.length > 9) {
      return num.toPrecision(9).replace(/\.?0+$/, '');
    }
    
    // Add commas for large integers
    if (Math.abs(num) >= 1000 && !value.includes('.')) {
      return num.toLocaleString();
    }
    
    return value;
  };

  const Button = ({ 
    onClick, 
    className = '', 
    children, 
    variant = 'number' 
  }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    variant?: 'number' | 'operator' | 'function';
  }) => {
    const baseClasses = "h-16 w-16 rounded-full font-medium text-xl calculator-button select-none";
    
    const variantClasses = {
      number: theme === 'light' 
        ? "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-100" 
        : "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800",
      operator: "bg-orange-500 text-white hover:bg-orange-400 active:bg-orange-600",
      function: theme === 'light'
        ? "bg-gray-300 text-gray-900 hover:bg-gray-400 active:bg-gray-200"
        : "bg-gray-400 text-black hover:bg-gray-300 active:bg-gray-500"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className={`p-6 rounded-3xl shadow-2xl max-w-sm mx-auto backdrop-blur-sm calculator-container transition-all duration-500 ${
      theme === 'light' 
        ? 'bg-white/90 border border-gray-200' 
        : 'bg-black border border-gray-800'
    }`}>
      {/* Display */}
      <div className={`rounded-2xl p-6 mb-4 transition-all duration-500 ${
        theme === 'light'
          ? 'bg-gray-50 border border-gray-200'
          : 'bg-black border border-gray-900'
      }`}>
        <div className={`text-right text-5xl font-light min-h-[60px] flex items-end justify-end overflow-hidden leading-none transition-all duration-200 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          {formatDisplay(state.display)}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <Button onClick={clear} variant="function">
          AC
        </Button>
        <Button onClick={toggleSign} variant="function">
          ±
        </Button>
        <Button onClick={percentage} variant="function">
          %
        </Button>
        <Button onClick={() => performOperation('÷')} variant="operator">
          ÷
        </Button>

        {/* Row 2 */}
        <Button onClick={() => inputNumber('7')}>
          7
        </Button>
        <Button onClick={() => inputNumber('8')}>
          8
        </Button>
        <Button onClick={() => inputNumber('9')}>
          9
        </Button>
        <Button onClick={() => performOperation('×')} variant="operator">
          ×
        </Button>

        {/* Row 3 */}
        <Button onClick={() => inputNumber('4')}>
          4
        </Button>
        <Button onClick={() => inputNumber('5')}>
          5
        </Button>
        <Button onClick={() => inputNumber('6')}>
          6
        </Button>
        <Button onClick={() => performOperation('-')} variant="operator">
          −
        </Button>

        {/* Row 4 */}
        <Button onClick={() => inputNumber('1')}>
          1
        </Button>
        <Button onClick={() => inputNumber('2')}>
          2
        </Button>
        <Button onClick={() => inputNumber('3')}>
          3
        </Button>
        <Button onClick={() => performOperation('+')} variant="operator">
          +
        </Button>

        {/* Row 5 */}
        <Button 
          onClick={() => inputNumber('0')} 
          className="col-span-2 w-auto rounded-full"
        >
          0
        </Button>
        <Button onClick={inputDecimal}>
          .
        </Button>
        <Button onClick={calculate} variant="operator">
          =
        </Button>
      </div>
    </div>
  );
};

export default Calculator;













