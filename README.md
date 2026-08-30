# cv-ui

This project was bootstrapped with [create-stack](https://create-stack.alfredmouelle.com).

## Getting started

```bash
pnpm install
# .env is generated with local defaults; update it for external services.
pnpm dev
```

## What's next? How do I make an app with this?

This project starts with the base selected during bootstrap. Keep the parts you need, replace the starter screen, and add integrations when the app needs them.

Start in [`src/`](./src/) and update [`src/lib/site-config.ts`](./src/lib/site-config.ts) with your application identity. The CLI creates [`.env`](./.env) with local defaults and [`.env.example`](./.env.example) with placeholders. Fill in provider credentials before using external services, and do not commit `.env`.

Add an integration after creation with:

```bash
create-stack add <capability> [provider]
```

Changing a port provider replaces its generated adapter by default. Pass `--keep-files` when both implementations need to stay in the project.



## Learn more

- [create-stack documentation](https://create-stack.alfredmouelle.com)
- [create-stack CLI reference](https://github.com/alfredmouelle/create-stack/blob/main/cli/README.md)
- [create-stack GitHub repository](https://github.com/alfredmouelle/create-stack)

## How do I deploy this?

The project includes a Dockerfile for container deployments. Set the production environment variables listed in `.env.example` on your host, then follow your hosting provider's Docker deployment guide.

# Author

Alfred MOUELLE | Full-stack developer

[![ComeUp](https://img.shields.io/static/v1?style=for-the-badge&label=&message=ComeUp&color=yellow)](https://comeup.com/@alfredmouelle)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/alfredmouelle)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alfredmouelle)
[![X](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/alfredmouelle)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:alfredmouelle@gmail.com)
[![Portfolio](https://img.shields.io/static/v1?style=for-the-badge&label=&message=Portfolio&color=blue)](https://alfredmouelle.com)
