// Configuración de Supabase
const SUPABASE_URL = 'https://iczpycftggnxkhhcnbqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljenB5Y2Z0Z2dueGtoaGNuYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDAwODAsImV4cCI6MjA4Nzc3NjA4MH0.kpNcz-w-bwE2YG3e4vqRFFQC78aXfaZViz9pJ7WBxAA';

// Inicializar el cliente de Supabase (asumiendo que el script de Supabase de CDN está incluido en el HTML)
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Servidor Supabase configurado.");
