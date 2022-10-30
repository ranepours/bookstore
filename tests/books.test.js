process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async() => {
    let res = await db.query(
        `INSERT INTO books 
        (isbn, amazon_url, author, language, pages, publisher, title, year) 
        VALUES ('95792046', 
        'https://before.com', 
        'Setup Author', 
        'Setup Language', 
        70, 
        'Setup Pub', 
        'Set Up', 
        2022) 
        RETURNING isbn`
    );
    book_isbn = res.rows[0].isbn
});

describe("POST /books", () => {
    test("adds new book", async () => {
        const res = await request(app).post(`/books`).send({
            isbn: '773295',
            amazon_url: "https://tester.com",
            author: "test author",
            language: "test language",
            pages: 70,
            publisher: "test pub",
            title: "test",
            year: 2022
        });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.book).toHaveProperty("isbn");
    });
    test("tests against empty fields", async() => {
        const res = await (await request(app).post(`/books`)).send({year: 2000});
        expect(res.statusCode).toBe(400);
    })
});

describe("GET /books", () => {
    test("gets book via query", async () => {
        const res = await request(app).get(`/books`);
        const books = res.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
    });
});

describe("GET /books/:isbn", () => {
    test("updates ONE book", async () => {
        const res = await request(app).get(`/books/${book_isbn}`);
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.isbn).toHaveProperty(book_isbn);
    });
    test("404 if book not found", async () => {
        const res = await request(app).get(`/books/10000000`);
        expect(res.statusCode).toBe(404);
    })
});

describe("PUT /books/:isbn", () => {
    test("Updates a single book", async() => {
        const res = await request(app).put(`/books/${book_isbn}`).send({
            isbn: '773295',
            amazon_url: "https://tester.com",
            author: "test author",
            language: "test language",
            pages: 70,
            publisher: "test pub",
            title: "test",
            year: 2022
        });
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.title).toBe("UPDATED BOOK");
    });
    
    test("Prevents a bad book update", async() => {
        const res = await request(app).put(`/books/${book_isbn}`).send({
            isbn: '773295',
            amazon_url: "https://tester.com",
            author: "test author",
            language: "test language",
            pages: 70,
            publisher: "test pub",
            title: "test",
            year: 2022
        });
        expect(res.statusCode).toBe(400);
    });
    
    test("Responds 404 if can't find book in question", async() => {
        await request(app).delete(`/books/${book_isbn}`); //removes book so we can actually get the 404
        const res = await request(app).delete(`/books/${book_isbn}`);
        expect(res.statusCode).toBe(404);
      });
});

describe("DELETE /books/:isbn", () => {
    test("deletes ONE book", async () => {
        const res = await request(app).delete(`/books/${book_isbn}`);
        expect(res.body).toEqual({message: "Book deleted"});
    });
});

afterEach(async() => {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async() => {
    await db.end();
});