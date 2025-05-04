const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=upsc+exam&hl=en-IN&gl=IN&ceid=IN:en');
const proxyUrl = `https://api.allorigins.win/raw?url=${rssUrl}`;
const newsContainer = document.getElementById('news-container');
let newsArticles = [];

const toggleBtn = document.getElementById('toggle-mode');

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
});

toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem("theme", newTheme);
});

const searchInput = document.getElementById('search-bar');
const list = document.getElementById('resources-list');
const container = document.getElementById('websites-container');
const strategiesList = document.getElementById('strategies-list');

let allResources = [];
let resourcesData = {};
let websitesData = {};
let strategiesData = [];

window.onload = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    // Load quote
    fetch('../data/motivational_quotes.json')
        .then(res => res.json())
        .then(data => {
            document.getElementById('quote').innerText =
                data[Math.floor(Math.random() * data.length)].quote;
        });

    // Fetch & render resources
    fetch('../data/resources.json')
        .then(res => res.json())
        .then(data => {
            resourcesData = data;
            renderResources(data);
        });

    // Fetch & render websites
    fetch('../data/websites.json')
        .then(res => res.json())
        .then(data => {
            websitesData = data;
            renderWebsites(data);
        });

    // Fetch & render strategies
    fetch('../data/toppers.json')
        .then(res => res.json())
        .then(data => {
            strategiesData = data;
            renderStrategies(data);
        });

    fetch(proxyUrl)
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.text();
        })
        .then(str => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(str, "text/xml");
            const items = xml.querySelectorAll("item");

            // Build the array
            newsArticles = Array.from(items).map(item => ({
                title: item.querySelector("title").textContent,
                description: item.querySelector("description").textContent,
                link: item.querySelector("link").textContent,
                pubDate: item.querySelector("pubDate").textContent
            }));

            // Render initial list
            renderNews(newsArticles);
        })
        .catch(err => {
            console.error("Failed to load news via proxy:", err);
            newsContainer.innerHTML = '<div class="list-group-item text-danger">Error loading articles.</div>';
        });
};

// Your existing renderNews fn:
function renderNews(items) {
    newsContainer.innerHTML = '';
    if (items.length === 0) {
        newsContainer.innerHTML = '<div class="list-group-item text-muted">No articles found.</div>';
        return;
    }
    items.forEach(article => {
        const a = document.createElement("a");
        a.className = "list-group-item list-group-item-action";
        a.href = article.link;
        a.target = "_blank";
        a.innerHTML = `
<h5 class="mb-1">${article.title}</h5>
<p class="mb-1">${article.description}</p>
<small>${article.pubDate}</small>
`;
        newsContainer.appendChild(a);
    });
}


function renderResources(data) {
    list.innerHTML = '';
    Object.entries(data).forEach(([category, resources]) => {
        const h5 = document.createElement('h5');
        h5.textContent = category;
        h5.className = 'mt-4';
        list.appendChild(h5);

        resources.forEach(r => {
            allResources.push({ ...r, category, type: 'resource' });
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<strong>${r.title}</strong>: 
    <a class="open-link" href="${r.link}" data-url="${r.link}" target="_blank">${r.link}</a>`;
            list.appendChild(li);
        });
    });
}

function renderWebsites(data) {
    container.innerHTML = '';
    Object.entries(data).forEach(([category, sites]) => {
        const h5 = document.createElement('h5');
        h5.textContent = category;
        h5.className = 'mt-4';
        container.appendChild(h5);

        const ul = document.createElement('ul');
        ul.className = 'list-group mb-3';

        sites.forEach(site => {
            allResources.push({ name: site.name, title: site.name, link: site.link, category, type: 'website' });
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<strong>${site.name}</strong>: 
    <a class="open-link" href="${site.link}" data-url="${site.link}" target="_blank">${site.link}</a>
    <br/><small>${site.description}</small>`;
            ul.appendChild(li);
        });

        container.appendChild(ul);
    });
}

