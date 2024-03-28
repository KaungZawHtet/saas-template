export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  emailConfirmed?: boolean;
  emailToken?: string;
}

export const users: User[] = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@gmail.com',
    password: '1234',
  },
  {
    id: 2,
    name: 'Foo',
    email: 'foo@gmail.com',
    password: 'fwfew',
  },
];
