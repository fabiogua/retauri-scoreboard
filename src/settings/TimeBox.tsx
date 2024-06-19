import TimeConvertBox from "./TimeConvertBox";
import TimeInputBox from "./TimeInputBox";
import "../styles/TimeBox.css";

// Define the props type
interface TimeBoxProps {
  // The function prop takes no arguments and returns void
  setTime: (time: number) => void;
  time: number;
  title: string;
}

const TimeBox: React.FC<TimeBoxProps> = ({ time, title, setTime }) => {
  return (
      <tr>
        <td className="title">{title}</td>
        <td>
          <TimeConvertBox time={time} />
        </td>
        <td>
          <TimeInputBox time={time} setTime={setTime} />
        </td>
      </tr>
  );
};

export default TimeBox;
