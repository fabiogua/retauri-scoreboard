import { TeamEnum } from "../Data";

function SMatchInfoTeam({
  side,
  name,
  score,
  src,
}: {
  side: TeamEnum;
  name: string;
  score: number;
  src: string;
}) {
  console.log(src);

  return (
    <div className={`${side === TeamEnum.home ? "home" : "guest"}-team`}>
      {/* <ImageComponent src={src} /> */}
      <h2 className="team-name"> {name}</h2>
      <h1 className="team-score">{score}</h1>
    </div>
  );
}

export default SMatchInfoTeam;
