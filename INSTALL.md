# Instalación

## Prerequisitos

| Nombre   | Versión | Descripción                            | Instalación                                    |
| -------- | ------- | -------------------------------------- | ---------------------------------------------- |
| `NodeJS` | ^18     | Entorno de programación de JavaScript. | `nvm install 18` https://github.com/nvm-sh/nvm |
| `NPM`    | ^9      | Gestor de paquetes de NodeJS.          | `npm install -g npm@9.1.2`                     |

## Ejecución de comandos

```bash
# production
app [options] [command]

# development
npm run dev -- [options] [command]
```

Ejemplos:

```bash
npm run dev -- --version
npm run dev -- -V

npm run dev -- --help
npm run dev -- -h

npm run dev -- hello
npm run dev -- hello --help
npm run dev -- hello -h
```

## Ejecución de pruebas

```bash
npm run test
```

## Otros comandos útiles

```bash
# Verifica los posibles errores con el código
npm run lint

# Verifica y corrige los posibles errores con el código
npm run lint --fix

# Verifica y corrige el formato del código
npm run format
```
