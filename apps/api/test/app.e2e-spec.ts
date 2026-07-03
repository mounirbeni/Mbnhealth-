import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("MBN Health API (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1", { exclude: ["health"] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/health (GET) reports ok without authentication", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe("ok");
      });
  });

  it("/api/v1/patients (GET) rejects unauthenticated requests", () => {
    return request(app.getHttpServer()).get("/api/v1/patients").expect(401);
  });

  it("/api/v1/auth/login (POST) authenticates the seeded clinic owner", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "owner@demo-clinic.com", password: "Passw0rd!123", tenantSlug: "demo-clinic" })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it("/api/v1/patients (GET) succeeds once authenticated", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/patients")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("/api/v1/auth/login (POST) rejects wrong password", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "owner@demo-clinic.com", password: "wrong-password", tenantSlug: "demo-clinic" })
      .expect(401);
  });
});
