# Custom Rama API

The custom rama module of Cream that lets you manage non-standard resources for RAMA via the RESTful API.

## Features

- Custom TM Config API
- Followups API
- Formulas API
- Hospitals API
- Ingredients API
- Patients API
- Product Groups API
- Product Ingredients API
- Products API
- Provinces API
- Scripts API
- Today Stats Schedule

## Prerequisites

- Node.js
- MongoDB

## Getting Started

Clone the project to your machine.

```
git clone http://192.168.102.101/cream/custom-api/rama-backend custom-rama-backend
```

Change the working directory.

```
cd custom-rama-backend
```

Install the project dependencies.

```
npm install
```

Config the development environment.

```
code .env.development
```

Development mode runs with nodemon. 

```
npm run dev
```

## Built With

- Express
- Mongoose
- query-to-mongo

## Datbase Scheme

- [Data Dictionary](https://createlcom.sharepoint.com/sites/DevTeam/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FDevTeam%2FShared%20Documents%2FCream%2FModules%2FCustom%20Rama)

## VPN

- LAB = The Createlcom VPN
- EXAT = https://createlcom.sharepoint.com/sites/DevTeam/SitePages/EXAT.aspx
- RAMA = https://createlcom.sharepoint.com/sites/DevTeam/SitePages/RAMA.aspx

## Deployment

SSH to the production server.

```
ssh user01@<SERVER-IP>
```

Change the working directory.

```
cd Cream_Deployment
```

Clone the project to the server (New Deployment).

```
git clone http://192.168.102.101/cream/custom-api/rama-backend custom-rama-backend
```

Pull the latest project changes (Update Deployment).

```
git pull
```

Build the docker image.
```
sudo docker build -t local:custom-rama-backend -f dockerfile .
```

Stop the container if running.
```
sudo docker container stop custom-rama-backend
```

Remove the container image.
```
sudo docker container rm custom-rama-backend
```

Run a container using new image.
```
sudo docker container run -d -it --name custom-rama-backend -p 4018:4018 -v /home/user01/apps/logs:/app/logs --restart always --network host local:custom-rama-backend
```

Check container is running?
```
sudo docker container ls
```

Monitor the container logs.
```
sudo docker container logs -f --tail 100 custom-rama-backend
```

## Improvement

- [x] Caching docker layers to avoid unnecessary download.
