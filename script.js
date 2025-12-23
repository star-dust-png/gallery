const hostUrl = "https://stardustpng-albums.github.io/";
const album = new URLSearchParams(window.location.search).get('album');
const sectionParam = new URLSearchParams(window.location.search).get('section');

let currentImageIndex = -1;
let allImages = [];

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

    folders.forEach(({ folder, files }, index) => {
        const link = document.createElement('div');
        link.textContent = folder;
        link.onclick = () => {
            const section = document.getElementById(`section-${index}`);
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        };
        sidebar.appendChild(link);

        const section = document.createElement('section');
        section.id = `section-${index}`;
        section.classList.add(normalizeDateClass(folder));

        const title = document.createElement('h2');
        title.textContent = folder;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'photo-grid';

        files.forEach(({ filename, previewPath, dateTaken }) => {
            const img = document.createElement('img');
            img.src = hostUrl + album + `/photos/${previewPath}`;
            img.alt = filename;
            img.title = filename;
            img.dataset.dateTaken = dateTaken;
            img.dataset.previewSrc = hostUrl + album + `/photos/${previewPath}`;
            img.dataset.fullsrc = hostUrl + album + `/photos/${folder}/${filename}`;
            img.onclick = () => showFullscreen(img);
            grid.appendChild(img);
            allImages.push(img); // Store for navigation
        });

        section.appendChild(grid);
        gallery.appendChild(section);
    });

    if (sectionParam) {
        let section = document.querySelector(`.${normalizeDateClass(sectionParam)}`);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showFullscreen(imgElement) {
    const full = document.getElementById('fullscreen');
    const img = document.getElementById('fullscreen-img');
    const name = document.getElementById('photo-name');
    const date = document.getElementById('photo-date');
    const download = document.getElementById('download-btn');

    currentImageIndex = allImages.indexOf(imgElement);

    img.src = imgElement.dataset.previewSrc;
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
    if (e.target.id === 'fullscreen') hideFullscreen();
};

document.addEventListener('keydown', e => {
    if (document.getElementById('fullscreen').style.display !== 'flex') return;
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'Escape') hideFullscreen();
});

let touchStartX = 0;
let touchEndX = 0;

document.getElementById('fullscreen').addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.getElementById('fullscreen').addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) showNextImage();
    else showPrevImage();
}

const full = document.getElementById('fullscreen');
const leftArrow = document.createElement('div');
leftArrow.id = 'arrow-left';
leftArrow.classList.add('arrow');
leftArrow.textContent = '❮';
const rightArrow = document.createElement('div');
rightArrow.id = 'arrow-right';
rightArrow.classList.add('arrow');
rightArrow.textContent = '❯';

[leftArrow, rightArrow].forEach(el => {
    el.style.position = 'absolute';
    el.style.top = '50%';
    el.style.transform = 'translateY(-50%)';
    el.style.fontSize = '3rem';
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.style.padding = '0 10px';
    el.style.zIndex = '10';
});
leftArrow.style.left = '10px';
rightArrow.style.right = '10px';

full.appendChild(leftArrow);
full.appendChild(rightArrow);

leftArrow.onclick = showPrevImage;
rightArrow.onclick = showNextImage;

function showNextImage() {
    if (currentImageIndex < allImages.length - 1) {
        showFullscreen(allImages[currentImageIndex + 1]);
    }
}

function showPrevImage() {
    if (currentImageIndex > 0) {
        showFullscreen(allImages[currentImageIndex - 1]);
    }
}

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

function normalizeDateClass(str) {
    return "d_" + str
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^A-Za-z0-9_]/g, "");
}

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');

toggleBtn.onclick = () => sidebar.classList.add('open');

const closeBtn = document.createElement('div');
closeBtn.id = 'sidebar-close';
closeBtn.textContent = '×';
sidebar.appendChild(closeBtn);

closeBtn.onclick = () => sidebar.classList.remove('open');

sidebar.addEventListener('click', e => {
    if (e.target.tagName === 'DIV' && e.target !== closeBtn) {
        const index = Array.from(sidebar.children).indexOf(e.target);
        const section = document.getElementById(`section-${index}`);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        if (window.matchMedia("(max-width: 600px)").matches)
            sidebar.classList.remove('open');
    }
});

loadGallery(album);