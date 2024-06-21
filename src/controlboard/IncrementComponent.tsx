import "../styles/IncrementComponent.css";

// Define the props type
interface IncrementComponentProps {
  // The function prop takes no arguments and returns void
  increment: () => void;
  decrement: () => void;
  value: number;
  digit?: number;
  max?: number;
}

const IncrementComponent: React.FC<IncrementComponentProps> = ({
  digit,
  max,
  value,
  increment,
  decrement,
}) => {
  return (
    <div className="increment-component">
      <button onAuxClick={blur} onClick={decrement}>-</button>
      <span className={`increment-value-${digit === 2 ? '2' : '1'} ${value === max ? 'max-value' : ''}`}>{value}</span>
      <button onAuxClick={blur} onClick={increment}>+</button>
    </div>
  );
};

export default IncrementComponent;
