process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async() => {
    let res = await db.query(
        `INSERT INTO books 
        (isbn, amazon_url, author, language,pages, publisher, title, year) 
        VALUES ('123432122', 
        'https://amazon.com/taco', 
        'Elie', 
        'English', 
        100, 
        'Nothing publishers', 
        'my first book', 
        2008) 
        RETURNING isbn`
    );
    book_isbn = res.rows[0].isbn
});

describe("POST /books", () => {
    test("adds new book", async () => {
        const res = await request(app).post(`/books`).send({
            isbn: '32794782',
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "amazing times",
            year: 2000
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
        
    });
});

describe("PUT /books/:isbn", () => {
    test("updates ONE book", async () => {
        
    });
});

describe("DELETE /books/:isbn", () => {
    test("deletes ONE book", async () => {
        
    });
});

afterEach(async() => {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async() => {
    await db.end();
});