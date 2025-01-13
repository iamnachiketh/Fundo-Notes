"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const chai_1 = require("chai");
const index_1 = __importDefault(require("../../index"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
describe("Routes", () => {
    let server;
    before((done) => __awaiter(void 0, void 0, void 0, function* () {
        server = index_1.default.listen(3000, () => `Server Listen at 3000`);
        done();
    }));
    after(() => {
        server.close();
    });
    // Register User Test
    it("should register a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post("/api/v1/users/register")
            .send({
            name: "testuser",
            email: "testuser@example.com",
            password: "testpassword123",
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.CREATED);
        (0, chai_1.expect)(response.body).to.have.property("message").that.includes("User registered successfully");
    }));
    let accessToken;
    let refreshToken;
    // Login User Test
    it("should login a user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post("/api/v1/users/login")
            .send({
            email: "testuser@example.com",
            password: "testpassword123",
        });
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
        (0, chai_1.expect)(response.body.status).to.equal(http_status_codes_1.default.OK);
        (0, chai_1.expect)(response.body).to.have.property("accessToken");
        (0, chai_1.expect)(response.body).to.have.property("refreshToken");
        (0, chai_1.expect)(response.body).to.have.property("data");
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
    // Refresh Token Test
    it("should refresh user token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .get("/api/v1/users/refresh-token")
            .set("x-token", `Bearer ${refreshToken}`)
            .send({
            email: "testuser@example.com"
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.CREATED);
        (0, chai_1.expect)(response.body).to.have.property("token");
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
    let noteId;
    // Create a Note Test
    it("should create a note", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post("/api/v1/notes/")
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            noteId: "note011",
            title: "My First Note",
            desc: "This is my first note.",
            userEmail: "testuser@example.com"
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.CREATED);
        (0, chai_1.expect)(response.body).to.have.property("message").that.includes("Note has been created");
        (0, chai_1.expect)(response.body).to.have.property("data").to.equal(null);
    }));
    // Get All Notes Test
    it("should get all notes", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .get("/api/v1/notes/")
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            userEmail: "testuser@example.com"
        });
        noteId = response.body.data[0].noteId;
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.OK);
        (0, chai_1.expect)(response.body).to.have.property("message");
        (0, chai_1.expect)(response.body).to.have.property("data");
        (0, chai_1.expect)(response.body).to.have.property("meta");
    }));
    // Get Note by ID Test
    it("should get note by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/notes/${noteId}`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            userEmail: "testuser@example.com"
        });
        (0, chai_1.expect)(response.body.data.noteId).to.equal(noteId);
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.OK);
        (0, chai_1.expect)(response.body).to.have.property("data");
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
    // Update Note Test
    it("should update a note by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/notes/${noteId}`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            noteId: "note011",
            title: "Updated Note",
            userEmail: "testuser@example.com",
            description: "This note has been updated.",
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.OK);
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
    // Archive Note Test
    it("should archive a note by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/notes/${noteId}/archive`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            userEmail: "testuser@example.com",
            noteId: "note011"
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.OK);
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
    // Trash Note Test
    it("should trash a note by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/notes/${noteId}/trash`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            userEmail: "testuser@example.com"
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.OK);
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
    // Delete Note Test
    it("should delete a note by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/notes/${noteId}/delete`)
            .set("x-token", `Bearer ${accessToken}`)
            .send({
            userEmail: "testuser@example.com"
        });
        (0, chai_1.expect)(response.status).to.equal(http_status_codes_1.default.GONE);
        (0, chai_1.expect)(response.body).to.have.property("message");
    }));
});
