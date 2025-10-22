const hostUrl = "https://star-dust-png.github.io/";
const album = new URLSearchParams(window.location.search).get('album');

async function loadGallery(albumRepo) {
    const res = await fetch(hostUrl + albumRepo + '/index.json');

    const sidebar = document.getElementById('sidebar');
    const gallery = document.getElementById('gallery-container');

    if (!res.ok) {
        const section = document.createElement('section');
        section.id = `section-0`;

        const title = document.createElement('h2');
        title.textContent = `Failed to load album: ${res.status} ${res.statusText}`;
        section.appendChild(title);

        gallery.appendChild(section);

        return;
    }

    const folders = await res.json();

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

        files.forEach(({filename, previewPath, dateTaken}) => {
            const img = document.createElement('img');
            img.src = `photos/${previewPath}`;
            img.alt = filename;
            img.title = filename;
            img.dataset.dateTaken = dateTaken;
            img.dataset.fullsrc = `photos/${folder}/${filename}`;
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

    img.src = imgElement.dataset.fullsrc;
    name.textContent = imgElement.alt || '';
    download.href = imgElement.dataset.fullsrc;
    download.download = imgElement.alt || '';

    const dt = imgElement.dataset.dateTaken;
    date.textContent = dt ? formatDate(dt) : '';

    full.style.display = 'flex';

    document.getElementById("sidebar-toggle").style.display = 'none';
}

function hideFullscreen() {
    const full = document.getElementById('fullscreen');
    full.style.display = 'none';
    document.getElementById("sidebar-toggle").style.display = 'flex';
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

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');

toggleBtn.onclick = () => {
    sidebar.classList.add('open');
};

const closeBtn = document.createElement('div');
closeBtn.id = 'sidebar-close';
closeBtn.textContent = '×';
sidebar.appendChild(closeBtn);

closeBtn.onclick = () => {
    sidebar.classList.remove('open');
};

sidebar.addEventListener('click', e => {
    if (e.target.tagName === 'DIV' && e.target !== closeBtn) {
        const index = Array.from(sidebar.children).indexOf(e.target);
        const section = document.getElementById(`section-${index}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }

        if (window.matchMedia("(max-width: 600px)").matches) {
            sidebar.classList.remove('open');
        }
    }
});

loadGallery(album);