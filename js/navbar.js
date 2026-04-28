document.addEventListener('DOMContentLoaded', () => {
    // Buscamos el input por su clase o ID
    const searchInput = document.querySelector('.search-container input');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                
                if (query.length > 0) {
                    // Redirigir siempre a la página de resultados con el parámetro 'q'
                    window.location.href = `results.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});
