<p align="center">
    <a >
        <img src="./public/wdflogo.png" alt="WDF Admin Dashboard" wdith="300px" height="300px"/>
    </a>
</p>

### Warrior Dog Foundation Admin Dashboard

<hr>

## Docs

- [Technical](#contributing)
  - [Codebase](#codebase)
    - [Technologies](#technologies)
    - [Folder Structure](#folder-structure)
    - [Code Style](#code-style)
  - [First time setup](#first-time-setup)
  - [Running the app locally](#running-the-app-locally)

#### Technologies

Here is a list of technologies we use:

- **React**: Frontend
- **Apollo Client**: handle APIs in frontend
- **Typescript**: We use React to power our frontend apps. Almost all of the code you'll touch in this codebase will be Typescript.
- **Redux**: we use Redux toolkit for globally data management.

#### Folder structure

```sh
web-react-admin-lavabee/
    ├── public
    │   └── ...
    ├── src
    │   ├── assets
    │   ├── layouts
    │   ├── modules
    │   ├── shared
    │   └── styles
    └── ...
```

#### Code Style

- We follow proper naming convention like for folder we are using `camel Case` for files `Pascal Case` and function name should be in `camel Case`.
- We are following Prettier to proper format the code.

#### Git Branch Structure

```sh
web-react-admin-lavabee/

    ├── dev
    ├── qa
    └── uat

```

##### Rules

- **No `console.log`s in any file**: we are removing `console.log` after developing is done.

### First time setup

The first step to running White Label NFT locally is downloading the code by cloning the repository:

```sh
git clone https://github.com/BlackbeardDevelopmentGroup/web-react-admin-lavabee.git
```

After clone install the node modules:

```sh
npm install
```

To start the React Server locally:

```sh
npm run start
```
