[![Docker Image CI](https://github.com/DurhamAcademy/NuxtScoutingSystem/actions/workflows/docker-image.yml/badge.svg)](https://github.com/DurhamAcademy/NuxtScoutingSystem/actions/workflows/docker-image.yml)

# Welcome to ChocoChip! DARC SIDE's Scouting Software

![chocochip darcside logo](https://github.com/DurhamAcademy/NuxtScoutingSystem/assets/65467501/3d2e1bdc-5a94-475b-8531-84e87ac48413)

## Table of Contents
- [Getting Started](#getting-started)
- [The Basics](#the-basics)
- [Resources](#resources)

## Getting Started

### Install the Project

1. Navigate to the [ChocoChipScouting GitHub page](https://github.com/DurhamAcademy/ChocoChipScouting)
2. Click the green "Code" button and copy the HTTPS url
3. Go to WebStorm or your preferred code editor and import a project from VCS/GitHub
4. Install [Node.js](https://nodejs.org/en)
5. Once you are in your newly created project, open the terminal and run `npm install` in the project directory

Nice! Now the project and it's dependencies are installed.

### Docker Installation

In order to run a database, which is necessary to run the website, you must first install Docker. Docker is an application we use which makes it easier to work with databases across different operating systems

1. Install [Docker](https://www.docker.com/products/docker-desktop/)
2. Find the "compose.yaml" file in your code editor
3. Run line 91, `couch-db-setup:`

Great! Now you can host a database locally.

### Setting Up an ENV File

The final step is set up a .env file. This is an environment file and it will store any secrets we cannot upload to GitHub (for security reasons). Unfortunately, it would make the .env file redundant to post those secrets here. You will have to get them from another user, or create your own. You must create your own .env file in a format that follows the code below (but replace the XXXX's with the secrets):

```
NUXT_COUCH_DB_HOSTNAME=XXXX
NUXT_TBA_KEY=XXXX
NUXT_COUCH_DB_SERVER_ADMIN_USER_USERNAME=XXXX
NUXT_COUCH_DB_SERVER_ADMIN_USER_PASSWORD=XXXX
```

## The Basics
### Running the Website

Awesome! You're done installing. Now it is time to run the website for the first time.

1. First, open up Docker and ensure you are running the ChocoChip scouting container. Docker contains your local database, so if this isn't running, your website won't work.
2. Navigate to the terminal inside your editor (suggested) OR navigate to the project directory in your computer's terminal
3. Copy and paste `npm run dev` and run it to start the website

That's it! Click the `Local: http://localhost:3000/` link and the website will open. This is a locally hosted version of the website. Any changes you make to this version of the website won't impact the production website, so feel free to mess around. This includes any data you input, as this is stored locally with Docker.


## Resources

Now that you have the scouting software up and running, here are some resources. While this README will try to cover the important bits, if you run into any issues or want to add something new, these resources are the first place to look.

### Vue
- [Vue](https://vuejs.org/guide/introduction.html)
	- This is the framework we use. It allows us to put JS, CSS, and HTML all in the same file (in addition to some other pretty cool stuff). Definitely check this one out if you are curious.
### Nuxt
- [Nuxt](https://nuxt.com/docs/getting-started/introduction)
	- Nuxt extends on Vue as a framework. This allows us to do some of the complicated backend that *hopefully* you won't have to deal with every season.
	- This is where `npm run dev, npm run build, and npm run preview` come from: [Deployment Documentation](https://nuxt.com/docs/getting-started/deployment).
- [Nuxt UI](https://ui.nuxt.com/getting-started)
	- Nuxt UI, on the other hand, is something you will likely use every season. This is a collection of premade HTML components that make building the website easier. If you are updating any of the UI, it is pretty important you check this out.

### PouchDB
- [PouchDB](https://pouchdb.com/guides/)
	- PouchDB is a database library. This helps us with our website's signature feature: offline data saving. 

### Vuetify
- [Vuetify](https://vuetifyjs.com/en/components/data-tables/basics/)
	- Vuetify is a similar service as Nuxt UI. We mostly stick with Nuxt UI for the sake of conformity, but `/pages/matches.vue` was made significantly easier due to options this library offers.

### Chart.js
- [Chart.js](https://www.chartjs.org/docs/latest/)
	- Chart.js is a chart library that we use to display data. Notice this in the `/components/charts/` folder and on the `/pages/teams/index.vue` and `/pages/teams/[id].vue` pages.
- [Vue Chart](https://vue-chart-3.netlify.app/guide/#introduction)
	- Vue Chart is a library that combines with Chart.js to allow us to use Chart.js on a Vue-based website. You can see this in use in the same places as Chart.js.

### Prettier/ESlint
- [Prettier](https://prettier.io/docs/en/)
- [ESLint](https://eslint.style/guide/getting-started)
	- These two libraries automatically ensure our code follows certain stylistic rules when uploading to GitHub.
