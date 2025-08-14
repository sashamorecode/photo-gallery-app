// src/lib/server/db.js

import Database from 'better-sqlite3';

const db = new Database('./mydb.sqlite', {});
// Adjust to the path of your SQLite file

// === Set up tables (run once, or use migrations in production) ===

db.exec(`
CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cover TEXT,
    title TEXT
);
CREATE TABLE IF NOT EXISTS story_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER,
    src TEXT,
    caption TEXT,
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT,
    coverImage TEXT,
    date TEXT,
    newsType TEXT,
    content TEXT
);
CREATE TABLE IF NOT EXISTS news_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    news_id INTEGER,
    src TEXT,
    alt TEXT,
    title TEXT,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT,
    title TEXT,
    description TEXT
);
CREATE TABLE IF NOT EXISTS print_sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    print_id INTEGER,
    size TEXT,
    price TEXT,
    FOREIGN KEY (print_id) REFERENCES prints(id) ON DELETE CASCADE
);
`);

// ---------- CRUD for STORIES ----------
export function createStory(story) {
    const stmt = db.prepare('INSERT INTO stories (cover, title) VALUES (?, ?)');
    const result = stmt.run(story.cover, story.title);
    const imagesStmt = db.prepare('INSERT INTO story_images (story_id, src, caption) VALUES (?, ?, ?)');
    for (const img of story.images) {
        imagesStmt.run(result.lastInsertRowid, img.src, img.caption);
    }
    return result.lastInsertRowid;
}
export function getStories() {
    const stories = db.prepare('SELECT * FROM stories').all();
    for (const story of stories) {
        story.images = db.prepare('SELECT src, caption FROM story_images WHERE story_id = ?').all(story.id);
    }
    return stories;
}
export function updateStory(id, story) {
    db.prepare('UPDATE stories SET cover=?, title=? WHERE id=?').run(story.cover, story.title, id);
    db.prepare('DELETE FROM story_images WHERE story_id=?').run(id);
    const imagesStmt = db.prepare('INSERT INTO story_images (story_id, src, caption) VALUES (?, ?, ?)');
    for (const img of story.images) {
        imagesStmt.run(id, img.src, img.caption);
    }
}
export function deleteStory(id) {
    db.prepare('DELETE FROM stories WHERE id=?').run(id);
}

// ---------- CRUD for NEWS ----------
export function createNews(news) {
    const stmt = db.prepare('INSERT INTO news (url, title, coverImage, date, newsType, content) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(news.url, news.title, news.coverImage, news.date, news.newsType, news.content);
    const imagesStmt = db.prepare('INSERT INTO news_images (news_id, src, alt, title) VALUES (?, ?, ?, ?)');
    for (const img of news.images) {
        imagesStmt.run(result.lastInsertRowid, img.src, img.alt, img.title);
    }
    console.log("created news")
    return result.lastInsertRowid;
}
export function getNews() {
    const allNews = db.prepare('SELECT * FROM news').all();
    for (const news of allNews) {
        news.images = db.prepare('SELECT src, alt, title FROM news_images WHERE news_id = ?').all(news.id);
    }
    return allNews;
}
export function updateNews(id, news) {
    db.prepare('UPDATE news SET url=?, title=?, coverImage=?, date=?, newsType=?, content=? WHERE id=?')
        .run(news.url, news.title, news.coverImage, news.date, news.newsType, news.content, id);
    db.prepare('DELETE FROM news_images WHERE news_id=?').run(id);
    const imagesStmt = db.prepare('INSERT INTO news_images (news_id, src, alt, title) VALUES (?, ?, ?, ?)');
    for (const img of news.images) {
        imagesStmt.run(id, img.src, img.alt, img.title);
    }
}
export function deleteNews(id) {
    db.prepare('DELETE FROM news WHERE id=?').run(id);
}

// ---------- CRUD for PRINTS ----------
export function createPrint(print) {
    const stmt = db.prepare('INSERT INTO prints (src, title, description) VALUES (?, ?, ?)');
    const result = stmt.run(print.src, print.title, print.description);
    const sizesStmt = db.prepare('INSERT INTO print_sizes (print_id, size, price) VALUES (?, ?, ?)');
    for (const size of print.sizes) {
        sizesStmt.run(result.lastInsertRowid, size.size, size.price);
    }
    return result.lastInsertRowid;
}
export function getPrints() {
    const prints = db.prepare('SELECT * FROM prints').all();
    for (const print of prints) {
        print.sizes = db.prepare('SELECT size, price FROM print_sizes WHERE print_id = ?').all(print.id);
    }
    return prints;
}
export function updatePrint(id, print) {
    db.prepare('UPDATE prints SET src=?, title=?, description=? WHERE id=?')
        .run(print.src, print.title, print.description, id);
    db.prepare('DELETE FROM print_sizes WHERE print_id=?').run(id);
    const sizesStmt = db.prepare('INSERT INTO print_sizes (print_id, size, price) VALUES (?, ?, ?)');
    for (const size of print.sizes) {
        sizesStmt.run(id, size.size, size.price);
    }
}
export function deletePrint(id) {
    db.prepare('DELETE FROM prints WHERE id=?').run(id);
}

