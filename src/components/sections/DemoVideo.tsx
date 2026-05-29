export default function DemoVideo() {
  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="demo-video-section"
    >
      <h2 id="demo-heading" className="demo-video-section__title">
        <span>Offline</span>{" "}
        <em className="demo-video-section__title-accent">Demo</em>
      </h2>

      <div className="demo-video-section__frame">
        <video
          className="demo-video-section__video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/video/web_section.webm" type="video/webm" />
        </video>
      </div>
    </section>
  );
}
