const chai = require("chai");
const seed = require("../db/seed");

chai.should();
chai.expect;

const url = "http://localhost:3001";

describe("message", function () {
  let user = null;
  let token = null;

  before(async function () {
    await seed();
    const res = await chai
      .request(url)
      .post(`/auth/login`)
      .send({ username: "santiago", password: "123456" });

    user = res.body;
    token = res.body.token;
  });

  after(async function () {
    await seed();
  });

  describe("/POST missing token", () => {
    it("it should return 401", (done) => {
      chai
        .request(url)
        .post("/api/messages")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST missing body", () => {
    it("it should return 500", (done) => {
      chai
        .request(url)
        .post("/api/messages")
        .set("x-access-token", token)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe("/POST user does not belong to conversation", () => {
    it("it should return 403", (done) => {
      chai
        .request(url)
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

  describe("/POST user does belong to conversation", () => {
    it("it should return 200", (done) => {
      chai
        .request(url)
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

  describe("/PATCH read messages", () => {
    it("it should return 200", (done) => {
      chai
        .request(url)
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

  describe("/PATCH read messages invalid conversation", () => {
    it("it should return 403", (done) => {
      chai
        .request(url)
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
