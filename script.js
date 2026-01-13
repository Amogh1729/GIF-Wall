document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.gallery-container');
    let refreshInterval;

    // Load Logic
    const loadGallery = () => {
        // Try fetching static list first (GitHub Pages), then dynamic API (Local Node Server)
        fetch('gifs.json')
            .then(response => {
                const contentType = response.headers.get("content-type");
                if (!response.ok || (contentType && contentType.indexOf("application/json") === -1)) {
                    throw new Error('Static list not found');
                }
                return response.json();
            })
            .catch(() => fetch('/api/gifs').then(res => res.json()))
            .then(gifs => {
                // Clear existing content to refresh (only if not dragging - simplistic check)
                // In a perfect app, we would diff the list. 
                // For now, we only refresh if we aren't currently dragging an item (which clears interval).
                container.innerHTML = '';

                if (gifs.length === 0) {
                    container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No GIFs found in "Resource" folder.</p>';
                } else {
                    gifs.forEach(filename => {
                        const card = document.createElement('div');
                        card.className = 'gif-card';
                        // Use filename as ID for sorting persistence
                        card.setAttribute('data-id', filename);

                        const img = document.createElement('img');
                        img.src = `Resource/${encodeURIComponent(filename)}`;
                        img.alt = filename;
                        img.loading = 'lazy';

                        card.appendChild(img);

                        card.addEventListener('click', () => {
                            const lightbox = document.getElementById('lightbox');
                            const lightboxImg = document.getElementById('lightbox-img');
                            lightbox.style.display = 'flex';
                            lightboxImg.src = img.src;
                        });

                        container.appendChild(card);
                    });
                }

                // Hide Loading Screen
                const loadingOverlay = document.getElementById('loading');
                if (loadingOverlay) {
                    loadingOverlay.classList.add('hidden');
                }
            })
            .catch(err => {
                console.error('Error loading GIFs:', err);
                const loadingOverlay = document.getElementById('loading');

                if (container.children.length === 0) {
                    container.innerHTML = '<p style="text-align:center; color:red;">Error loading GIFs. Is the server running?</p>';
                    if (loadingOverlay) loadingOverlay.classList.add('hidden');
                }
            });
    };

    // Initial Load
    loadGallery();

    // Auto-Refresh every 30 seconds
    refreshInterval = setInterval(loadGallery, 30000);

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

    // Upload Logic
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('files', fileInput.files[i]);
            }

            // Show loading during upload
            const loadingOverlay = document.getElementById('loading');
            if (loadingOverlay) loadingOverlay.classList.remove('hidden');
            document.querySelector('#loading p').textContent = "Uploading...";

            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Upload success:', data);
                    loadGallery(); // Refresh to show new files
                    document.querySelector('#loading p').textContent = "Loading Collection...";
                })
                .catch(error => {
                    console.error('Error uploading:', error);
                    alert('Upload failed!');
                    if (loadingOverlay) loadingOverlay.classList.add('hidden');
                });
        }
    });

    // SortableJS Logic
    if (typeof Sortable !== 'undefined') {
        new Sortable(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onStart: () => {
                clearInterval(refreshInterval);
            },
            onEnd: () => {
                refreshInterval = setInterval(loadGallery, 30000);

                // Get new order
                const newOrder = Array.from(container.querySelectorAll('.gif-card')).map(card => card.getAttribute('data-id'));

                // Save order to server
                fetch('/api/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: newOrder })
                }).catch(err => console.error('Failed to save order', err));
            }
        });
    }

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
