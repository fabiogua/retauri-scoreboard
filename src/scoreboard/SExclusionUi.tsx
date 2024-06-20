import "../styles/Exclusion.css";

function SExclusionUi({ value }: { value: number }) {
  const dots = [];
  for (let i = 0; i < 3; i++) {
    if (value === 3) {
      dots.push(<div key={i} className="exclusion-dot max" />);
    }else if (i < value) {
      dots.push(<div key={i} className="exclusion-dot " />);
    } else {
      dots.push(<div key={i} className="exclusion-dot empty" />);
    }
  }
  return <div className="exclusion">{dots}</div>;
}

export default SExclusionUi;
