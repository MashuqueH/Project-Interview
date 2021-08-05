const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app.js");

chai.should();
chai.use(chaiHttp);
const url = "http://localhost:3001";

describe("/POST ping", () => {
  it("it should return 404", (done) => {
    chai
      .request(url)
      .post(`/ping/`)
      .send({ teamName: "Shums" })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
