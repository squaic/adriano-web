export default function Home() {
  return (
    <main className="home">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Adriano Web</p>
        <h1 id="page-title">Prêt pour la prochaine partie&nbsp;?</h1>
        <p className="description">
          Le terrain est en place. La nouvelle expérience de jeu arrive bientôt.
        </p>
        <span className="status">
          <span className="statusDot" aria-hidden="true" />
          Projet initialisé
        </span>
      </section>
    </main>
  );
}

