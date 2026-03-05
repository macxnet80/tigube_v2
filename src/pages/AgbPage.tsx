import React from 'react';

function AgbPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutzungsbedingungen</h1>
          <p className="text-gray-600 mb-2">der Plattform tigube (www.tigube.de)</p>
          <p className="text-sm text-gray-500 mb-8">Stand: 05.03.2026</p>

          <div className="space-y-10 text-gray-700">

            {/* § 1 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                1. Geltungsbereich und Vertragsgegenstand
              </h3>
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>1.1.</strong> Die nachfolgenden Nutzungsbedingungen regeln die Nutzung der Online-Plattform
                  „tigube" (www.tigube.de) (im Folgenden „Plattform" genannt), die von der{' '}
                  <strong>tierisch gut betreut UG (haftungsbeschränkt)</strong>, Iznangerstr. 32, 78345 Moos
                  (im Folgenden „tigube" oder „wir" genannt) betrieben wird.
                </p>
                <p>
                  <strong>1.2.</strong> Gegenstand dieser Nutzungsbedingungen ist die Bereitstellung der Plattform als
                  Vermittlungsdienstleistung. tigube ermöglicht es Tierbesitzern (im Folgenden „Suchende" genannt),
                  qualifizierte Tierbetreuer (im Folgenden „Anbieter" genannt) für verschiedene
                  Tierbetreuungsleistungen zu finden und zu kontaktieren.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p>
                    <strong>1.3. Wichtiger Hinweis:</strong> tigube tritt ausschließlich als Vermittler auf. Der
                    Vertrag über die Erbringung der Tierbetreuungsleistungen kommt{' '}
                    <strong>
                      direkt und ausschließlich zwischen dem Suchenden und dem Anbieter außerhalb der Plattform
                    </strong>{' '}
                    zustande. tigube ist weder Vertragspartner der Tierbetreuungsleistung noch erbringt tigube selbst
                    Tierbetreuungsleistungen.
                  </p>
                </div>
                <p>
                  <strong>1.4.</strong> Durch die Registrierung auf der Plattform und die Nutzung unserer Dienste
                  erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Abweichende Bedingungen des Nutzers
                  werden nicht anerkannt, es sei denn, tigube stimmt ihrer Geltung ausdrücklich schriftlich zu.
                </p>
              </div>
            </section>

            {/* § 2 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Registrierung und Nutzerkonten</h3>
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>2.1.</strong> Die Nutzung der Plattform erfordert eine Registrierung. Nur volljährige
                  natürliche Personen und Gewerbetreibende sind zur Registrierung berechtigt.
                </p>
                <p>
                  <strong>2.2.</strong> Es gibt zwei Arten von Nutzerkonten:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>Suchende (Tierbesitzer):</strong> Für Personen, die Tierbetreuungsleistungen suchen.
                  </li>
                  <li>
                    <strong>Anbieter (Tierbetreuer):</strong> Für Personen, die Tierbetreuungsleistungen anbieten.
                  </li>
                </ul>
                <p>
                  <strong>2.3.</strong> Bei der Registrierung sind alle abgefragten Daten wahrheitsgemäß und
                  vollständig anzugeben. Dies gilt insbesondere für persönliche Daten, Kontaktdaten und, im Falle von
                  Anbietern, für Informationen zur Qualifikation und Erfahrung sowie zur Verfügbarkeit und Preisen.
                </p>
                <p>
                  <strong>2.4.</strong> Die Registrierung erfolgt durch die Angabe Ihrer E-Mail-Adresse und die
                  Vergabe eines Passworts. Ihre E-Mail-Adresse wird zur Verifizierung Ihres Kontos verwendet.
                </p>
                <p>
                  <strong>2.5.</strong> tigube behält sich das Recht vor, die Registrierung eines Nutzers ohne Angabe
                  von Gründen abzulehnen.
                </p>
                <p>
                  <strong>2.6.</strong> Sie sind für die Vertraulichkeit Ihres Passworts und Ihres Kontos
                  verantwortlich. Sie sind verpflichtet, Ihr Passwort geheim zu halten und nicht an Dritte
                  weiterzugeben. Sie sind für alle Aktivitäten verantwortlich, die über Ihr Konto erfolgen, es sei
                  denn, Sie können nachweisen, dass eine unbefugte Nutzung nicht auf Ihr Verschulden zurückzuführen
                  ist. tigube hat keinen Einblick in Ihre Passwörter.
                </p>
                <p>
                  <strong>2.7.</strong> Bei falschen, unvollständigen oder irreführenden Angaben behält sich tigube
                  das Recht vor, das Nutzerkonto vorübergehend zu sperren oder dauerhaft zu löschen.
                </p>
                <div>
                  <p className="mb-2">
                    <strong>2.8.</strong> Regeln für die Profilgestaltung (insbesondere für Anbieter):
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Profilbilder, Benutzernamen und alle Profildarstellungen müssen den guten Sitten entsprechen und
                      dürfen keine beleidigenden, diskriminierenden oder illegalen Inhalte enthalten.
                    </li>
                    <li>
                      Die Angaben im Profil müssen wahrheitsgemäß sein und dürfen keine irreführenden Informationen
                      enthalten.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* § 3 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                3. Pflichten und Verantwortlichkeiten der Nutzer
              </h3>
              <div className="space-y-6">

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-3">
                    3.1. Pflichten der Suchenden (Tierbesitzer)
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Wahrheitsgemäße Tierinformationen:</strong> Sie sind verpflichtet, alle Informationen
                        über Ihr/Ihre Tier(e), insbesondere zu Gesundheit (Krankheiten, Medikamente, Allergien),
                        Verhalten (Ängste, Aggressionen, Eigenheiten), Impfstatus und Futtergewohnheiten,
                        wahrheitsgemäß und vollständig anzugeben.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Sicherheit und Vorbereitung:</strong> Sie sind für die Bereitstellung eines
                        Notfallplans, des Impfpasses (falls relevant), ausreichender Mengen an Futter und Medikamenten
                        sowie notwendiger Ausrüstung für Ihr Tier verantwortlich.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Kommunikation:</strong> Sie verpflichten sich zu einer klaren und zeitnahen
                        Kommunikation mit dem Anbieter, um alle Details der Betreuung abzustimmen.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Abonnementgebühren:</strong> Sie sind zur pünktlichen Zahlung der vereinbarten
                        Abonnementgebühren an tigube verpflichtet.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Bewertungen:</strong> Sie verpflichten sich, Bewertungen und Rezensionen über Anbieter
                        fair, wahrheitsgemäß und sachlich zu verfassen. Diffamierende oder unwahre Aussagen sind
                        untersagt.
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-3">
                    3.2. Pflichten der Anbieter (Tierbetreuer)
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Wahrheitsgemäße Profilangaben:</strong> Sie sind verpflichtet, alle Angaben in Ihrem
                        Profil (insbesondere zu Erfahrungen, Qualifikationen, Verfügbarkeiten, Preisen und angebotenen
                        Leistungen) wahrheitsgemäß und vollständig zu machen.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Sorgfältige Betreuung:</strong> Sie verpflichten sich zur sorgfältigen Durchführung
                        der Betreuungsleistungen gemäß den individuellen Absprachen mit dem Suchenden und unter
                        Einhaltung aller relevanten Tierschutzgesetze und -vorschriften.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Notfallmanagement:</strong> Sie sind verpflichtet, im Notfall angemessen zu reagieren
                        und den Suchenden unverzüglich zu informieren.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Kommunikation:</strong> Sie verpflichten sich zu einer klaren und zeitnahen
                        Kommunikation mit dem Suchenden.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Abonnementgebühren:</strong> Sie sind zur pünktlichen Zahlung der vereinbarten
                        Abonnementgebühren an tigube verpflichtet.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Bewertungen:</strong> Sie verpflichten sich, Bewertungen und Rezensionen über Suchende
                        fair, wahrheitsgemäß und sachlich zu verfassen. Diffamierende oder unwahre Aussagen sind
                        untersagt.
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold mt-0.5 shrink-0">•</span>
                      <span>
                        <strong>Versicherung:</strong> tigube empfiehlt Anbietern dringend, eine adäquate
                        Tierhütehaftpflichtversicherung abzuschließen, die eventuelle Schäden während der
                        Betreuungszeit abdeckt.
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-3">
                    3.3. Allgemeine Pflichten und Verhaltensregeln für alle Nutzer
                  </h4>
                  <div className="space-y-4 leading-relaxed">
                    <div>
                      <p className="mb-2">
                        <strong>Verbotene Inhalte und Verhaltensweisen:</strong> Es ist untersagt, Inhalte auf der
                        Plattform zu veröffentlichen oder zu übermitteln, die:
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          illegal, beleidigend, diskriminierend, pornografisch, gewaltverherrlichend oder in anderer
                          Weise anstößig sind,
                        </li>
                        <li>Urheber-, Marken- oder Persönlichkeitsrechte Dritter verletzen,</li>
                        <li>
                          Spam, Phishing-Versuche oder andere Formen des Missbrauchs der Plattform darstellen.
                        </li>
                      </ul>
                    </div>
                    <p>
                      <strong>Umgehung der Plattform:</strong> Es ist untersagt, die Plattform zur Kontaktaufnahme zu
                      nutzen, um anschließend Buchungen oder Verträge für Tierbetreuungsleistungen außerhalb der
                      Plattform und somit unter Umgehung der tigube-Gebühren abzuwickeln. Bei Zuwiderhandlung behält
                      sich tigube das Recht vor, das Konto zu sperren und ggf. eine Vertragsstrafe zu fordern.
                    </p>
                    <p>
                      <strong>Umgang mit Nutzerinhalten:</strong> Sie räumen tigube mit dem Hochladen von Inhalten
                      (z.B. Profilbilder, Tierfotos, Texte) das nicht-ausschließliche, weltweite, unentgeltliche und
                      unterlizenzierbare Recht ein, diese Inhalte zur Darstellung Ihres Profils auf der Plattform und
                      für Marketingzwecke von tigube zu nutzen.
                    </p>
                    <p>
                      <strong>Verantwortung für eigene Inhalte:</strong> Sie sind allein verantwortlich für alle
                      Inhalte, die Sie auf der Plattform veröffentlichen. Sie stellen tigube von allen Ansprüchen
                      Dritter frei, die sich aus der Verletzung von Rechten Dritter durch Ihre Inhalte ergeben.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* § 4 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                4. Vermittlungsprozess, Zahlungen und Gebühren
              </h3>
              <div className="space-y-5 leading-relaxed">
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">4.1. Vermittlungsprozess</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Suchende können auf der Plattform nach Anbietern suchen und deren Profile einsehen.
                    </li>
                    <li>
                      Wenn ein Suchender einen passenden Anbieter gefunden hat, kann er über die Plattform eine Anfrage
                      an diesen senden.
                    </li>
                    <li>Der Anbieter kann diese Anfrage annehmen oder ablehnen.</li>
                    <li>
                      Die weitere Kommunikation und der eigentliche Vertragsabschluss finden zwischen Suchendem und
                      Anbieter <strong>außerhalb der Plattform</strong> statt. tigube ist hierbei nicht involviert und
                      bietet keine Schlichtungsfunktion bei Problemen zwischen Suchenden und Anbietern an.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">
                    4.2. Gebührenstruktur von tigube (Abonnements)
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Die Nutzung der Basis-Version von tigube ist für Suchende und Anbieter kostenlos.
                    </li>
                    <li>
                      Für erweiterte Funktionen bieten wir eine kostenpflichtige Pro+ Version an. Die genauen Preise und
                      Leistungen sind auf der Website unter{' '}
                      <a href="/mitgliedschaften" className="text-primary-600 hover:underline">
                        Mitgliedschaften
                      </a>{' '}
                      einsehbar.
                    </li>
                    <li>
                      Die Zahlung der Abonnementgebühren erfolgt über den Zahlungsdienstleister Stripe.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">
                    4.3. Bezahlung der Betreuungsleistungen
                  </h4>
                  <p>
                    Die Bezahlung der Tierbetreuungsleistungen erfolgt{' '}
                    <strong>direkt zwischen dem Suchenden und dem Anbieter</strong> außerhalb der Plattform. tigube ist
                    an diesem Zahlungsprozess nicht beteiligt und erhält keine Provisionen aus den
                    Betreuungsleistungen.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">
                    4.4. Stornierungs- und Erstattungsrichtlinien für Betreuungsleistungen
                  </h4>
                  <p>
                    Die Stornierungs- und Erstattungsrichtlinien für die gebuchte Tierbetreuungsleistung liegen in der
                    alleinigen Verantwortung des Anbieters und müssen zwischen Suchendem und Anbieter direkt vereinbart
                    werden. tigube ist nicht für die Einhaltung oder Durchsetzung dieser Vereinbarungen zuständig.
                  </p>
                </div>
              </div>
            </section>

            {/* § 5 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Haftung</h3>
              <div className="space-y-5 leading-relaxed">
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">5.1. Haftung von tigube</h4>
                  <div className="space-y-3">
                    <p>
                      tigube haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der
                      Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung von tigube, seiner
                      gesetzlichen Vertreter oder Erfüllungsgehilfen beruhen, sowie für sonstige Schäden, die auf
                      einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung beruhen.
                    </p>
                    <p>
                      Bei leichter Fahrlässigkeit haftet tigube nur für die Verletzung einer wesentlichen
                      Vertragspflicht (Kardinalpflicht), beschränkt auf den bei Vertragsschluss vorhersehbaren,
                      typischerweise eintretenden Schaden.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p>
                        <strong>tigube übernimmt keine Haftung für die Leistungen der Anbieter.</strong> Da tigube
                        lediglich als Vermittler auftritt und der Vertrag über die Betreuungsleistung direkt zwischen
                        Suchendem und Anbieter geschlossen wird, ist tigube nicht für die Qualität, Sicherheit,
                        Rechtmäßigkeit oder Verfügbarkeit der von den Anbietern angebotenen Leistungen verantwortlich.
                        Jegliche Ansprüche sind direkt an den jeweiligen Anbieter zu richten.
                      </p>
                    </div>
                    <p>
                      tigube haftet nicht für Inhalte Dritter (Nutzerprofile, Bewertungen etc.), die von Nutzern auf
                      der Plattform veröffentlicht werden. tigube ist bemüht, die Plattform jederzeit verfügbar zu
                      halten, kann eine ständige Verfügbarkeit jedoch nicht garantieren.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">5.2. Haftung der Nutzer</h4>
                  <div className="space-y-3">
                    <p>
                      <strong>Haftung des Suchenden:</strong> Der Suchende haftet für alle Schäden, die durch sein
                      Tier während der Betreuungszeit entstehen, es sei denn, diese sind auf ein vorsätzliches oder
                      grob fahrlässiges Verhalten des Anbieters zurückzuführen. Dem Suchenden wird dringend empfohlen,
                      eine Tierhalterhaftpflichtversicherung abzuschließen.
                    </p>
                    <p>
                      <strong>Haftung des Anbieters:</strong> Der Anbieter haftet für alle Schäden, die er durch
                      fahrlässige oder vorsätzliche Verletzung der Sorgfaltspflichten an Tieren oder dem Eigentum des
                      Suchenden während der Betreuungszeit verursacht. Dem Anbieter wird dringend empfohlen, eine
                      Tierhütehaftpflichtversicherung abzuschließen.
                    </p>
                    <p>
                      Die Nutzer stellen tigube von allen Ansprüchen Dritter frei, die sich aus einem Verstoß gegen
                      diese Nutzungsbedingungen oder aus der Nutzung der Plattform ergeben.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* § 6 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                6. Vertragsdauer, Kündigung und Sperrung
              </h3>
              <div className="space-y-4 leading-relaxed">
                <p>
                  <strong>6.1. Vertragsdauer:</strong> Der Nutzungsvertrag über die Basis-Version der Plattform ist
                  auf unbestimmte Zeit geschlossen. Kostenpflichtige Abonnements (Pro+ Version) haben die auf der
                  Website angegebene Mindestlaufzeit und verlängern sich automatisch, wenn sie nicht fristgerecht
                  gekündigt werden.
                </p>

                <div>
                  <p className="mb-2">
                    <strong>6.2. Ordentliche Kündigung:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Nutzer können den Nutzungsvertrag jederzeit über die im Dashboard bereitgestellte Funktion
                      kündigen. Eine Kündigung per E-Mail ist ebenfalls möglich.
                    </li>
                    <li>
                      Für kostenpflichtige Abonnements gelten die auf der Website angegebenen Kündigungsfristen (z.B.
                      Kündigung jederzeit zum Ende des laufenden Monats).
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="mb-2">
                    <strong>6.3. Außerordentliche Kündigung / Sperrung:</strong> tigube kann den Nutzungsvertrag
                    fristlos kündigen und das Nutzerkonto sofort sperren, wenn ein wichtiger Grund vorliegt.
                    Ein wichtiger Grund liegt insbesondere vor, wenn:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>der Nutzer schwerwiegend oder wiederholt gegen diese Nutzungsbedingungen verstößt,</li>
                    <li>der Nutzer falsche, unvollständige oder irreführende Angaben gemacht hat,</li>
                    <li>
                      der Nutzer die Plattform missbräuchlich nutzt (z.B. Spam, illegale Inhalte, Umgehung der
                      Plattform),
                    </li>
                    <li>der Ruf von tigube durch das Verhalten des Nutzers erheblich geschädigt wird,</li>
                    <li>der Nutzer mit seinen Abonnementzahlungen in Verzug ist.</li>
                  </ul>
                  <p className="mt-3">
                    Vor einer Sperrung oder außerordentlichen Kündigung wird der Nutzer in der Regel über den Verstoß
                    informiert und ihm eine angemessene Frist zur Stellungnahme eingeräumt, es sei denn, dies ist
                    aufgrund der Schwere des Verstoßes nicht möglich oder zumutbar.
                  </p>
                </div>
              </div>
            </section>

            {/* § 7 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Änderungen der Nutzungsbedingungen</h3>
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>7.1.</strong> tigube behält sich das Recht vor, diese Nutzungsbedingungen jederzeit mit
                  Wirkung für die Zukunft zu ändern.
                </p>
                <p>
                  <strong>7.2.</strong> Über Änderungen werden die Nutzer per E-Mail an die bei der Registrierung
                  angegebene Adresse spätestens 14 Tage vor dem Inkrafttreten der geänderten Bedingungen informiert.
                </p>
                <p>
                  <strong>7.3.</strong> Erfolgt innerhalb der Frist von 14 Tagen kein Widerspruch des Nutzers, gelten
                  die geänderten Nutzungsbedingungen als angenommen. Widerspricht der Nutzer fristgerecht, behält sich
                  tigube das Recht vor, den Nutzungsvertrag außerordentlich zum Zeitpunkt des Inkrafttretens der
                  geänderten Bedingungen zu kündigen.
                </p>
              </div>
            </section>

            {/* § 8 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">8. Schlussbestimmungen</h3>
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>8.1.</strong> Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
                  UN-Kaufrechts.
                </p>
                <p>
                  <strong>8.2.</strong> Sofern der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder
                  öffentlich-rechtliches Sondervermögen ist, ist ausschließlicher Gerichtsstand für alle Streitigkeiten
                  aus oder im Zusammenhang mit diesen Nutzungsbedingungen der Sitz von tigube (Moos).
                </p>
                <p>
                  <strong>8.3.</strong> Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
                  (OS) bereit, die Sie unter{' '}
                  <a
                    href="http://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    http://ec.europa.eu/consumers/odr/
                  </a>{' '}
                  finden. tigube ist zur Teilnahme an einem Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle weder bereit noch verpflichtet.
                </p>
                <p>
                  <strong>8.4.</strong> Sollten einzelne Bestimmungen dieser Nutzungsbedingungen ganz oder teilweise
                  unwirksam sein oder werden, so wird hierdurch die Gültigkeit der übrigen Bestimmungen nicht berührt.
                  Die unwirksame Bestimmung ist durch eine Bestimmung zu ersetzen, die dem wirtschaftlichen Zweck am
                  nächsten kommt. Entsprechendes gilt für Regelungslücken.
                </p>
              </div>
            </section>

            {/* Kontakt */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Kontakt</h3>
              <div className="space-y-1 text-gray-700">
                <p className="font-semibold">tierisch gut betreut UG (haftungsbeschränkt)</p>
                <p>Iznangerstr. 32, 78345 Moos</p>
                <p>
                  E-Mail:{' '}
                  <a href="mailto:info@tigube.de" className="text-primary-600 hover:underline">
                    info@tigube.de
                  </a>
                </p>
              </div>
            </section>

            {/* Stand */}
            <section className="text-sm text-gray-500 border-t pt-6">
              <p>
                <strong>Stand dieser Nutzungsbedingungen:</strong> 05.03.2026
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgbPage;