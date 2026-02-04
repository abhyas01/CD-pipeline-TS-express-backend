import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://127.0.0.1";

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "20s", target: 10 },
    { duration: "10s", target: 0 },
  ],

  // <1% failures
  // 95% under 300ms
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<300"],
  },
};

export default function () {
  const list = http.get(`${BASE_URL}/api/v1/users/todos`);
  check(list, {
    "list status is 200": (r) => r.status === 200,
  });

  const create = http.post(
    `${BASE_URL}/api/v1/users/todos`,
    JSON.stringify({ title: `loadtest-${__VU}-${__ITER}` }),
    { headers: { "Content-Type": "application/json" } },
  );

  check(create, {
    "create status is 201": (r) => r.status === 201,
  });

  sleep(0.2);
}
