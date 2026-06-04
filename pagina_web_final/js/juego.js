// ---- FRASES POR NIVEL ----

var frases = {
    basico: [
        "el sol brilla hoy",
        "me gusta el cafe",
        "el gato duerme aqui",
        "tengo mucha hambre",
        "el agua esta fria",
        "mi casa es grande",
        "hoy hace buen tiempo",
        "el perro corre rapido",
        "voy al parque ahora",
        "la luna es bonita",
        "el libro es azul",
        "como una manzana",
        "el tren llega tarde",
        "me gusta caminar",
        "la flor es roja",
        "hoy es lunes",
        "el pan esta rico",
        "vivo en la ciudad",
        "el mar es inmenso",
        "me gusta la musica"
    ],
    intermedio: [
        "La tecnologia avanza muy rapido en estos tiempos.",
        "El trabajo en equipo siempre da mejores resultados.",
        "Leer cada dia mejora mucho la concentracion.",
        "La practica constante es la clave del exito.",
        "Viajar abre la mente y cambia la perspectiva.",
        "El ejercicio regular mejora la salud y el animo.",
        "Una buena comunicacion evita muchos malentendidos.",
        "Los pequenos habitos del dia a dia marcan la diferencia.",
        "La paciencia es una virtud que vale la pena cultivar.",
        "Aprender cosas nuevas mantiene la mente activa.",
        "El respeto mutuo es la base de toda convivencia.",
        "Cada error es una oportunidad para mejorar.",
        "La constancia supera con creces al talento.",
        "Escuchar es tan importante como saber hablar.",
        "Un buen plan ahorra mucho tiempo y esfuerzo.",
        "La creatividad surge cuando menos te lo esperas.",
        "Confiar en uno mismo es el primer gran paso.",
        "El tiempo libre bien usado recarga las energias.",
        "Ser honesto contigo mismo es fundamental.",
        "Los retos grandes se superan paso a paso."
    ],
    pro: [
        "La inteligencia artificial esta redefiniendo el mercado laboral a escala global.",
        "El pensamiento critico es la habilidad mas demandada en el entorno profesional actual.",
        "La gestion eficiente del tiempo multiplica la productividad en cualquier disciplina.",
        "Los ecosistemas digitales han transformado radicalmente los modelos de negocio tradicionales.",
        "La sostenibilidad medioambiental es ya una prioridad estrategica en las grandes corporaciones.",
        "El liderazgo efectivo combina vision a largo plazo con capacidad de ejecucion inmediata.",
        "La automatizacion de procesos repetitivos libera recursos para tareas de mayor valor.",
        "Una cultura organizacional solida atrae y retiene el talento mas cualificado del mercado.",
        "La toma de decisiones basada en datos reduce el margen de error significativamente.",
        "El aprendizaje continuo es la unica ventaja competitiva sostenible a largo plazo.",
        "La diversidad de equipos impulsa la innovacion y mejora los resultados empresariales.",
        "Gestionar la incertidumbre con serenidad es una competencia directiva imprescindible.",
        "La experiencia de usuario define el exito o el fracaso de cualquier producto digital.",
        "La colaboracion entre departamentos elimina silos y acelera la entrega de valor.",
        "El equilibrio entre innovacion y estabilidad operativa es el gran reto de toda empresa.",
        "Una estrategia de comunicacion coherente refuerza la identidad y reputacion de marca.",
        "La resiliencia organizacional determina la capacidad de adaptacion ante las crisis.",
        "Invertir en formacion interna genera retorno a medio plazo en todas las areas.",
        "El analisis de datos cualitativos complementa y enriquece las metricas cuantitativas.",
        "La confianza entre equipos es el activo mas valioso y el mas dificil de recuperar."
    ]
};


// ---- ESTADO ----

var nivel = (new URLSearchParams(window.location.search)).get('nivel') || 'basico';
var listaPendiente = [];
var fraseActual = '';
var tiempoRestante = 60;
var intervaloTiempo = null;
var juegoActivo = false;

// Acumulados de sesión: solo se suman al pulsar Enter, no mientras escribes.
// Así la precisión en vivo sube si corriges, pero al confirmar se registra
// el estado final de la frase (lo que quedó bien y lo que quedó mal).
var acumCorrectos = 0;   // letras correctas al confirmar cada frase
var acumTotales = 0;     // total de letras evaluadas al confirmar cada frase


// ---- ARRANQUE ----

function iniciar() {
    listaPendiente = mezclar(frases[nivel].slice());
    cargarSiguienteFrase();
    iniciarTemporizador();
    juegoActivo = true;
    document.getElementById('input').focus();
}

function mezclar(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}

