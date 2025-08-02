async function loadGallery() {
    const res = await fetch('index.json');
    const folders = await res.json();

    const sidebar = document.getElementById('sidebar');
    const gallery = document.getElementById('gallery-container');

    sidebar.innerHTML = '';
    gallery.innerHTML = '';

    folders.forEach(({folder, files}, index) => {
        const link = document.createElement('div');
        link.textContent = folder;
        link.onclick = () => {
            const section = document.getElementById(`section-${index}`);
            if (section) section.scrollIntoView({behavior: 'smooth'});
        };
        sidebar.appendChild(link);

        const section = document.createElement('section');
        section.id = `section-${index}`;

        const title = document.createElement('h2');
        title.textContent = folder;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'photo-grid';

        files.forEach(({filename, dateTaken}) => {
            const img = document.createElement('img');
            img.src = `photos/${folder}/${filename}`;
            img.alt = filename;
            img.title = filename;
            img.dataset.dateTaken = dateTaken;
            img.onclick = () => showFullscreen(img);
            grid.appendChild(img);
        });

        section.appendChild(grid);
        gallery.appendChild(section);
    });
}

function showFullscreen(imgElement) {
    const full = document.getElementById('fullscreen');
    const img = document.getElementById('fullscreen-img');
    const name = document.getElementById('photo-name');
    const date = document.getElementById('photo-date');
    const download = document.getElementById('download-btn');

    img.src = imgElement.src;
    name.textContent = imgElement.alt || '';
    download.href = imgElement.src;
    download.download = imgElement.alt || '';

    const dt = imgElement.dataset.dateTaken;
    date.textContent = dt ? formatDate(dt) : '';

    full.style.display = 'flex';
}

function hideFullscreen() {
    const full = document.getElementById('fullscreen');
    full.style.display = 'none';
}

document.getElementById('fullscreen-close').onclick = hideFullscreen;
document.getElementById('fullscreen').onclick = e => {
    if(e.target.id === 'fullscreen') hideFullscreen();
};

function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return null;

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();

    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

loadGallery()