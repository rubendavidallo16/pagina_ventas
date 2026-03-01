// Estado del carrito usando LocalStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contador.textContent = totalItems;
    }
}

async function cargarCategorias() {
    const listaCategorias = document.getElementById('category-list');
    if (!listaCategorias) return;

    try {
        const { data: categorias, error } = await window.supabaseClient
            .from('tipo_producto')
            .select('*');

        if (error) throw error;

        // Limpiar el mock
        listaCategorias.innerHTML = '';

        // Botón para mostrar 'Todos los productos'
        const btnTodos = document.createElement('a');
        btnTodos.className = 'cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors category-btn';
        btnTodos.dataset.id = 'todos';
        btnTodos.innerHTML = `
            <span class="material-symbols-outlined text-[20px]">grid_view</span>
            <span class="text-sm font-semibold">Todas las Categorías</span>
        `;
        listaCategorias.appendChild(btnTodos);

        // Generar categorías desde Supabase
        categorias.forEach(cat => {
            const btn = document.createElement('a');
            // Usamos clases parecidas a las del diseño
            btn.className = 'cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors category-btn';
            btn.dataset.id = cat.id_tipo_producto;

            // Icono genérico o dejarlo según diseño
            btn.innerHTML = `
                <span class="material-symbols-outlined text-[20px]">category</span>
                <span class="text-sm">${cat.nombre}</span>
            `;
            listaCategorias.appendChild(btn);
        });

        // Event Listeners para filtrar
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Estilos de selección (activar botón)
                document.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');
                    b.classList.add('text-slate-600', 'dark:text-slate-400');
                });

                const currentBtn = e.currentTarget;
                currentBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
                currentBtn.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');

                const catId = currentBtn.dataset.id;
                cargarProductos(catId);
            });
        });

        // Seleccionar "Todos" por defecto
        btnTodos.classList.remove('text-slate-600', 'dark:text-slate-400');
        btnTodos.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');

    } catch (error) {
        console.error('Error cargando categorías:', error);
        listaCategorias.innerHTML = `<p class="text-xs text-red-500">Error: ${error.message || JSON.stringify(error)}</p>`;
    }
}

