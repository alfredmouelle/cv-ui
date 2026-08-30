# shadcn registry and installation contract

Checked against the official shadcn documentation and published JSON Schemas on 2026-08-30.

## Decision

CV UI should make this the canonical install command:

```sh
npx shadcn@latest add @cv-ui/<template-name>
```

This command is zero-configuration only after shadcn accepts `@cv-ui` into its public registry directory. The directory makes registered namespaces available to `add` and `search` without a prior local setup step. CV UI must submit a directory entry that maps `@cv-ui` to `https://cv-ui.alfredmouelle.com/r/{name}.json`. [Registry directory](https://ui.shadcn.com/docs/registry/registry-index)

Until that entry is accepted, and as a permanent fallback, publish this command beside it:

```sh
npx shadcn@latest add https://cv-ui.alfredmouelle.com/r/<template-name>.json
```

The CLI accepts an item name, URL, or local path. Direct item URLs do not need a namespace in `components.json`. [CLI `add` command](https://ui.shadcn.com/docs/cli#add) [Registry publishing guide](https://ui.shadcn.com/docs/registry/getting-started#publish-your-registry)

Do not make `alfredmouelle/cv-ui/<template-name>` canonical. A public GitHub registry address is also zero-configuration, but it ties the public install address to the repository owner and host. Keep it as a developer fallback. [GitHub registries](https://ui.shadcn.com/docs/registry/github)

## Published endpoints

Keep a root `registry.json` as the source catalog. It must conform to `https://ui.shadcn.com/schema/registry.json`. Each installable template must resolve to an item payload at `/r/<template-name>.json` and conform to `https://ui.shadcn.com/schema/registry-item.json`. `shadcn build` generates static item payloads in `public/r` by default and accepts another output directory. The catalog remains available separately at `/r/registry.json`. [Registry setup and build](https://ui.shadcn.com/docs/registry/getting-started) [Published registry schema](https://ui.shadcn.com/schema/registry.json) [Published item schema](https://ui.shadcn.com/schema/registry-item.json)

Use a lowercase, hyphenated template name. The item `name` must be unique inside CV UI. A namespace address has the form `@namespace/resource-name`, and the namespace may contain letters, digits, hyphens, and underscores. [Namespace naming](https://ui.shadcn.com/docs/registry/namespace#registry-naming-convention)

## Item shape

Use `registry:block` for a CV template. A template is an installable unit with more than one file, even when its visible CV component is one `.tsx` file. The official schema reserves `registry:block` for complex, multi-file components. [Registry item types](https://ui.shadcn.com/docs/registry/registry-item-json#type)

Each item should contain:

- the CV template component as `registry:component`, targeted below `@components/cv/`;
- demonstration data as `registry:lib`, targeted below `@lib/cv/`;
- a `registryDependencies` entry for one shared `cv-data` item, which installs the TypeScript contract below `@lib/cv/`;
- `name`, `type`, `title`, `description`, `author`, `files`, and CV UI catalog metadata.

The upstream item schema requires only `name` and `type`, but CV UI should enforce the stronger fields above in its own validation. Put CV UI-only search and display facts in `meta` or in the source catalog. The upstream schema permits arbitrary `meta` values and `categories`. [Registry item schema](https://ui.shadcn.com/schema/registry-item.json)

Use explicit target placeholders. `@components/`, `@ui/`, `@lib/`, and `@hooks/` resolve through the consumer's `components.json` aliases and do not depend on its import prefix. A target can override the default implied by the file type. `registry:file` and `registry:page` require `target`; other file types can omit it, but explicit targets make the CV UI install layout testable. `~` means the consumer project root. [File targets](https://ui.shadcn.com/docs/registry/registry-item-json#files)

CV UI templates use React and Tailwind CSS only, so their item-level `dependencies` and `devDependencies` should normally be empty. If a later template needs an npm package, put it in `dependencies`. If it needs another registry item, put that item address in `registryDependencies`. Bare registry dependency names refer to the built-in shadcn registry, not CV UI. A CV UI dependency must therefore use `@cv-ui/<name>` or the full item URL. [Dependency fields](https://ui.shadcn.com/docs/registry/registry-item-json#dependencies) [Registry dependencies](https://ui.shadcn.com/docs/registry/registry-item-json#registrydependencies)

Use `https://cv-ui.alfredmouelle.com/r/cv-data.json` for the shared contract dependency in V1. An `@cv-ui/cv-data` dependency would require the namespace to exist in the consumer configuration, which would break the direct URL fallback before directory acceptance. The absolute dependency keeps both install commands self-contained.

## Consumer prerequisites and behavior

The normal consumer is an initialized shadcn React project with a valid `components.json`. CV UI uses its alias paths to install the component and shared files. The CLI can install files, npm dependencies, registry dependencies, CSS, CSS variables, Tailwind configuration, and declared environment variables. The V1 CV UI contract should use only files and no third-party runtime dependency or environment variable. [Registry API reference](https://ui.shadcn.com/docs/registry/api-reference#addregistryitems)

The site should also expose review commands for humans and agents:

```sh
npx shadcn@latest view @cv-ui/<template-name>
npx shadcn@latest add @cv-ui/<template-name> --dry-run
```

`view` returns the resolved payload. `--dry-run`, `--diff`, and `--view` let a consumer inspect an installation before writes. [Namespace inspection](https://ui.shadcn.com/docs/registry/namespace#inspecting-resources-before-installation) [CLI options](https://ui.shadcn.com/docs/cli#add)

## Namespace and authentication contract

Before directory acceptance, users can register the alias once:

```sh
npx shadcn@latest registry add @cv-ui=https://cv-ui.alfredmouelle.com/r/{name}.json
```

The equivalent `components.json` entry is:

```json
{
  "registries": {
    "@cv-ui": "https://cv-ui.alfredmouelle.com/r/{name}.json"
  }
}
```

The `{name}` placeholder is required and resolves to the requested resource name. A namespace configuration may instead be an object with `url`, `headers`, and `params`. `${VARIABLE}` references in all three locations expand from the consumer environment. This supports a future private registry, but CV UI V1 is public and must not require credentials. [Namespace configuration](https://ui.shadcn.com/docs/registry/namespace#configuration) [Registry authentication](https://ui.shadcn.com/docs/registry/authentication)

## Acceptance checks for V1

The registry contract is proven when CI can:

1. validate the source `registry.json` and every generated item against the current official schemas;
2. build `/r/registry.json` and `/r/<template-name>.json` from the same source files that power site previews;
3. install each item by direct HTTPS URL into a clean fixture with non-default aliases;
4. install each item by `@cv-ui/<template-name>` after adding the namespace;
5. confirm that the expected template, CV Data contract, and demonstration data arrive at their declared alias-based targets;
6. confirm that the installed item declares no third-party runtime package for V1.

Official shadcn directory acceptance is an external release gate for the zero-configuration namespace command. It is not a gate for the direct URL flow or for building the rest of V1.
