import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3 text-gray-700 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function MarketplaceTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        {/* Back */}
        <Link
          to="/marktplatz"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Marktplatz
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nutzungsbedingungen tigube-Marktplatz
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gültig ab dem 22. März 2026 · tigube.de
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

          <p className="mb-8 text-sm text-gray-600 leading-relaxed">
            Die tierisch gut betreut GmbH betreibt unter der Bezeichnung „tigube-Marktplatz" einen
            Online-Marktplatz für Haustier-Zubehör, Tierpflege-Produkte und verwandte Artikel
            (nachfolgend „Marktplatz"). Diese Nutzungsbedingungen regeln die Nutzung des Marktplatzes
            durch Nutzer, die Anzeigen aufgeben oder Angebote einsehen. Mit dem Einstellen einer Anzeige
            bestätigst du, diese Bedingungen gelesen zu haben und ihnen zuzustimmen.
          </p>

          <Section title="§ 1 Leistungsbeschreibung">
            <p>
              tigube stellt mit dem Marktplatz einen Online-Service zur Verfügung, über den Nutzer als
              Inserenten Angebote und Gesuche für tierbezogene Waren und Dienstleistungen erstellen und
              veröffentlichen sowie als Interessenten veröffentlichte Anzeigen anderer Nutzer einsehen
              können.
            </p>
            <p>
              tigube ist selbst kein Anbieter der mit den Anzeigen beworbenen Produkte oder
              Dienstleistungen und vermittelt lediglich den Kontakt zwischen Inserenten und
              Interessenten.
            </p>
            <p>
              tigube behält sich vor, die Verfügbarkeit des Marktplatzes zeitweilig zu beschränken,
              wenn dies aus technischen oder betrieblichen Gründen erforderlich ist (z. B. Wartungsarbeiten).
            </p>
          </Section>

          <Section title="§ 2 Registrierung und Nutzerkonto">
            <p>
              Für das Einstellen von Anzeigen ist eine Registrierung und Anmeldung bei tigube
              erforderlich. Mit der Registrierung bestätigst du, volljährig oder mit Zustimmung
              eines gesetzlichen Vertreters zu handeln.
            </p>
            <p>
              Du bist verpflichtet, deine Anmeldedaten geheim zu halten und tigube unverzüglich zu
              informieren, wenn du einen unautorisierten Zugriff auf dein Konto vermutest.
            </p>
            <p>
              Jeder Nutzer darf nur ein Konto auf der Plattform unterhalten. Die Weitergabe von
              Zugangsdaten an Dritte ist untersagt.
            </p>
          </Section>

          <Section title="§ 3 Anzeigen aufgeben">
            <p>
              Du bist verpflichtet, jede Anzeige in die passende Kategorie einzustellen und dein
              Angebot wahrheitsgemäß, vollständig und mit allen relevanten Merkmalen zu beschreiben.
              Irreführende oder unvollständige Angaben sind untersagt.
            </p>
            <p>
              Du kannst pro Anzeige bis zu 6 Fotos hochladen. Die Fotos müssen das tatsächliche
              Produkt zeigen und dürfen keine Urheberrechte Dritter verletzen.
            </p>
            <p>
              Mit dem Veröffentlichen einer Anzeige gibst du tigube das Recht, die Anzeige im Rahmen
              des Marktplatzes darzustellen und zur Verbesserung der Reichweite zu verwenden.
            </p>
            <p>
              Anzeigen dürfen nicht dupliziert werden. Das wiederholte Einstellen derselben Anzeige
              ist untersagt.
            </p>
          </Section>

          <Section title="§ 4 Verbotene Inhalte">
            <p className="font-medium text-red-700">
              Folgende Inhalte sind auf dem tigube-Marktplatz ausdrücklich verboten:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Lebende Tiere jeglicher Art</strong> – der Kauf, Verkauf oder die Vermittlung
                von Lebendtieren ist auf dem Marktplatz nicht gestattet.
              </li>
              <li>
                Illegale oder verbotene Waren und Dienstleistungen (z. B. nicht zugelassene
                Tierarzneimittel, geschützte Tierarten oder deren Teile).
              </li>
              <li>
                Gefälschte oder nachgeahmte Produkte sowie Waren, die Schutzrechte Dritter verletzen.
              </li>
              <li>
                Inhalte, die diskriminierend, beleidigend, obszön oder anderweitig rechtswidrig sind.
              </li>
              <li>
                Werbeanzeigen ohne tatsächliches Angebot (Fake-Anzeigen) sowie Spam.
              </li>
              <li>
                Anzeigen für Dienstleistungen, die in die Vermittlungsfunktion der Hauptplattform
                fallen (z. B. Tierbetreuung, Gassi gehen) – hierfür steht der Hauptmarktplatz von
                tigube zur Verfügung.
              </li>
            </ul>
            <p>
              Das Einstellen verbotener Inhalte kann zur sofortigen Entfernung der Anzeige,
              Verwarnung oder Sperrung des Kontos führen.
            </p>
          </Section>

          <Section title="§ 5 Besondere Pflichten des Nutzers">
            <p>Der Nutzer ist verpflichtet, alle Handlungen zu unterlassen, die den sicheren Betrieb
              des Marktplatzes gefährden oder andere Nutzer belästigen könnten. Insbesondere ist es
              verboten:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Automatisierte Zugriffe (Scraper, Bots) ohne ausdrückliche Genehmigung von tigube.</li>
              <li>Das Sammeln von Kontaktdaten anderer Nutzer ohne deren Zustimmung.</li>
              <li>Maßnahmen zu umgehen, die den Zugriff auf den Marktplatz beschränken.</li>
              <li>Viren oder schadhaften Code zu übertragen.</li>
              <li>Andere Nutzer zu täuschen oder zu belästigen.</li>
            </ul>
          </Section>

          <Section title="§ 6 Moderation und Entfernung von Inhalten">
            <p>
              tigube ist berechtigt, Anzeigen oder sonstige Inhalte ganz oder teilweise zu entfernen
              oder zu deaktivieren, wenn konkrete Anhaltspunkte dafür vorliegen, dass die Anzeige
              gegen diese Nutzungsbedingungen, gesetzliche Vorschriften oder Rechte Dritter verstößt.
            </p>
            <p>
              Im Falle einer Deaktivierung oder Löschung wird der Nutzer über den Grund informiert
              und hat die Möglichkeit, eine Überprüfung der Entscheidung zu beantragen. Hierzu
              kannst du tigube unter{' '}
              <a href="mailto:info@tigube.de" className="text-primary-600 hover:underline">
                info@tigube.de
              </a>{' '}
              kontaktieren.
            </p>
            <p>
              Bei wiederholten Verstößen behält sich tigube vor, das Nutzerkonto dauerhaft zu sperren.
            </p>
          </Section>

          <Section title="§ 7 Haftung des Nutzers">
            <p>
              Du bist allein verantwortlich für die von dir eingestellten Anzeigen und deren Inhalte.
              Du stellst tigube von sämtlichen Ansprüchen Dritter frei, die aufgrund deiner Anzeigen
              oder deiner Nutzung des Marktplatzes entstehen.
            </p>
            <p>
              tigube übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Rechtmäßigkeit
              der von Nutzern eingestellten Anzeigen und ist kein Vertragspartner bei Transaktionen
              zwischen Inserenten und Interessenten.
            </p>
          </Section>

          <Section title="§ 8 Haftung von tigube">
            <p>
              tigube haftet nach den gesetzlichen Vorschriften für Vorsatz und grobe Fahrlässigkeit.
              Für leichte Fahrlässigkeit haftet tigube nur bei Verletzung wesentlicher Vertragspflichten
              und begrenzt auf den vorhersehbaren Schaden. Eine weitergehende Haftung ist ausgeschlossen.
            </p>
            <p>
              tigube übernimmt keine Haftung für Schäden, die aus Transaktionen zwischen Nutzern
              entstehen.
            </p>
          </Section>

          <Section title="§ 9 Datenschutz">
            <p>
              Die Erhebung und Verarbeitung deiner personenbezogenen Daten im Zusammenhang mit dem
              Marktplatz erfolgt gemäß der{' '}
              <Link to="/datenschutz" className="text-primary-600 hover:underline">
                Datenschutzerklärung von tigube
              </Link>
              . Mit der Nutzung des Marktplatzes stimmst du der dort beschriebenen Datenverarbeitung zu.
            </p>
          </Section>

          <Section title="§ 10 Änderungen der Nutzungsbedingungen">
            <p>
              tigube behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Wesentliche
              Änderungen werden dir mindestens 30 Tage vor ihrem Inkrafttreten per E-Mail mitgeteilt.
              Wenn du der Änderung nicht widersprichst, gilt sie als akzeptiert.
            </p>
          </Section>

          <Section title="§ 11 Schlussbestimmungen">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für Streitigkeiten mit
              gewerblichen Nutzern ist der Sitz von tigube.
            </p>
            <p>
              Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein, bleibt die
              Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
            <p>
              Bei Fragen zu diesen Nutzungsbedingungen wende dich an:{' '}
              <a href="mailto:info@tigube.de" className="text-primary-600 hover:underline">
                info@tigube.de
              </a>
            </p>
          </Section>

          <div className="mt-8 rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500">
            Stand: 22. März 2026 · tierisch gut betreut GmbH · Weitere Informationen unter{' '}
            <Link to="/impressum" className="text-primary-600 hover:underline">
              Impressum
            </Link>{' '}
            und{' '}
            <Link to="/agb" className="text-primary-600 hover:underline">
              Allgemeine Geschäftsbedingungen
            </Link>
            .
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/marktplatz/neu"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Anzeige erstellen
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MarketplaceTermsPage;