function cargarSiguienteFrase() {
    if (listaPendiente.length === 0) {
        listaPendiente = mezclar(frases[nivel].slice());
    }
    fraseActual = listaPendiente.shift();
    renderizarFrase('');
}

function renderizarFrase(escrito) {
    var html = '';
    for (var i = 0; i < fraseActual.length; i++) {
        var letra = fraseActual[i];
        var clase = '';

        if (i < escrito.length) {
            clase = (escrito[i] === fraseActual[i]) ? 'letra-ok' : 'letra-error';
        } else if (i === escrito.length) {
            clase = 'letra-cursor';
        }

        if (letra === ' ') {
            html += '<span class="letra ' + clase + '">&nbsp;</span>';
        } else {
            html += '<span class="letra ' + clase + '">' + letra + '</span>';
        }
    }
    document.getElementById('texto').innerHTML = html;
}


// ---- TEMPORIZADOR ----

function iniciarTemporizador() {
    document.getElementById('tiempo').textContent = tiempoRestante;
    intervaloTiempo = setInterval(function () {
        tiempoRestante--;
        document.getElementById('tiempo').textContent = tiempoRestante;
        if (tiempoRestante <= 0) {
            terminarJuego();
        }
    }, 1000);
}


// ---- EVENTOS ----

document.getElementById('input').addEventListener('input', function () {
    if (!juegoActivo) return;
    var escrito = this.value;
    renderizarFrase(escrito);
    actualizarPrecisionEnVivo(escrito);
});

document.getElementById('input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!juegoActivo) return;
        confirmarFrase();
    }
});

document.getElementById('input').addEventListener('paste', function (e) {
    e.preventDefault();
});


// ---- PRECISION EN VIVO ----
// Compara el input actual contra la frase.
// Si el usuario borra y corrige, los errores desaparecen y la precisión sube.
// Cuando no hay nada escrito todavía muestra los acumulados de frases anteriores.

function actualizarPrecisionEnVivo(escrito) {
    if (escrito.length === 0) {
        // Sin nada escrito: mostrar precisión acumulada de frases ya confirmadas
        mostrarPrecisionAcumulada();
        return;
    }

    // Contar errores en lo que hay escrito ahora mismo
    var erroresAhora = 0;
    for (var i = 0; i < escrito.length; i++) {
        if (escrito[i] !== fraseActual[i]) {
            erroresAhora++;
        }
    }
    var correctosAhora = escrito.length - erroresAhora;

    // Precisión combinada: acumulado de frases anteriores + estado actual
    var totalCorrectos = acumCorrectos + correctosAhora;
    var totalLetras = acumTotales + escrito.length;

    var p = Math.round((totalCorrectos / totalLetras) * 100);
    document.getElementById('precision').textContent = p + '%';
}

function mostrarPrecisionAcumulada() {
    if (acumTotales === 0) {
        document.getElementById('precision').textContent = '100%';
        return;
    }
    var p = Math.round((acumCorrectos / acumTotales) * 100);
    document.getElementById('precision').textContent = p + '%';
}


// ---- CONFIRMAR FRASE ----
// Al pulsar Enter se registra el estado FINAL del input
// (lo que el usuario dejó escrito, con sus correcciones incluidas).

function confirmarFrase() {
    var escrito = document.getElementById('input').value;
    if (escrito.trim() === '') return;

    // Evaluar la frase completa: comparar posición a posición
    var correctosEstaFrase = 0;
    var totalEstaFrase = fraseActual.length;

    for (var i = 0; i < totalEstaFrase; i++) {
        if (escrito[i] === fraseActual[i]) {
            correctosEstaFrase++;
        }
    }

    // Sumar al acumulado de sesión
    acumCorrectos += correctosEstaFrase;
    acumTotales += totalEstaFrase;

    // Actualizar PPM: palabras = caracteres correctos acumulados / 5
    var segundos = 60 - tiempoRestante;
    if (segundos > 0) {
        var ppm = Math.round((acumCorrectos / 5) / (segundos / 60));
        document.getElementById('ppm').textContent = ppm;
    }

    // Mostrar precisión ya sin el input actual (quedó confirmado)
    mostrarPrecisionAcumulada();

    document.getElementById('input').value = '';
    cargarSiguienteFrase();
}


// ---- FIN ----

function terminarJuego() {
    clearInterval(intervaloTiempo);
    juegoActivo = false;
    document.getElementById('input').disabled = true;
    document.getElementById('input').placeholder = 'Tiempo agotado';

    var ppmFinal = document.getElementById('ppm').textContent;
    var precisionFinal = document.getElementById('precision').textContent;

    document.getElementById('texto').innerHTML =
        '<span style="color:#60a5fa;">Sesion terminada — ' +
        ppmFinal + ' PPM · ' + precisionFinal + ' de precision</span>';
}


iniciar();