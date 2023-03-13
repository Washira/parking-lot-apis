# Custom PARKING LOT APIs

The custom `Parking Lot` modules that lets you manage resources via the RESTful APIs.

## Features

- Parking Lot APIs
- Plate Number APIs

## Prerequisites

- Node.js
- MongoDB

## Getting Started

Clone the project to your machine.

```
git clone <GIT_URL>
```

Change the working directory.

```
cd parking-lot-backend
```

Install the project dependencies.

```
npm install
```

Development mode runs with nodemon.

```
npm run dev
```

## Built With

- Express
- Mongoose
- query-to-mongo

## HTTP Request

Test send request to url

```
curl localhost
```

### All routes of the parking lot APIs

| No. | Route | HTTP Verb | Request Body | Request Query | Description |
|------|------|------|----------|---------|---------|
| 1 | /parking/api/v1/parkings | `POST` | {<br> 'name': `<LOT_NAME>`,<br> 'lot_number': `<LOT_NUMBER>`, <br>'size': `<LOT_SIZE>`<br>} | - | Create a new parking lot |
| 2 | /parking/api/v1/parkings | `GET` | - | - | Get all parking lots |
| 3 | /parking/api/v1/parkings/`<LOT_ID>` | `GET` | - | - | Get a parking lot by id |
| 4 | /parking/api/v1/parking-status/`<LOT_ID>` | `GET` | - | - | Get a parking lot status by id |
| 5 | /parking/api/v1/find-one-available-parking | `GET` | - | size=`<LOT_SIZE>` | Get a first available parking lot by size |
| 6 | /parking/api/v1/parkings`<LOT_ID>` | `PUT` | {<br> 'name': `<LOT_NAME>`,<br> 'lot_number': `<LOT_NUMBER>`, <br>'size': `<LOT_SIZE>`<br>} | - | Update the parking lot by id |
| 7 | /parking/api/v1/parkcar | `PUT` | { number: `<CAR_PLATE_NUMBER>` } | - | Update the parking lot by id when any car go to PARK |
| 8 | /parking/api/v1/leavecar | `PUT` | { number: `<CAR_PLATE_NUMBER>` } | - | Update the parking lot by id when any car LEAVE the parking lot |
| 9 | /parking/api/v1/parkings/`<LOT_ID>` | `DELETE` | - | - | Delete the parking lot by id |

### All routes of the plate number APIs

| No. | Route | HTTP Verb | Request Body | Request Query | Description |
|------|------|------|----------|---------|---------|
| 1 | /parking/api/v1/plate-numbers | `POST` | {<br> 'number': `<CAR_PLATE_NUMBER>`, <br>'size': `<CAR_SIZE>`<br>} | - | Create a new car |
| 2 | /parking/api/v1/plate-numbers | `GET` | - | - | Get all registration car |
| 3 | /parking/api/v1/plate-numbers/`<CAR_REGISTRATION_ID>` | `GET` | - | - | Get a registration car by id |
| 4 | /parking/api/v1/plate-numbers/`<CAR_REGISTRATION_ID>` | `PUT` | {<br> 'number': `<CAR_PLATE_NUMBER>`, <br>'size': `<CAR_SIZE>`<br>} | - | Update the registration car by id |
| 1 | //parking/api/v1/plate-numbers/`<CAR_REGISTRATION_ID>` | `DELETE` | - | - | Delete the registration car by id |

## Run in Docker

Pull the image of parking lot.

```
docker pull washira/parking-lot
```

or run from files directory using Docker Compose.

```
docker-compose up
```

use -d flag to run in background.