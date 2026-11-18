/* Details des tiefen Halses im gleichen Präparatkoordinatensystem.
   Raumgrenzen sind Lagepunkte. Gefäße und Nerven haben eigene Mittellinien. */
window.extendAnatomy = ({ sweep, bulb, alias }) => {
  function onSide(path, sign) {
    return path.map(([x, y, z]) => [sign * x, y, z]);
  }

  function pair(key, type, path, width, depth = width, options = {}) {
    for (const sign of [-1, 1]) {
      sweep(key, type, onSide(path, sign), width, depth, { ...options, side: sign });
    }
  }

  function pairedNodule(key, type, [x, y, z], radii) {
    for (const sign of [-1, 1]) {
      bulb(key, type, [sign * x, y, z], radii, { side: sign });
    }
  }

  alias('deepScmRegion', 'scm', [1.17, .23, .47]);
  alias('scalenoVertebralSpace', 'longusColli', [.72, -1.55, -.04], 'fascia');
  pair('longusCapitis', 'muscle', [[.72,-.69,-.17],[.67,.04,-.12],[.57,1.18,-.13],[.42,2.26,-.22]], .13, .09);

  // Segmenthöhe aus der Serie C1 (y=1.64) bis C7 (y=-1.24).
  for (let i = 0; i < 3; i++) {
    const y = 1.16 - .48 * i;
    pair('cervicalRoots', 'nerve', [[.68,y,-.46],[.81,y,-.32],[.9,y-.13,-.23],[.96,y-.19,-.21]], .038);
    if (i < 2) {
      pair('cervicalRoots', 'nerve', [[.88,y-.07,-.27],[.98,y-.24,-.2],[.91,y-.53,-.22]], .031);
    }
  }
  alias('cervicalRoots', 'cervicalRoots', [.88,.60,-.24]);
  pair('inferiorAnsa', 'nerve', [[.88,.6,-.24],[1,.31,.07],[1.08,-.07,.37],[1.04,-.43,.6],[.95,-.69,.68]], .033);
  pair('inferiorAnsa', 'nerve', [[.88,1.08,-.24],[.99,.7,-.12],[1,.31,.07]], .029);
  alias('inferiorAnsa', 'inferiorAnsa', [1.04,-.43,.6]);
  alias('accessoryExit', 'accessory', [1.34,.42,.16]);
  pair('omoTendon', 'fascia', [[1.13,-1.37,.61],[1.21,-1.47,.55],[1.30,-1.49,.5]], .046);
  alias('venousAngle', 'internalJugular', [.85,-2.31,.56]);

  // Nur rechts. Die linke Einmündung wird im Basismodell durch den Ductus thoracicus dargestellt.
  sweep('rightLymphaticDuct', 'lymph', [[.99,-2.01,.33],[.95,-2.14,.44],[.85,-2.30,.55]], .04);
  alias('stellateGanglion', 'ganglion', [.6,-1.99,-.08]);
  alias('superiorCervicalGanglion', 'ganglion', [.6,1.77,-.08]);
  alias('vertebralEntry', 'vertebralArtery', [.65,-.76,-.30]);
  pair('vertebralVein', 'vein', [[.7,-.76,-.22],[.72,-1.24,-.08],[.79,-1.85,.02],[.82,-2.23,.4]], .053);
  pair('costocervicalTrunk', 'artery', [[1.1,-1.92,.13],[1.03,-1.94,-.13],[.96,-1.87,-.42]], .053);
  pair('deepCervicalArtery', 'artery', [[.96,-1.87,-.42],[.8,-1.6,-.57],[.72,-1.22,-.76],[.69,-.69,-.83]], .036);
  pair('supremeIntercostal', 'artery', [[.96,-1.87,-.42],[.94,-2.12,-.63],[.92,-2.52,-.72]], .039);
  pair('internalThoracicArtery', 'artery', [[.9,-1.96,.21],[.88,-2.22,.39],[.69,-2.6,.69]], .058);
  alias('recurrentAtThyroid', 'recurrent', [.38,-.56,.37]);
  pairedNodule('zuckerkandl', 'organ', [.48,-.39,.53], [.10,.14,.11]);
  pairedNodule('pleuralDome', 'organ', [1.15,-2.43,-.19], [.49,.55,.45]);
  alias('pleuralDome','pleuralDome',[1.15,-1.89,-.19]);

  alias('muscularTriangle', 'sternohyoid', [.54,-.91,1.02], 'fascia');
  pair('thyrohyoid', 'muscle', [[.46,.38,.94],[.46,.61,1.03],[.46,.92,1.06]], .12,.065);
  alias('omohyoidUpper', 'omohyoid', [.56,.18,1.12]);
  sweep('jugularArch', 'vein', [[-.38,-1.92,1.23],[-.23,-2.02,1.25],[0,-2.06,1.25],[.23,-2.02,1.25],[.38,-1.92,1.23]], .043);
  for (const sign of [-1,1]) {
    sweep('thyroidPlexus','vein',onSide([[.32,-.83,.92],[.24,-1.12,.95],[.32,-1.36,.94],[.25,-1.68,.91],[.31,-2.0,.86]],sign),.038);
  }
  for (let i=0; i<3; i++) {
    const y=-1.04-i*.25;
    sweep('thyroidPlexus','vein',[[-.25,y,.94],[0,y-.08,.96],[.28,y-.17,.94]],.026);
  }
  alias('thyroidPlexus','thyroidPlexus',[0,-1.37,.96]);
  sweep('thyroidIsthmus','organ',[[-.34,-.43,.9],[0,-.46,.99],[.34,-.43,.9]],.13,.10);
  sweep('pyramidalLobe','organ',[[-.16,-.44,.98],[-.15,-.18,.99],[-.11,.07,1.01]],t=>.078*(1-t)+.016);
  pairedNodule('upperParathyroid','organ',[.50,-.14,.57],[.055,.079,.045]);
  pairedNodule('lowerParathyroid','organ',[.44,-.77,.63],[.052,.067,.044]);
  pair('cricothyroidMuscle','muscle',[[.23,.13,1.06],[.31,.24,1.075],[.36,.39,.99]],.088,.05);
  sweep('medianCricothyroidLigament','fascia',[[0,.15,1.064],[0,.21,1.08],[0,.29,1.09]],.145,.028);
  alias('cricothyroidMuscle','cricothyroidMuscle',[.31,.24,1.075]);

  alias('submandibularTriangle','submandibular',[1.02,1.49,.78],'fascia');
  alias('submentalTriangle','mylohyoid',[0,1.28,1.46],'fascia');
  pair('submandibularDuct','organ',[[.86,1.45,.75],[.69,1.50,.74],[.53,1.54,1.01],[.32,1.57,1.38],[.14,1.56,1.59]],.043);
  pair('lingualNerve','nerve',[[.99,2.21,.31],[.89,1.78,.61],[.71,1.55,.86],[.49,1.48,1.03],[.39,1.63,1.25]],.038);
  pairedNodule('submandibularGanglion','nerve',[.74,1.5,.83],[.059,.065,.052]);
  pair('ascendingPalatine','artery',[[1.02,1.46,.77],[.95,1.59,.62],[.9,1.91,.4],[.78,2.14,.37]],.034);
  pair('submentalArtery','artery',[[1.02,1.45,.92],[.87,1.38,1.10],[.57,1.35,1.35],[.32,1.44,1.60]],.041);
  pair('mylohyoidNerve','nerve',[[1.13,1.99,.42],[1.04,1.62,.67],[.88,1.40,.96],[.65,1.35,1.19],[.43,1.38,1.42]],.029);
  sweep('mylohyoidRaphe','fascia',[[0,.95,1.21],[0,1.19,1.38],[0,1.48,1.69]],.033);
  pair('sublingualArtery','artery',[[.48,1.35,1.18],[.4,1.41,1.32],[.28,1.5,1.51],[.19,1.52,1.59]],.032);
  pair('hyoglossus','muscle',[[.64,.97,.63],[.62,1.22,.83],[.56,1.44,1.00],[.50,1.68,1.14]],.17,.073);
  pair('styloglossus','muscle',[[1.15,2.61,-.01],[.91,2.04,.43],[.74,1.71,.81],[.56,1.62,1.21]],.102,.061);
  pair('stylopharyngeus','muscle',[[1.11,2.60,-.02],[.90,2.02,.16],[.68,1.55,.26],[.53,1.03,.27]],.092,.064);
  alias('styloidLayers','styloglossus',[.91,2.04,.43]);
  alias('deepStyloidSpace','internalCarotid',[.81,2.06,.11],'fascia');
};
