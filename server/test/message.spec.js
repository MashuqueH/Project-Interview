const chai = require("chai");
const seed = require("../db/seed");
const app = require("../bin/www");

chai.should();
chai.expect;

describe("message", function () {
  let user = null;
  let token = null;

  before(async function () {
    await seed();
    const res = await chai
      .request(app)
      .post(`/auth/login`)
      .send({ username: "santiago", password: "123456" });

    user = res.body;
    token = res.body.token;
  });

  describe("/POST /api/messages", () => {
    it("should return 401 when a messenger-token is not provided", (done) => {
      chai
        .request(app)
        .post("/api/messages")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST /api/messages", () => {
    it("should return 500 when user does not provide a body for the request", (done) => {
      chai
        .request(app)
        .post("/api/messages")
        .set("x-access-token", token)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe("/POST /api/messages", () => {
    it("should return 403 when user does not belong to the provided conversation", (done) => {
      chai
        .request(app)
        .post("/api/messages")
        .send({
          recipientId: 3,
          text: "test",
          conversationId: 2,
        })
        .set("x-access-token", token)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });

  describe("/POST /api/messages", () => {
    it("should return 200 when user does belong to the provided conversation", (done) => {
      chai
        .request(app)
        .post("/api/messages")
        .send({
          recipientId: 1,
          text: "test",
          conversationId: 1,
        })
        .set("x-access-token", token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message");
          res.body.message.should.have.property("text").equal("test");
          res.body.message.should.have.property("senderId").equal(user.id);
          res.body.message.should.have.property("conversationId").equal(1);
          done();
        });
    });
  });

  describe("/PATCH /api/read/messages", () => {
    it("should return 200 when the user reads unread messages", (done) => {
      chai
        .request(app)
        .patch("/api/messages/read")
        .set("x-access-token", token)
        .send({
          recipientId: 3,
          conversationId: 3,
        })
        .end((err, res) => {
          res.should.have.status(200);
          chai
            .expect(res.body.map((message) => message.read))
            .to.have.deep.equal(new Array(res.body.length).fill(true));
          done();
        });
    });
  });

  describe("/PATCH /api/messages/read", () => {
    it("should return 403 when user provides an invalid conversation id", (done) => {
      chai
        .request(app)
        .patch("/api/messages/read")
        .set("x-access-token", token)
        .send({
          recipientId: 3,
          conversationId: 10,
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });
});
