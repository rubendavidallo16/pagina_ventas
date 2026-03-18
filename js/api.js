// Configuración de Supabase
const SUPABASE_URL = 'https://iczpycftggnxkhhcnbqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljenB5Y2Z0Z2dueGtoaGNuYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDAwODAsImV4cCI6MjA4Nzc3NjA4MH0.kpNcz-w-bwE2YG3e4vqRFFQC78aXfaZViz9pJ7WBxAA';

// Inicializar el cliente de Supabase (asumiendo que el script de Supabase de CDN está incluido en el HTML)
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Servidor Supabase configurado.");

// Función global para mostrar Toast Notifications
window.mostrarToast = function (mensaje, tipo = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        // fixed bottom-6 right-6 asegura que esté en la esquina inferior derecha
        toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgClass = tipo === 'success' ? 'bg-slate-900 dark:bg-slate-800' : 'bg-red-500';

    toast.className = `${bgClass} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transform translate-y-12 opacity-0 transition-all duration-300 pointer-events-auto border border-slate-700`;

    const iconName = tipo === 'success' ? 'check_circle' : 'error';

    toast.innerHTML = `
        <span class="material-symbols-outlined text-primary">${iconName}</span>
        <span class="font-medium text-sm sm:text-base">${mensaje}</span>
    `;

    toastContainer.appendChild(toast);

    // Animar entrada hacia arriba
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-12', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-12', 'opacity-0');
        setTimeout(() => toast.remove(), 300); // Dar tiempo a la animación de salida
    }, 3000);
}
