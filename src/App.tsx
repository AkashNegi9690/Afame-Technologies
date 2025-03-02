import React, { useReducer, useEffect } from 'react';
import { Calculator, Backpack as Backspace, X, Divide, Plus, Minus, Equal } from 'lucide-react';

// Calculator reducer types
type CalculatorState = {
  currentValue: string;
  previousValue: string;
  operation: string | null;
  overwrite: boolean;
};

type CalculatorAction =
  | { type: 'ADD_DIGIT'; payload: string }
  | { type: 'CHOOSE_OPERATION'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'DELETE' }
  | { type: 'EVALUATE' };

// Initial state
const initialState: CalculatorState = {
  currentValue: '0',
  previousValue: '',
  operation: null,
  overwrite: true,
};

// Calculator reducer function
function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'ADD_DIGIT':
      if (state.overwrite) {
        return {
          ...state,
          currentValue: action.payload,
          overwrite: false,
        };
      }
      
      if (action.payload === '.' && state.currentValue.includes('.')) {
        return state;
      }
      
      return {
        ...state,
        currentValue: state.currentValue === '0' && action.payload !== '.' 
          ? action.payload 
          : `${state.currentValue}${action.payload}`,
      };
      
    case 'CHOOSE_OPERATION':
      if (state.currentValue === '0' && state.previousValue === '') {
        return state;
      }
      
      if (state.previousValue === '') {
        return {
          ...state,
          operation: action.payload,
          previousValue: state.currentValue,
          currentValue: '0',
          overwrite: true,
        };
      }
      
      if (state.operation) {
        const result = calculate(state);
        return {
          ...state,
          previousValue: result,
          operation: action.payload,
          currentValue: '0',
          overwrite: true,
        };
      }
      
      return state;
      
    case 'CLEAR':
      return initialState;
      
    case 'DELETE':
      if (state.overwrite) {
        return {
          ...state,
          currentValue: '0',
          overwrite: true,
        };
      }
      
      if (state.currentValue.length === 1) {
        return {
          ...state,
          currentValue: '0',
          overwrite: true,
        };
      }
      
      return {
        ...state,
        currentValue: state.currentValue.slice(0, -1),
      };
      
    case 'EVALUATE':
      if (state.operation == null || state.previousValue === '' || state.currentValue === '0') {
        return state;
      }
      
      return {
        ...state,
        previousValue: '',
        operation: null,
        currentValue: calculate(state),
        overwrite: true,
      };
      
    default:
      return state;
  }
}

// Helper function to perform calculations
function calculate(state: CalculatorState): string {
  const prev = parseFloat(state.previousValue);
  const current = parseFloat(state.currentValue);
  
  if (isNaN(prev) || isNaN(current)) return '0';
  
  let result = 0;
  switch (state.operation) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '×':
      result = prev * current;
      break;
    case '÷':
      if (current === 0) return 'Error';
      result = prev / current;
      break;
    default:
      return '0';
  }
  
  return result.toString();
}

// Button component
type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-4 rounded-2xl text-xl font-medium transition-all duration-200 
      hover:scale-105 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
};

function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        dispatch({ type: 'ADD_DIGIT', payload: e.key });
      } else if (e.key === '.') {
        dispatch({ type: 'ADD_DIGIT', payload: '.' });
      } else if (e.key === '+') {
        dispatch({ type: 'CHOOSE_OPERATION', payload: '+' });
      } else if (e.key === '-') {
        dispatch({ type: 'CHOOSE_OPERATION', payload: '-' });
      } else if (e.key === '*') {
        dispatch({ type: 'CHOOSE_OPERATION', payload: '×' });
      } else if (e.key === '/') {
        dispatch({ type: 'CHOOSE_OPERATION', payload: '÷' });
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        dispatch({ type: 'EVALUATE' });
      } else if (e.key === 'Backspace') {
        dispatch({ type: 'DELETE' });
      } else if (e.key === 'Escape') {
        dispatch({ type: 'CLEAR' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4 font-sans">
      <div className="calculator-container w-full max-w-md backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl overflow-hidden border border-white/30">
        {/* Calculator header with logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Calculator</h1>
          </div>
        </div>
        
        {/* Calculator display */}
        <div className="p-6 bg-white/10">
          <div className="bg-white/30 rounded-xl p-4 text-right h-24 flex flex-col justify-end items-end">
            <div className="text-gray-700 text-sm h-6 overflow-hidden">
              {state.previousValue} {state.operation}
            </div>
            <div className="text-3xl font-bold text-gray-900 overflow-x-auto max-w-full">
              {state.currentValue}
            </div>
          </div>
        </div>
        
        {/* Calculator buttons */}
        <div className="grid grid-cols-4 gap-3 p-6">
          {/* First row */}
          <Button 
            onClick={() => dispatch({ type: 'CLEAR' })} 
            className="bg-red-500/80 text-white hover:bg-red-600/90 col-span-2"
          >
            C
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'DELETE' })} 
            className="bg-amber-500/80 text-white hover:bg-amber-600/90 col-span-2"
          >
            <Backspace className="h-5 w-5 mr-1" /> DEL
          </Button>
          
          {/* Second row */}
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '7' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            7
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '8' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            8
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '9' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            9
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '÷' })} 
            className="bg-indigo-500/80 text-white hover:bg-indigo-600/90"
          >
            <Divide className="h-5 w-5" />
          </Button>
          
          {/* Third row */}
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '4' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            4
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '5' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            5
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '6' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            6
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '×' })} 
            className="bg-indigo-500/80 text-white hover:bg-indigo-600/90"
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Fourth row */}
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '1' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            1
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '2' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            2
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '3' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            3
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '-' })} 
            className="bg-indigo-500/80 text-white hover:bg-indigo-600/90"
          >
            <Minus className="h-5 w-5" />
          </Button>
          
          {/* Fifth row */}
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '0' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            0
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '.' })} 
            className="bg-white/50 text-gray-800 hover:bg-white/70"
          >
            .
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'EVALUATE' })} 
            className="bg-green-500/80 text-white hover:bg-green-600/90"
          >
            <Equal className="h-5 w-5" />
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '+' })} 
            className="bg-indigo-500/80 text-white hover:bg-indigo-600/90"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;