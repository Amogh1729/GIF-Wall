document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.gallery-container');

    fetch('/api/gifs')
        .then(response => response.json())
        .then(gifs => {
            if (gifs.length === 0) {
                container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No GIFs found in "Resource" folder.</p>';
                return;
            }

            gifs.forEach(filename => {
                const card = document.createElement('div');
                card.className = 'gif-card';

                const img = document.createElement('img');
                // Ensure proper encoding for filenames with spaces
                img.src = `Resource/${encodeURIComponent(filename)}`;
                img.alt = filename;
                img.loading = 'lazy'; // Lazy load for performance

                card.appendChild(img);

                // Lightbox Click Event
                card.addEventListener('click', () => {
                    const lightbox = document.getElementById('lightbox');
                    const lightboxImg = document.getElementById('lightbox-img');
                    lightbox.style.display = 'flex';
                    lightboxImg.src = img.src;
                });

                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Error loading GIFs:', err);
            container.innerHTML = '<p style="text-align:center; color:red;">Error loading GIFs. Is the server running?</p>';
        });

    // Layout Toggle Logic
    const toggleBtn = document.getElementById('layoutToggle');
    toggleBtn.addEventListener('click', () => {
        container.classList.toggle('fixed-mode');

        if (container.classList.contains('fixed-mode')) {
            toggleBtn.textContent = 'Switch to Original Size';
        } else {
            toggleBtn.textContent = 'Switch to Fixed Size';
        }
    });

    // Lightbox Close Logic
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-btn');

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
});
