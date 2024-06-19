import "../styles/TimeConvertBox.css";

// Define the props type
interface TimeConvertBoxProps {
  // The function prop takes no arguments and returns void
  time: number;
}

const TimeInputBox: React.FC<TimeConvertBoxProps> = ({ time }) => {
  function timeToString(time: number): string {
    let minutes = Math.floor(time / 100);
    let seconds = time % 100;
    return `${minutes} min ${seconds} sec`;
  }

  return (
    <input
      className="time-convert"
      type="text"
      placeholder={timeToString(time)}
      value=""
      tabIndex={-1} // Add tabIndex=-1 to make it unfocusable
      onFocus={(e) => e.target.blur()}
    />
  );
};

export default TimeInputBox;
