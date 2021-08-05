const { assert, expect } = require("chai");
const chai = require("chai");
const seed = require("../db/seed");

chai.should();
chai.expect;

const url = "http://localhost:3001";

describe("conversations", function () {
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

  describe("/GET missing token", () => {
    it("it should return 401", (done) => {
      chai
        .request(url)
        .get("/api/conversations")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/GET conversations", () => {
    it("it should return 500", (done) => {
      chai
        .request(url)
        .get("/api/conversations")
        .set("x-access-token", token)
        .end((err, res) => {
          assert.equal(res.body.length, 2);
          const convo1 = res.body[0];
          const convo2 = res.body[1];

          res.should.have.status(200);
          assert.equal(convo1.user1, null);
          assert.equal(convo1.numUnread, 10);

          assert.equal(convo2.user2, null);
          assert.equal(convo2.lastRead, 2);
          assert.equal(
            convo2.latestMessageText,
            "Share photo of your city, please"
          );
          expect(convo2.otherUser).to.deep.equal({
            id: 1,
            online: false,
            photoUrl:
              "https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914467/messenger/thomas_kwzerk.png",
            username: "thomas",
          });

          // Check ordering of conversation
          assert.isAbove(
            new Date(convo1.messages[convo1.messages.length - 1].createdAt),
            new Date(
              res.body[1].messages[res.body[1].messages.length - 1].createdAt
            )
          );
          done();
        });
    });
  });
});
