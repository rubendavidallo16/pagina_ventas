// Cargar el carrito desde LocalStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function actualizarContadorCarritoHeader() {
    const contador = document.getElementById('cart-count-header');
    if (contador) {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contador.textContent = totalItems;
    }
}

function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenedor');
    const conteoTexto = document.getElementById('cart-item-count-text');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    // Actualizar el conteo de items en el texto
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (conteoTexto) {
        conteoTexto.textContent = `${totalItems} productos`;
    }

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p class="text-slate-500 py-8">Tu carrito está vacío. ¡Explora nuestros productos y date un gusto!</p>';
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }

    contenedor.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((item, index) => {
        subtotal += item.precio * item.cantidad;

        const div = document.createElement('div');
        div.className = 'flex flex-col sm:flex-row gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md';

        div.innerHTML = `
            <div class="shrink-0">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-32 border border-slate-100 dark:border-slate-800" style="background-image: url('${item.imagenUrl}')"></div>
            </div>
            <div class="flex flex-1 flex-col justify-between">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">${item.nombre}</h3>
                    </div>
                    <p class="text-lg font-bold text-slate-900 dark:text-slate-100">$${item.precio.toFixed(2)}</p>
                </div>
                <div class="flex items-center justify-between mt-4 sm:mt-0">
                    <div class="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button class="btn-restar flex h-8 w-8 items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors" data-index="${index}">
                            <span class="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span class="text-sm font-bold w-4 text-center">${item.cantidad}</span>
                        <button class="btn-sumar flex h-8 w-8 items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors" data-index="${index}">
                            <span class="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                    <button class="btn-eliminar text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider" data-index="${index}">
                        <span class="material-symbols-outlined text-lg">delete</span>
                        Limpiar
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });

    // Actualizar Totales
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    // Se asume un costo fijo por envío/impuestos igual a 0 por el momento para simplificar la lógica del mock
    const total = subtotal;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    // Manejar Eventos de los botones
    document.querySelectorAll('.btn-sumar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            carrito[index].cantidad++;
            guardarYRenderizar();
        });
    });

    document.querySelectorAll('.btn-restar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad--;
            } else {
                carrito.splice(index, 1);
            }
            guardarYRenderizar();
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            carrito.splice(index, 1);
            guardarYRenderizar();
        });
    });
}

function guardarYRenderizar() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarritoHeader();
}

// Inicializar la página del carrito
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarritoHeader();
    renderizarCarrito();

    // Logica de Checkout
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("¡Botón checkout presionado!");

            if (carrito.length === 0) {
                alert("Tu carrito está vacío. ¡Agrega productos antes de pagar!");
                return;
            }

            try {
                // 1. Verificar si el usuario ha iniciado sesión
                const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

                if (authError || !user) {
                    alert("Debes iniciar sesión para poder realizar la compra.");
                    window.location.href = "login.html";
                    return;
                }

                // 2. Calcular el total a enviar a la BD
                const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

                btnCheckout.disabled = true;
                btnCheckout.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Procesando...';

                // Generar un número entero (int4) único derivado del UUID del usuario
                let hash = 0;
                for (let i = 0; i < user.id.length; i++) {
                    hash = ((hash << 5) - hash) + user.id.charCodeAt(i);
                    hash = hash & hash; // Convertir a 32bit integer
                }
                const idClienteNum = Math.abs(hash);

                console.log("Intentando insertar en Supabase...", { idClienteNum, subtotal });

                // 4. Insertar la compra en la tabla "venta"
                const { error: dbError } = await window.supabaseClient
                    .from('venta')
                    .insert([
                        {
                            id_cliente: idClienteNum,
                            total: subtotal,
                            estado: "Pendiente",
                            metodo_pago: "Tarjeta"
                        }
                    ]);

                if (dbError) {
                    console.error("Error exacto de Supabase:", dbError);
                    throw dbError;
                }

                // 5. Compra Exitosa: Limpiamos carrito
                localStorage.removeItem('carrito');
                carrito = [];
                renderizarCarrito();
                actualizarContadorCarritoHeader();

                alert("¡Compra registrada con éxito! Tus productos están en camino.");
                window.location.href = "index.html";

            } catch (err) {
                console.error("Error crítico procesando pago:", err);
                alert("Hubo un error al registrar la venta. Por favor, abre la consola (F12) para ver el error exacto: " + (err.message || err.details || ""));
            } finally {
                btnCheckout.disabled = false;
                btnCheckout.innerHTML = '<span class="material-symbols-outlined">lock</span> Proceder al Pago';
            }
        });
    }
});
