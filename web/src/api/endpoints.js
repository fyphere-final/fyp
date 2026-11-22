import api from './client';

const L = (u, l) => `/lessons/${u}/${l}`;
const data = (p) => p.then((r) => r.data);

export const authApi = {
  login: (email, password) => data(api.post('/auth/login', { email, password })),
  me: () => data(api.get('/auth/me')),
};
export const studentApi = {
  dashboard: () => data(api.get('/dashboard')),
  units: () => data(api.get('/units')),
  unitLessons: (u) => data(api.get(`/units/${u}/lessons`)),
  sabaq: (u, l) => data(api.get(`${L(u, l)}/sabaq`)),
  sabaqCheck: (u, l, answers) => data(api.post(`${L(u, l)}/sabaq/check`, { answers })),
  sabaqComplete: (u, l) => data(api.post(`${L(u, l)}/sabaq/complete`)),
  exercise: (u, l) => data(api.get(`${L(u, l)}/exercise`)),
  exerciseSubmit: (u, l, token, answers) => data(api.post(`${L(u, l)}/exercise/submit`, { token, answers })),
  quiz: (u, l) => data(api.get(`${L(u, l)}/quiz`)),
  quizSubmit: (u, l, token, answers) => data(api.post(`${L(u, l)}/quiz/submit`, { token, answers })),
  reassess: (u, l, attemptId) => data(api.get(`${L(u, l)}/reassess`, { params: { attemptId } })),
  reassessSubmit: (u, l, token, answers) => data(api.post(`${L(u, l)}/reassess/submit`, { token, answers })),
  attempt: (id) => data(api.get(`/attempts/${id}`)),
  progress: () => data(api.get('/progress')),
};
