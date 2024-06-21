import "../styles/MatchInfo.css";

function ImageComponent({ src }: { src: string }) {
  return <div className="match-info">
    <img src={src} />
  </div>;
}

export default ImageComponent;
