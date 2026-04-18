# Agenda Familiar

Agenda Familiar é uma aplicação web premium para organizar a vida da casa num só sítio.

## O que faz

- calendário com vistas `dia`, `semana`, `mês` e `ano`
- lista de compras com `Modo Mercado`
- tarefas e alertas pendentes
- áreas personalizadas para os membros da família
- área dedicada à Gucci
- área dedicada à Sofia
- armazenamento local no navegador com `localStorage`

## Destaques

- temas visuais com forte diferenciação
- calendário com acabamento mais 3D
- listas rápidas para compras
- registos de saúde e cuidados
- interface pensada para uso diário

## Tecnologias

- HTML
- CSS
- JavaScript
- Tailwind via CDN

## Como correr

1. Abre o ficheiro `index.html` no browser.
2. Ou serve a pasta com um servidor simples local.

Exemplo:

```bash
python3 -m http.server 8000
```

Depois abre:

```text
http://localhost:8000
```

## GitHub Pages

O repositório inclui um workflow para publicar em GitHub Pages através de GitHub Actions.

## Estrutura

- `index.html` - estrutura principal da app
- `styles.css` - estilos personalizados
- `state.js` - estado, temas e utilitários
- `calendar.js` - calendário
- `shopping.js` - lista de compras
- `tasks.js` - tarefas
- `app.js` - renderizadores das páginas

## Dados

Os dados da app ficam guardados no navegador, usando `localStorage`.

