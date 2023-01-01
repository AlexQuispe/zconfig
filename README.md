# zconfig CLI

A CLI for zconfig.

## Comandos

| Command | Option      | Option alias | Description                         |
| ------- | ----------- | ------------ | ----------------------------------- |
|         | `--version` | `-V`         | Muestra la versión.                 |
|         | `--help`    | `-h`         | Muestra la ayuda.                   |
| `hello` |             |              | Muestra un mensaje de bienvenida.   |
| `hello` | `--help`    | `-h`         | Muestra la ayuda del comando hello. |

## Ejecución de comandos

```bash
# production
zconfig [options] [command]

# development
npm run dev -- [options] [command]
```

Ejemplos:

```bash
zconfig --version
zconfig -V

zconfig --help
zconfig -h

zconfig hello
zconfig hello --help
zconfig hello -h
```