function renderStrategies(data) {
    strategiesList.innerHTML = '';
    data.forEach(t => {
        allResources.push({
            title: `${t.name} ${t.year}`,
            link: t.tip,
            category: 'Topper Strategies',
            type: 'strategy'
        });
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `<strong>${t.name}</strong> (${t.year}): <em>${t.tip}</em>`;
        strategiesList.appendChild(li);
    });
}

searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();

    // Clear all sections
    list.innerHTML = '';
    container.innerHTML = '';
    strategiesList.innerHTML = '';
    newsContainer.innerHTML = '';

    // If search is empty, re-render everything
    if (!term) {
        renderResources(resourcesData);
        renderWebsites(websitesData);
        renderStrategies(strategiesData);
        renderNews(newsArticles);
        return;
    }

    // 1) Filter resources/websites/strategies
    const filteredResources = allResources.filter(r =>
        r.title.toLowerCase().includes(term) ||
        (r.category && r.category.toLowerCase().includes(term))
    );

    // 2) Filter news articles
    const filteredNews = newsArticles.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term)
    );

    // 3) Filter and group items
    const byType = { resource: [], website: [], strategy: [], article: [] };
    filteredResources.forEach(item => byType[item.type].push(item));

    // Display filtered resources, websites, strategies, and articles if there are any matching items
    if (byType.resource.length) {
        displayItems(byType.resource, list, 'Resources');
    }

    if (byType.website.length) {
        displayItems(byType.website, container, 'Websites');
    }

    if (byType.strategy.length) {
        displayItems(byType.strategy, strategiesList, 'Strategies');
    }


    if (filteredNews.length) {
        renderNews(filteredNews); // Only render news if there are matching articles
    }
});


function displayItems(items, container, heading) {
    // 1) Check if the heading already exists, and create it only if it doesn't
    let h5 = container.querySelector('h5');
    if (!h5) {
        h5 = document.createElement('h5');
        h5.className = 'mt-4';
        h5.textContent = `${heading} Results`;
        container.appendChild(h5);
    }

    // 2) Check if the list already exists, and create it only if it doesn't
    let ul = container.querySelector('ul');
    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'list-group mb-3';
        container.appendChild(ul);
    } else {
        // If the list exists, clear it to avoid duplication
        ul.innerHTML = '';
    }

    // 3) Avoid appending duplicate items (based on title or unique content)
    const addedItems = new Set(); // Set to track already added items

    items.forEach(item => {
        // If the item is already added (based on title or unique value), skip it
        if (addedItems.has(item.title)) {
            return; // Skip duplicate
        }

        addedItems.add(item.title); // Mark as added

        const li = document.createElement('li');
        li.className = 'list-group-item';

        if (item.type === 'strategy') {
            li.innerHTML = `<strong>${item.title}</strong>: <em>${item.link}</em>`;
        } else {
            // strategies and articles both render link
            li.innerHTML = `<strong>${item.title}</strong>:
                <a class="open-link" href="${item.link}" data-url="${item.link}" target="_blank">
                    ${item.link}
                </a>`;
        }
        ul.appendChild(li);
    });
}



const secretDiv = document.getElementById('secret-msg');

function revealSecret() {
    fetch('../data/secret_messages.json')
        .then(res => res.json())
        .then(data => {
            const random = data[Math.floor(Math.random() * data.length)];
            secretDiv.innerText = random;
            secretDiv.style.display = 'block';
        })
        .catch(err => console.error("Failed to load secret messages:", err));
}

const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');
const STORAGE_KEY = 'upsc_tasks';
const DATE_KEY = 'upsc_tasks_date';
const STREAK_KEY = 'upsc_streak';
const LAST_COMPLETED_DATE_KEY = 'upsc_last_completed';

let streak = parseInt(localStorage.getItem(STREAK_KEY)) || 0;
let motivationalImages = {};
let tasks = [];

