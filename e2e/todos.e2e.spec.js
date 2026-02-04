const { test, expect } = require("@playwright/test");

const BASE = "http://localhost";

test("E2E: create and delete a todo via NGINX -> API -> MySQL", async ({
  request,
}) => {
  const list1 = await request.get(`${BASE}/api/v1/users/todos`);
  expect(list1.ok()).toBeTruthy();
  const before = await list1.json();

  const create = await request.post(`${BASE}/api/v1/users/todos`, {
    data: { title: "E2E Test Todo" },
  });
  expect(create.status()).toBe(201);
  const created = await create.json();
  expect(created).toHaveProperty("id");

  const list2 = await request.get(`${BASE}/api/v1/users/todos`);
  expect(list2.ok()).toBeTruthy();
  const after = await list2.json();
  expect(after.some((t) => t.id === created.id)).toBeTruthy();

  const del = await request.delete(`${BASE}/api/v1/users/todos/${created.id}`);
  expect(del.status()).toBe(204);

  const list3 = await request.get(`${BASE}/api/v1/users/todos`);
  expect(list3.ok()).toBeTruthy();
  const final = await list3.json();
  expect(final.some((t) => t.id === created.id)).toBeFalsy();
});
