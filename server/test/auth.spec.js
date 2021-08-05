const chai = require("chai");
chai.should();

const url = "http://localhost:3001";
describe("/POST valid login", () => {
  it("should return 200", (done) => {
    chai
      .request(url)
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

describe("/POST invalid username", () => {
  it("should return 401", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/POST invalid password", () => {
  it("should return 401", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/POST missing username", () => {
  it("should return 400", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/POST missing password", () => {
  it("should return 400", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/POST missing password", () => {
  it("should return 400", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/POST invalid registration", () => {
  it("should return 400", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/POST user already exists registration", () => {
  it("should return 401", (done) => {
    chai
      .request("http://localhost:3001")
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

describe("/DELETE logout", () => {
  it("should return 204", (done) => {
    chai
      .request("http://localhost:3001")
      .delete(`/auth/logout`)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});

describe("/GET user", () => {
  it("should return 200", (done) => {
    chai
      .request("http://localhost:3001")
      .get(`/auth/user`)
      .set("user", {})
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe("/GET missing user", () => {
  it("should return 200", (done) => {
    chai
      .request("http://localhost:3001")
      .get(`/auth/user`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
