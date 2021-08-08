const chai = require("chai");
const app = require("../bin/www");

chai.should();

describe("/POST /auth/login", () => {
  it("should return 200 when user provides valid login info", (done) => {
    chai
      .request(app)
      .post(`/auth/login`)
      .send({ username: "thomas", password: "123456" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("username").eql("thomas");
        res.body.should.have.property("token");
        done();
      });
  });
});

describe("/POST /auth/login", () => {
  it("should return 401 when user provides an invalid username", (done) => {
    chai
      .request(app)
      .post(`/auth/login`)
      .send({ username: "thomas1", password: "1234567" })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have
          .property("error")
          .eql("Wrong username and/or password");
        done();
      });
  });
});

describe("/POST /auth/login", () => {
  it("should return 401 when user provides an incorrect password", (done) => {
    chai
      .request(app)
      .post(`/auth/login`)
      .send({ username: "thomas", password: "1234567" })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have
          .property("error")
          .eql("Wrong username and/or password");
        done();
      });
  });
});

describe("/POST /auth/login", () => {
  it("should return 400 when username is missing from post body", (done) => {
    chai
      .request(app)
      .post(`/auth/login`)
      .send({ password: "1234567" })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have
          .property("error")
          .eql("Username and password required");
        done();
      });
  });
});

describe("/POST /auth/login", () => {
  it("should return 400 when password is missing from post body", (done) => {
    chai
      .request(app)
      .post(`/auth/login`)
      .send({ username: "thomas" })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have
          .property("error")
          .eql("Username and password required");
        done();
      });
  });
});

describe("/POST /auth/register", () => {
  it("should return 400 when user does not provide an email for registration", (done) => {
    chai
      .request(app)
      .post(`/auth/register`)
      .send({ username: "thomas1", password: "123456" })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have
          .property("error")
          .eql("Username, password, and email required");
        done();
      });
  });
});

describe("/POST /auth/register", () => {
  it("should return 401 when user registers with username that already exists", (done) => {
    chai
      .request(app)
      .post(`/auth/register`)
      .send({
        username: "thomas",
        password: "123456",
        email: "thomas@email.com",
      })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property("error").eql("User already exists");
        done();
      });
  });
});

describe("/DELETE /auth/logout", () => {
  it("should return 204 when user logs out", (done) => {
    chai
      .request(app)
      .delete(`/auth/logout`)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});

describe("/GET /auth/user", () => {
  it("should return 200 when user information is retrieved", (done) => {
    chai
      .request(app)
      .get(`/auth/user`)
      .set("user", {})
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
