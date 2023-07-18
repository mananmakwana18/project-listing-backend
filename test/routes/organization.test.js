const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const organizationModel = require("../../models/organization"); // only for before and after hooks

let api;
let uid;
let authToken;

describe.only("Organization API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
        done();
      })
      // .then(() => done())
      .catch(done);
  });
  before("Create an organization in before block", (done) => {
    const dummyData = [{
      name: "Raw",
      about: "Providing cutting-edge IT solutions for businesses of all sizes.",
      website: "https://www.raweng.com/",
      domain: "IT & Engineering",
      password: "12345678",
    }];
    organizationModel.insertMany(dummyData)
      .then(() => done())
      .catch(done);
  });

  // test cases for GET routes
  it("GET all organizations", (done) => {
    api.get("/organizations")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Fetched organization successfully.");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.data).to.be.an("array");
        expect(response.body.errors).to.equal(null);

        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a organization", (done) => {
    api.post("/organizations/auth/register")
      .attach("photo", "test/resources/company.png")
      .field("name", "Raw Eng")
      .field("about", "Providing cutting-edge IT solutions for businesses of all sizes.")
      .field("website", "https://www.raweng.com/")
      .field("domain", "IT & Engineering")
      .field("password", "12345678")
      .then((response) => {
        authToken = response.body.data.access_token;
        uid = response.body.data.organization.uid;
        console.log("POST authToken is ----------", authToken);
        console.log("POST uid is ----------", uid);

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Organization created successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);
        expect(response.body.data).to.have.property("access_token");
        expect(response.body.data).to.have.property("organization");

        done();
      })
      .catch((e) => done(e));
  });
  // test cases for PATCH route
  it("PATCH the organization", (done) => {
    api.patch(`/organizations/${uid}`)
      .set("authorization", authToken)
      .attach("photo", "test/resources/company.png")
      .field("domain", "IT")
      .then((response) => {
        console.log("PATCH token-----------", authToken);
        console.log("PATCH uid-----------", uid);
        console.log("UPDATED --------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Updated organization successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for DELETE route
  it("DELETE organization", async () => {
    const deletePromise = api.delete(`/organizations/${uid}`)
      .set("authorization", authToken)
      .then(async (response) => {
        console.log("DELETE token-----------", authToken);
        console.log("DELETE uid-----------", uid);
        console.log("DELETED-------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message", "Deleted organization successfully.");
        expect(response.body).to.have.property("errors", null);
      });
    // remember to call the promise and delete method outside the promise definition over here
    await deletePromise;
    await organizationModel.deleteMany({});
  });
});