async function cargarProductos(categoriaId = 'todos') {
    const contenedor = document.getElementById('product-container');
    if (!contenedor) return;

    try {
        console.log('Intentando obtener datos de Supabase...');
        let query = window.supabaseClient.from('producto').select('*');

        // Si hay una categoría seleccionada y distinta de 'todos', filtramos
        if (categoriaId !== 'todos') {
            query = query.eq('id_tipo_producto', categoriaId);
        }

        const response = await query;

        console.log('Respuesta cruda de Supabase:', response);
        const { data: productos, error } = response;

        if (error) {
            console.error('Error reportado por Supabase:', error);
            throw error;
        }

        console.log('Productos obtenidos exitosamente:', productos);

        // Si no hay productos, mostrar un mensaje
        if (!productos || productos.length === 0) {
            contenedor.innerHTML = '<p class="text-slate-500 w-full col-span-full">No hay productos disponibles por el momento para esta categoría.</p>';
            return;
        }

        contenedor.innerHTML = '';

        productos.forEach(producto => {
            const div = document.createElement('div');
            div.className = 'group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300';

            // Ajustar los nombres de las columnas a lo que viene de la BD
            const nombre = producto.nombre || 'Producto sin nombre';
            const precio = producto.precio || 0;
            const descripcion = producto.descripcion || '';

            // Lógica para asignar las imágenes locales por defecto basadas en el nombre
            const nombreMin = nombre.toLowerCase();
            let imagenLocal = 'assets/imágenes/laptop_lenovo.webp'; // Imagen genérica

            if (nombreMin.includes('celular') || nombreMin.includes('smartphone')) {
                imagenLocal = 'assets/imágenes/celular_samsung.webp';
            } else if (nombreMin.includes('laptop') || nombreMin.includes('computadora')) {
                imagenLocal = 'assets/imágenes/laptop_lenovo.webp';
            } else if (nombreMin.includes('licuadora') || nombreMin.includes('electrodoméstico')) {
                imagenLocal = 'assets/imágenes/lucuadora_oster.webp'; // nota: respetando el nombre real del archivo
            } else if (nombreMin.includes('polo') || nombreMin.includes('camiseta') || nombreMin.includes('ropa')) {
                imagenLocal = 'assets/imágenes/polo_hombre.webp';
            } else if (nombreMin.includes('balón') || nombreMin.includes('pelota') || nombreMin.includes('fútbol')) {
                imagenLocal = 'assets/imágenes/balon_adidas.avif';
            }

            const imagenUrl = producto.imagen_url || imagenLocal;

            div.innerHTML = `
                <div class="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div class="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110" style="background-image: url('${imagenUrl}')"></div>
                </div>
                <div class="p-5 flex flex-col flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-bold group-hover:text-primary transition-colors">${nombre}</h3>
                        <span class="text-lg font-black text-slate-900 dark:text-white">$${precio.toFixed(2)}</span>
                    </div>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">${descripcion}</p>
                    <button class="add-to-cart-btn mt-auto w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold hover:bg-primary transition-colors" data-id="${producto.id_producto}">
                        <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                        Agregar al carrito
                    </button>
                </div>
            `;
            contenedor.appendChild(div);
        });

        // Event Listeners para los botones de "Agregar al carrito"
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const producto = productos.find(p => p.id_producto == id);
                if (producto) agregarAlCarrito(producto);
            });
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedor.innerHTML = `<p class="text-red-500 bg-red-50 p-4 rounded-lg col-span-full border border-red-200">
            <strong>Error cargando productos:</strong> ${error.message || error.details || JSON.stringify(error)}
            <br><span class="text-sm mt-2 block text-red-400">Verifica que las tablas 'producto' exista, tenga permisos públicos (RLS) y las columnas sean las correctas.</span>
        </p>`;
    }
}

function agregarAlCarrito(producto) {
    const itemExistente = carrito.find(item => item.id === producto.id_producto);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        const nombre = producto.nombre || producto.title || 'Producto';
        const precio = producto.precio || producto.price || 0;

        // La misma lógica de asignación local para el carrito
        const nombreMin = nombre.toLowerCase();
        let imagenLocal = 'assets/imágenes/laptop_lenovo.webp';

        if (nombreMin.includes('celular') || nombreMin.includes('smartphone')) {
            imagenLocal = 'assets/imágenes/celular_samsung.webp';
        } else if (nombreMin.includes('laptop') || nombreMin.includes('computadora')) {
            imagenLocal = 'assets/imágenes/laptop_lenovo.webp';
        } else if (nombreMin.includes('licuadora') || nombreMin.includes('electrodoméstico')) {
            imagenLocal = 'assets/imágenes/lucuadora_oster.webp';
        } else if (nombreMin.includes('polo') || nombreMin.includes('camiseta') || nombreMin.includes('ropa')) {
            imagenLocal = 'assets/imágenes/polo_hombre.webp';
        } else if (nombreMin.includes('balón') || nombreMin.includes('pelota') || nombreMin.includes('fútbol')) {
            imagenLocal = 'assets/imágenes/balon_adidas.avif';
        }

        const imagenUrl = producto.imagen_url || producto.image_url || imagenLocal;

        carrito.push({
            id: producto.id,
            nombre: nombre,
            precio: precio,
            imagenUrl: imagenUrl,
            cantidad: 1
        });
    }

    // Guardar en LocalStorage y actualizar contador
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    // Opcional: Mostrar una notificación pequeña (toast)
    alert(`¡${producto.nombre || producto.title || 'Producto'} agregado al carrito!`);
}

// Inicializar la página de inicio
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    cargarCategorias(); // Carga el sidebar de categorías
    cargarProductos();  // Carga todos los productos al inicio
});
