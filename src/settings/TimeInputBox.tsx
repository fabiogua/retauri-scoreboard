import { useState } from "react";
import "../styles/TimeInputBox.css";

// Define the props type
interface TimeInputBoxProps {
  // The function prop takes no arguments and returns void

  setTime: (time: number) => void;
  time: number;
}

const TimeInputBox: React.FC<TimeInputBoxProps> = ({ time, setTime }) => {
  const [tmpTime, setTmpTime] = useState(time.toString());

  const handleChange = (event: any) => {
    let value: string = event.target.value;

    if (value.length > 4) {
      return;
    }

    setTmpTime(value);
  };

  return (
      <input
        className="time-input"
        type="text"
        value={tmpTime}
        placeholder={tmpTime.toString()}
        onChange={(e) => {
          handleChange(e);
        }}
        onKeyDown={(e) => {
          handleChange(e);
          if (e.key === "Enter") {
            setTime(Number(tmpTime));
            e.currentTarget.blur();
          }
          
        }}

        onBlur={() => {
          setTime(Number(tmpTime));
        }}
      />
  );
};

export default TimeInputBox;
