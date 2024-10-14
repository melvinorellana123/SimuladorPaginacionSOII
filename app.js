// Variables para manejar los procesos y la memoria
let procesos = [];
let memoria = Array(7).fill(null);

// Función para verificar si el nombre del proceso ya existe
function nombreDuplicado(nombre) {
    return procesos.some(proceso => proceso.nombre === nombre);
}

// Función para actualizar las listas de procesos en formato de tabla
function actualizarListasProcesos() {
    const listaEjecucion = document.getElementById('lista-ejecucion');
    const listaEspera = document.getElementById('lista-espera');

    // Mantener los encabezados y eliminar solo las filas de datos
    listaEjecucion.querySelectorAll('tbody').forEach(tbody => tbody.remove());
    listaEspera.querySelectorAll('tbody').forEach(tbody => tbody.remove());

    let procesosActivos = 0;
    let procesosEspera = 0;

    // Crear cuerpos de tabla (tbody)
    const tbodyEjecucion = document.createElement('tbody');
    const tbodyEspera = document.createElement('tbody');

    procesos.forEach(proceso => {
        const fila = document.createElement('tr');
        const nombreTd = document.createElement('td');
        const tamanoTd = document.createElement('td');

        nombreTd.textContent = proceso.nombre;
        tamanoTd.textContent = `${proceso.tamano} páginas`;

        fila.appendChild(nombreTd);
        fila.appendChild(tamanoTd);

        if (proceso.estado === 'En ejecución') {
            tbodyEjecucion.appendChild(fila);
            procesosActivos++;
        } else {
            tbodyEspera.appendChild(fila);
            procesosEspera++;
        }
    });

    // Agregar los cuerpos de tabla (tbody) generados a las tablas
    listaEjecucion.appendChild(tbodyEjecucion);
    listaEspera.appendChild(tbodyEspera);

    // Actualizar los contadores
    document.getElementById('contador-activos').textContent = procesosActivos;
    document.getElementById('contador-espera').textContent = procesosEspera;
    document.getElementById('contador-totales').textContent = procesos.length;
}


// Función para actualizar los fragmentos de memoria
function actualizarMemoria() {
    const fragmentosDiv = document.getElementById('fragmentos');
    fragmentosDiv.innerHTML = '';

    memoria.forEach((proceso, index) => {
        const div = document.createElement('div');
        div.textContent = proceso ? `P${proceso.nombre}` : 'Libre';

        // Asignar la clase de acuerdo con el estado del fragmento
        if (proceso) {
            div.className = 'pagina-ocupada'; // Página ocupada
        } else {
            div.className = 'pagina-libre'; // Página libre
        }

        fragmentosDiv.appendChild(div);
    });
}

// Función para agregar un nuevo proceso
function agregarProceso() {
    const nombre = document.getElementById('nombre-proceso').value.trim();
    const tamano = document.getElementById('tamano-proceso').value.trim();

    // Verificar si el nombre o el tamaño están vacíos
    if (!nombre || !tamano) {
        alert('Por favor, ingrese tanto el nombre del proceso como el tamaño del proceso.');
        return;
    }

    const tamanoInt = parseInt(tamano);

    // Verificar que el tamaño esté dentro del rango válido (1 a 7)
    if (tamanoInt < 1 || tamanoInt > 7) {
        alert('Por favor, ingrese un tamaño de proceso válido (entre 1 y 7).');
        return;
    }

    // Verificar si el nombre ya existe
    if (nombreDuplicado(nombre)) {
        alert('El nombre del proceso ya existe. Por favor, elija otro.');
        return;
    }

    // Crear el nuevo proceso
    const nuevoProceso = { nombre, tamano: tamanoInt, estado: 'En espera' };
    procesos.push(nuevoProceso);
    asignarMemoria(nuevoProceso);

    actualizarListasProcesos();
    actualizarMemoria();
}

// Función para asignar un proceso a la memoria
function asignarMemoria(proceso) {
    let espacioDisponible = 0;

    for (let i = 0; i < memoria.length; i++) {
        if (!memoria[i]) espacioDisponible++;
        if (espacioDisponible === proceso.tamano) {
            for (let j = i - proceso.tamano + 1; j <= i; j++) {
                memoria[j] = proceso;
            }
            proceso.estado = 'En ejecución';
            return;
        }
    }
}
// Función para verificar si hay procesos en espera que puedan moverse a ejecución
function verificarEspera() {
    procesos.forEach(proceso => {
        if (proceso.estado === 'En espera') {
            let espacioDisponible = 0;
            for (let i = 0; i < memoria.length; i++) {
                if (!memoria[i]) espacioDisponible++;
                if (espacioDisponible === proceso.tamano) {
                    for (let j = i - proceso.tamano + 1; j <= i; j++) {
                        memoria[j] = proceso;
                    }
                    proceso.estado = 'En ejecución';
                    return;
                }
            }
        }
    });
}

// Función para terminar un proceso
function terminarProceso() {
    const nombreTerminar = document.getElementById('nombre-terminar').value.trim();
    const procesoTerminar = procesos.find(p => p.nombre === nombreTerminar);

    if (!procesoTerminar) {
        alert('No existe un proceso con ese nombre.');
        return;
    }

    // Liberar los fragmentos de memoria ocupados
    memoria = memoria.map(fragmento => (fragmento && fragmento.nombre === procesoTerminar.nombre) ? null : fragmento);

    // Eliminar el proceso de la lista
    procesos = procesos.filter(p => p.nombre !== nombreTerminar);

    // Actualizar las listas y la memoria
    actualizarListasProcesos();
    actualizarMemoria();

    // Verificar si algún proceso en espera puede ser movido a ejecución
    verificarEspera();

    // Actualizar nuevamente después de mover procesos
    actualizarListasProcesos();
    actualizarMemoria();
}

// Manejo de eventos de los botones
document.getElementById('agregar').addEventListener('click', agregarProceso);
document.getElementById('terminar').addEventListener('click', terminarProceso);

// Inicializar la memoria
actualizarMemoria();