const fixedTasks = [
    "Read the Newspaper (Current Affairs)",
    "Revise Polity (Laxmikanth)",
    "Practice GS Paper I MCQs",
    "Write 250-word Essay",
    "Read Economy Chapter",
    "Solve CSAT Questions"
];

// Load images JSON
function loadMotivationalImages() {
    return fetch('../data/motivational_images.json')
        .then(res => res.json())
        .then(data => motivationalImages = data)
        .catch(err => console.error("Failed to load motivational images:", err));
}

function getRandomImage(category) {
    const imgs = motivationalImages[category];
    return imgs ? imgs[Math.floor(Math.random() * imgs.length)] : '';
}

function updateStreakDisplay(count) {
    const badgeIds = ['streak-badge', 'streak-badge1', 'streak-badge2'];
    const gif = document.getElementById('streak-gif');

    let badgeText = `🔥 Streak: ${count} Day${count !== 1 ? 's' : ''}`;
    let gifUrl = '';
    let suffix = '';

    if (count >= 30) {
        suffix = ' 🏆 Legend!';
        gifUrl = getRandomImage('30');
    } else if (count >= 14) {
        suffix = ' 🌻 Warrior!';
        gifUrl = getRandomImage('14');
    } else if (count >= 7) {
        suffix = ' 🌈 Keep Going!';
        gifUrl = getRandomImage('7');
    } else {
        gifUrl = getRandomImage('default');
    }

    badgeText += suffix;

    // Update all badges
    badgeIds.forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            badge.innerText = badgeText;
            badge.classList.remove('bg-success');
            badge.classList.add('bg-warning');
        }
    });

    // Handle GIF
    if (gifUrl) {
        gif.src = gifUrl;
        gif.style.display = 'block';
    } else {
        gif.style.display = 'none';
        gif.src = '';
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex align-items-center ${task.done ? 'completed' : ''}`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'me-2';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', () => {
            tasks[index].done = checkbox.checked;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            if (checkbox.checked) confetti({ particleCount: 80, spread: 60 });
            renderTasks();
            updateProgress();
            checkCompletion();
        });
        li.appendChild(checkbox);
        li.append(task.text);
        taskList.appendChild(li);
    });
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const percentage = Math.round((completed / total) * 100);
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.innerText = percentage + '%';
}



function launchConfetti() {
    const duration = 5000;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 2000 };

    const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti(Object.assign({}, defaults, {
            particleCount: 60,
            origin: { x: Math.random(), y: Math.random() - 0.2 }
        }));
    }, 250);
}

function launchSchoolPride() {
    confetti({
        particleCount: 150,
        angle: 60,
        spread: 120,
        origin: { x: 0 },
        emojis: ['🎓', '📚', '🏆', '💖'],
    });
    confetti({
        particleCount: 150,
        angle: 120,
        spread: 120,
        origin: { x: 1 },
        emojis: ['🎓', '📚', '🏆', '💖'],
    });
}

function checkCompletion() {
    const allDone = tasks.every(t => t.done);
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem(LAST_COMPLETED_DATE_KEY);
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (allDone) {
        document.getElementById('celebration-section').style.display = 'block';
        launchConfetti();
        launchSchoolPride();

        if (lastCompleted === yesterday) {
            streak += 1;
        } else if (lastCompleted !== today) {
            streak = 1;
        }

        localStorage.setItem(STREAK_KEY, streak);
        localStorage.setItem(LAST_COMPLETED_DATE_KEY, today);
        updateStreakDisplay(streak);
    }
}

function generateNewTasks(data) {
    const randomExtras = data.sort(() => 0.5 - Math.random()).slice(0, 4);
    tasks = [...fixedTasks, ...randomExtras].map(text => ({ text, done: false }));
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(DATE_KEY, today);
}

function resetTasks() {
    fetch('../data/study_tasks.json')
        .then(res => res.json())
        .then(data => {
            generateNewTasks(data);
            renderTasks();
            updateProgress();
            document.getElementById('celebration-section').style.display = 'none';
            secretDiv.style.display = 'none';
        });
}

function completeDay() {
    streak += 1;
    localStorage.setItem(STREAK_KEY, streak);
    updateStreakDisplay(streak);

    if ([7, 14, 30].includes(streak)) {
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            emojis: ['🎉', '🎓', '📚', '💐']
        });
    }
}

// Load all data
Promise.all([
    fetch('../data/study_tasks.json').then(res => res.json()),
    fetch('../data/quotes.json').then(res => res.json()),
    loadMotivationalImages()
]).then(([taskData, quoteData]) => {
    const today = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem(DATE_KEY);
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (storedTasks?.length && storedDate === today) {
        tasks = storedTasks;
    } else {
        generateNewTasks(taskData);
    }

    renderTasks();
    updateProgress();
    checkCompletion();
    updateStreakDisplay(streak);

    // Load quote
    const quote = quoteData[Math.floor(Math.random() * quoteData.length)];
    const quoteElement = document.getElementById('daily-quote');
    quoteElement.innerText = `"${quote}"`;
    quoteElement.style.opacity = 1;
}).catch(err => console.error("Error initializing dashboard:", err));
;

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('bookmark-form');
    const labelInput = document.getElementById('bookmark-label');
    const urlInput = document.getElementById('bookmark-url');
    const list = document.getElementById('bookmark-list');

    function loadBookmarks() {
        list.innerHTML = '';
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

        const grouped = bookmarks.reduce((acc, bm) => {
            acc[bm.tag] = acc[bm.tag] || [];
            acc[bm.tag].push(bm);
            return acc;
        }, {});

        Object.keys(grouped).forEach(tag => {
            const tagHeader = document.createElement('li');
            tagHeader.className = 'list-group-item bg-light fw-bold text-dark';
            tagHeader.innerText = tag;
            list.appendChild(tagHeader);

            grouped[tag].forEach((bookmark, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center ';
                li.innerHTML = `
<div class="d-flex align-items-center">
  <img src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32" class="me-2" width="16" height="16">
  <a href="${bookmark.url}" target="_blank">${bookmark.label}</a>
</div>
<button class="btn btn-close bg-danger p-2" data-index="${index}"></button>
`;
                list.appendChild(li);
            });
        });
    }

    list.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.getAttribute('data-index');
            let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            bookmarks.splice(index, 1);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            loadBookmarks();
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const label = labelInput.value.trim();
        const url = urlInput.value.trim();
        if (!label || !url) return;
        const tagInput = document.getElementById('bookmark-tag');
        // ...
        const tag = tagInput.value.trim() || 'General';
        const newBookmark = { label, url, tag };
        // ...
        tagInput.value = '';

        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        bookmarks.push(newBookmark);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

        labelInput.value = '';
        urlInput.value = '';
        loadBookmarks();
    });

    loadBookmarks();
});

window.addEventListener('load', function () {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    // Fade out loading screen
    loadingScreen.style.transition = 'opacity 6s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      mainContent.style.display = 'block';
    }, 6000);
  });

  document.body.addEventListener('click', (e) => {
    // Prevent hearts when clicking interactive elements
    if (e.target.closest('button, a, input, textarea, select, label')) return;

    const count = 8; // Number of hearts
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-particle';
      heart.textContent = '♥';

      const offsetX = (Math.random() - 0.5) * 40;  // ±20px
      const offsetY = (Math.random() - 0.5) * 40;

      heart.style.position = 'fixed';
      heart.style.left = `${e.clientX + offsetX}px`;
      heart.style.top = `${e.clientY + offsetY}px`;
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = 9999;

      document.body.appendChild(heart);

      heart.addEventListener('animationend', () => heart.remove());
    }
  });