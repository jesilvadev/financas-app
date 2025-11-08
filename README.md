# FinancasApp

Aplicação web desenvolvida em Angular para gestão financeira pessoal, oferecendo módulos de autenticação, onboarding guiado e dashboards para acompanhar histórico, estatísticas e perfil do usuário.

## Visão Geral

- **Framework:** Angular 19 com componentes standalone e roteamento modularizado.
- **UI:** Angular Material + Tailwind CSS com paleta personalizada.
- **Estado e comunicação:** RxJS, serviços Angular e guards de autenticação.
- **Estilos:** SCSS global com integração Tailwind (`@tailwind base/components/utilities`).

## Pré-requisitos

- Node.js 20.x (LTS) ou superior.
- npm 10.x ou superior (instalado junto com o Node).
- Angular CLI 19 (`npm install -g @angular/cli`).

> Verifique sua versão com `node -v`, `npm -v` e `ng version`.

## Preparando o Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/financas-app.git
   cd financas-app
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

## Rodando o Projeto

Após instalar as dependências, inicie o servidor de desenvolvimento com:

```bash
npm start
```

A aplicação ficará disponível em `http://localhost:4200/`.

### Geração de código

Utilize a CLI para criar novos componentes, serviços ou guards:

```bash
ng g c pages/exemplo/minha-pagina
ng g s services/exemplo
```

O projeto está configurado para usar SCSS como linguagem de estilos padrão em novos componentes.

## Estrutura do Projeto

```
src/
 ├─ app/
 │   ├─ app.routes.ts         # Definição das rotas principais
 │   ├─ app.config.ts         # Configuração raiz (providers e inicializações)
 │   ├─ guards/               # Guards de autorização (`auth`, `guest`)
 │   ├─ services/             # Serviços compartilhados (ex.: `auth.service.ts`)
 │   ├─ models/               # Tipagens/Interfaces (ex.: `user.model.ts`)
 │   └─ pages/                # Páginas organizadas por domínio
 │        ├─ auth/            # Onboarding, login e fluxo de cadastro
 │        ├─ home/            # Dashboard principal
 │        ├─ history/         # Histórico
 │        ├─ stats/           # Indicadores e estatísticas
 │        └─ profile/         # Perfil do usuário
 ├─ assets/                   # Imagens e arquivos estáticos
 ├─ styles.scss               # Estilos globais, Tailwind e tema Material
 └─ main.ts                   # Bootstrap da aplicação
```

## Estilos e Design System

- Tailwind configurado em `tailwind.config.js` com paleta de cores personalizada:

  - `primary`: #6B54EC
  - `secondary`: #9EAAFE
  - `layer`: #FFFFFF
  - `disable`: #C4CCD5
  - `description`: #676767
  - `black`: #000000
  - `white`: #FFFFFF
  - `success`: #22C55E
  - `warning`: #FACC15
  - `info`: #3B82F6
  - `error`: #EF4444

Aplique essas cores sempre por meio das classes utilitárias do Tailwind (`bg-primary`, `text-description`, etc.), garantindo aderência ao design system e facilitando manutenção futura.

## Recursos Úteis

- [Documentação Angular](https://angular.dev/)
- [Angular Material](https://material.angular.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Guia CLI Angular](https://angular.dev/tools/cli)
