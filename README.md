# Mock DSS API

A simple mock API server built with Node.js and Express to simulate a Dahua DSS (Digital Surveillance System) for vehicle management. This server is stateful, meaning it reads from and writes to a local `plates.json` file to persist vehicle data and group assignments.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) installed on your system (which includes npm).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd mock-dss-api
    ```

2.  **Install dependencies:**
    The server uses `express`. Install it via npm:
    ```sh
    npm install
    ```

### Running the Server

To start the mock API server, run the following command from the project's root directory:

```sh
node mock-dss-api.js
```

The server will start and listen on port 3000 (or the port specified by the `PORT` environment variable). You should see the message: `Mock DSS API corriendo en puerto 3000`.

## API Endpoints

The following endpoints are implemented:

### 1. Fetch Vehicle Records (Paginated)

-   **Method:** `POST`
-   **URL:** `/ipms/api/v1.1/entrance/vehicle-enter/record/fetch/page`
-   **Description:** Retrieves a paginated list of all vehicles stored in `plates.json`.
-   **Request Body (optional):**
    ```json
    {
      "page": 1,
      "pageSize": 5
    }
    ```
-   **Success Response:** Returns a list of vehicle records including their `id`, `plateNo`, and assigned `entranceGroupIds`.

### 2. Update Vehicle Groups (Batch)

-   **Method:** `POST`
-   **URL:** `/ipms/api/v1.1/vehicle/save/batch`
-   **Description:** Updates the `entranceGroupIds` for one or more vehicles. This endpoint reads `plates.json`, updates the specified vehicles, and writes the changes back to the file.
-   **Request Body:**
    ```json
    {
      "enableEntranceGroup": "1",
      "vehicles": [
        {
          "id": "1",
          "entranceGroupIds": ["1"]
        },
        {
          "id": "2",
          "entranceGroupIds": ["2"]
        }
      ]
    }
    ```
-   **Success Response:** Confirms the update and returns the status (`BLOCKED` for group "1", `UNBLOCKED` for group "2") for each processed vehicle.

### 3. Fetch Vehicle by License Plate

-   **Method:** `POST`
-   **URL:** `/ipms/api/v1.1/vehicle/fetch-by-plate-no`
-   **Description:** Retrieves the detailed information for a single vehicle by searching for its license plate number.
-   **Request Body:**
    ```json
    {
      "plateNo": "ABC-123"
    }
    ```
-   **Success Response:** Returns a detailed, simulated data object for the found vehicle, matching the structure specified in the Dahua API documentation.
