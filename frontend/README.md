# Frontend

## Stack

- JS Framework: [Nuxt](https://nuxt.com/docs/getting-started/introduction)
- [TypeScript](https://www.typescriptlang.org)
- Server Framework: [h3](https://v1.h3.dev/)
- Components: [shadcn/vue](https://www.shadcn-vue.com)
- Form Validation: [VeeValidate](https://vee-validate.logaretm.com/v4/) + [Zod](https://zod.dev)

## Setup

> Make sure to add the `.env` file, see `.env.example`

Install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:5173`:

```bash
npm run dev
```

## Formatting and Linting

Format code with Prettier:

```bash
npm run format # check
npm run format:fix # fix
```

Lint code with ESLint:

```bash
npm run lint # check
npm run lint:fix # fix
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Caveats

- The cookie consent is currently being stored in a global cookie_consent cookie, rather than having a per user config.
