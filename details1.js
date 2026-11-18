// Lehrpräparat der rechten Halsseite. Koordinaten wie im Grundmodell.
// Ein Faszienfenster wird beim Aufrufen des zugehörigen Lernpunkts eingeblendet.
window.extendLateral = ({sweep, nerve, vein, vessel, alias, anchors}) => {
  const fascia = (key, path, width, depth, axis = [0, 0, 1]) =>
    sweep(key, 'fascia', path, width, depth, {axis, overlay: true});

  // Drei verschieden tiefe Fenster. Die oberflächliche Lage folgt der
  // schrägen Außenfläche des Kopfwenders, die mittlere den Zungenbeinsenkern.
  fascia('superficialFascia', [[1.42,2.0,.2],[1.43,1.25,.53],[1.34,.38,.76],
    [1.15,-.62,.97],[.99,-1.57,1.08],[.86,-2.18,1.14]],
    t => .3 + .24 * Math.sin(Math.PI*t), .039, [.69,0,.72]);
  fascia('pretrachealFascia', [[0,.84,1.26],[0,.13,1.19],[0,-.76,1.21],
    [0,-1.62,1.21],[0,-2.22,1.12]], t => .36 + .46*t, .031);
  fascia('prevertebralFascia', [[.58,1.68,-.13],[.61,.84,-.05],
    [.66,-.16,.08],[.72,-1.1,.2],[.83,-1.95,.27]],
    t => .45+.25*t, .035, [.36,0,.93]);

  // Gemeinsame Hülle von Jugularvene, Karotis und Vagus. Ein abgesetztes
  // Segment erhält den Blick auf den Eintritt der drei Strukturen.
  fascia('carotidSheath', [[.87,-1.03,.51],[.89,-.66,.51],[.9,-.27,.5],
    [.91,.13,.5],[.92,.48,.49]], .34, .239);
  anchors.carotidSheath = [1.12,-.25,.69];

  // Referenz für die Zwischensehne und die getrennt markierbaren Bäuche.
  alias('omohyoid', 'omohyoidSuperior', [.57,.17,1.12], 'muscle');
  alias('digastric', 'digastricAnterior', [.45,1.24,1.38], 'muscle');
  alias('omohyoidSuperior', 'omohyoidSuperior', [.57,.17,1.12], 'muscle');
  alias('omohyoidInferior', 'omohyoidInferior', [1.81,-1.58,.18], 'muscle');
  alias('digastricPosterior', 'digastricPosterior', [1.1,1.86,.28], 'muscle');
  alias('digastricAnterior', 'digastricAnterior', [.45,1.24,1.38], 'muscle');

  // Der Verlauf unterhalb des Muskelbauchs und der Fasziendurchtritt
  // unterscheiden sich klar vom oberflächlichen Abschnitt derselben Vene.
  alias('externalJugularOpening', 'externalJugular', [1.51,-1.8,.67], 'vein');
  alias('accessoryCarotid', 'accessory', [1.18,1.67,.22], 'nerve');
  alias('accessoryLateral', 'accessory', [1.72,-.31,-.23], 'nerve');
  alias('brachialGap', 'brachialPlexus', [1.15,-.9,-.12], 'nerve');

  vein('sublingualVein', [[.48,1.5,1.33],[.73,1.38,1.12],[1.02,1.36,.79],
    [1.09,1.41,.48],[1.06,1.3,.34]], .035);
  vessel('scmArtery', [[1.02,1.64,.55],[1.1,1.55,.52],[1.09,1.48,.54],
    [1.14,1.4,.44],[1.26,1.42,.31]], .031);
  vessel('laryngealArtery', [[.71,.82,.79],[.64,.8,.89],[.51,.76,.96],
    [.38,.74,.96]], .028);
  nerve('externalLaryngealBranch', [[.77,1.33,.37],[.66,1.06,.46],[.61,.8,.67],
    [.57,.42,.79],[.42,.16,.93]], .025);
  nerve('thyrohyoidBranch', [[.96,1.29,.77],[.77,1.16,.87],[.58,.97,.94],
    [.46,.82,.97]], .024);

  // Oberflächliche und tiefe Leitungsbahnen im seitlichen Dreieck.
  vessel('ascendingCervical', [[1.01,-1.64,.29],[.99,-1.24,.4],[.91,-.65,.26],
    [.85,-.09,.15],[.82,.43,.06]], .032);
  vessel('superficialCervical', [[1.02,-1.64,.29],[1.37,-1.48,.28],
    [1.77,-1.34,.07],[2.13,-1.25,-.39],[2.03,-.91,-.53]], .039);
  nerve('dorsalScapularNerve', [[.8,.05,-.34],[1.06,-.26,-.41],[1.26,-.56,-.51],
    [1.43,-.89,-.65],[1.73,-1.3,-.76],[1.99,-1.89,-.91]], .031);
  nerve('suprascapularNerve', [[1.35,-1.08,-.05],[1.65,-1.18,-.02],
    [2.05,-1.4,-.08],[2.44,-1.59,-.27],[2.65,-1.83,-.41]], .035);
  nerve('subclavianNerve', [[1.38,-1.08,-.05],[1.54,-1.43,.18],
    [1.65,-1.72,.41],[1.74,-2.14,.69]], .024);
};
