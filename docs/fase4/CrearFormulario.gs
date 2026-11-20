function crearFormulario() {
  const dashboard = 'https://movilidad-urbana-six.vercel.app/';
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('formularioMovilidad')) {
    console.log(FormApp.openById(props.getProperty('formularioMovilidad')).getPublishedUrl());
    return;
  }
  const f = FormApp.create('Movilidad urbana · ¿Dónde y cuándo se concentran los viajes en taxi?');
  f.setDescription('Explora los viajes de taxis amarillos de Nueva York entre enero y abril de 2018. Abre el dashboard, recorre libremente el menú, los filtros, el mapa y las gráficas. Después regresa aquí para compartir tu experiencia. Tiempo aproximado de la encuesta: 5 minutos.\n\nDashboard: ' + dashboard)
    .setCollectEmail(false).setProgressBar(true).setConfirmationMessage('Gracias por ayudarnos a mejorar el dashboard. Equipo Chicken Brothers.');
  f.addSectionHeaderItem().setTitle('Datos generales');
  f.addTextItem().setTitle('Edad en años').setRequired(true);
  function opciones(titulo, opciones, requerida = true) {
    f.addMultipleChoiceItem().setTitle(titulo).setChoiceValues(opciones).setRequired(requerida);
  }
  opciones('Género (opcional)', ['Femenino','Masculino','Otro','Prefiero no decirlo'], false);
  opciones('Ocupación o rol', ['Estudiante','Docente','Profesional','Otro']);
  opciones('Nivel educativo', ['Básico','Medio superior','Superior','Posgrado','Otro']);
  f.addScaleItem().setTitle('¿Qué tanto conoces el tema de movilidad urbana?').setBounds(1,5).setLabels('Nada','Mucho').setRequired(true);
  opciones('¿Qué experiencia tienes usando dashboards?', ['Ninguna','Básica','Intermedia','Avanzada']);
  f.addPageBreakItem().setTitle('Evaluación del dashboard');
  [
    'El dashboard es fácil de entender.',
    'Los colores utilizados ayudan a interpretar la información.',
    'Puedo identificar fácilmente el KPI principal.',
    'Los gráficos representan correctamente los datos.',
    'La información está bien organizada y estructurada.',
    'Los textos, títulos y etiquetas son claros.',
    'La interactividad (filtros, botones) es intuitiva.',
    'Considero que el dashboard es visualmente atractivo.',
    'El dashboard me permite obtener conclusiones o insights.',
    'En general, la experiencia de uso fue satisfactoria.'
  ].forEach(p => f.addScaleItem().setTitle(p).setBounds(1,5).setLabels('Totalmente en desacuerdo','Totalmente de acuerdo').setRequired(true));
  f.addPageBreakItem().setTitle('Tu experiencia y sugerencias');
  [
    '¿Qué te gustó más del dashboard?',
    '¿Qué parte te resultó confusa o difícil de entender?',
    '¿Qué mejorarías en el diseño o en los gráficos?',
    '¿Qué KPI o gráfico te resultó más útil?',
    '¿Agregarías o quitarías algún elemento?'
  ].forEach(p => f.addParagraphTextItem().setTitle(p));
  if (f.supportsAdvancedResponderPermissions()) f.setPublished(true);
  props.setProperty('formularioMovilidad', f.getId());
  console.log('Formulario para responder: ' + f.getPublishedUrl());
  console.log('Dashboard: ' + dashboard);
}
