import request from "supertest";
import { expect } from "chai";
import app from "../../index";
import httpStatus from "http-status-codes";

describe("Routes", () => {
    let server: any;

    before(async (done) => {
        server = app.listen(3000, () => `Server Listen at 3000`)
        done();
    });

    after(() => {
        server.close();
    });

    // Register User Test
    it("should register a new user", async () => {
        const response = await request(app)
            .post("/api/v1/users/register")
            .send({
                name: "testuser",
                email: "testuser@example.com",
                password: "testpassword123",
            });
        expect(response.status).to.equal(httpStatus.CREATED);
        expect(response.body).to.have.property("message").that.includes("User registered successfully");
    });

    let accessToken: string;
    let refreshToken: string;

    // Login User Test
    it("should login a user", async () => {
        const response = await request(app)
            .post("/api/v1/users/login")
            .send({
                email: "testuser@example.com",
                password: "testpassword123",
            });
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
        expect(response.body.status).to.equal(httpStatus.OK);
        expect(response.body).to.have.property("accessToken");
        expect(response.body).to.have.property("refreshToken");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message");
    });
    
    // Refresh Token Test
    it("should refresh user token", async () => {
        const response = await request(app)
            .get("/api/v1/users/refresh-token")
            .set("x-token", `Bearer ${refreshToken}`)
            .send({
                email: "testuser@example.com"
            });

        expect(response.status).to.equal(httpStatus.CREATED);
        expect(response.body).to.have.property("token");
        expect(response.body).to.have.property("message");
    });

    let noteId: string;

    // Create a Note Test
    it("should create a note", async () => {
        const response = await request(app)
            .post("/api/v1/notes/")
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                noteId: "note011",
                title: "My First Note",
                desc: "This is my first note.",
                userEmail: "testuser@example.com"
            });
        expect(response.status).to.equal(httpStatus.CREATED);
        expect(response.body).to.have.property("message").that.includes("Note has been created");
        expect(response.body).to.have.property("data").to.equal(null);
    });

    // Get All Notes Test
    it("should get all notes", async () => {
        const response = await request(app)
            .get("/api/v1/notes/")
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                userEmail: "testuser@example.com"
            })
        noteId = response.body.data[0].noteId;
        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("meta");
    });

    // Get Note by ID Test
    it("should get note by ID", async () => {
        const response = await request(app)
            .get(`/api/v1/notes/${noteId}`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                userEmail: "testuser@example.com"
            })

        expect(response.body.data.noteId).to.equal(noteId);
        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message");
    });

    // Update Note Test
    it("should update a note by ID", async () => {
        const response = await request(app)
            .put(`/api/v1/notes/${noteId}`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                noteId: "note011",
                title: "Updated Note",
                userEmail: "testuser@example.com",
                description: "This note has been updated.",
            });
        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body).to.have.property("message");
    });

    // Archive Note Test
    it("should archive a note by ID", async () => {
        const response = await request(app)
            .put(`/api/v1/notes/${noteId}/archive`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                userEmail: "testuser@example.com",
                noteId: "note011"
            })
        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body).to.have.property("message");
    });

    // Trash Note Test
    it("should trash a note by ID", async () => {
        const response = await request(app)
            .put(`/api/v1/notes/${noteId}/trash`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                userEmail: "testuser@example.com"
            })
        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body).to.have.property("message");
    });

    // Delete Note Test
    it("should delete a note by ID", async () => {
        const response = await request(app)
            .delete(`/api/v1/notes/${noteId}/delete`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
                userEmail: "testuser@example.com"
            })
        expect(response.status).to.equal(httpStatus.GONE);
        expect(response.body).to.have.property("message");
    });
});