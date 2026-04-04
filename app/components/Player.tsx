export default function Player(source: string) {
  return (
    <audio controls>
      <source src={source} type="audio/mpeg" />
       Your browser does not support the audio element.
    </audio>
  );
}
