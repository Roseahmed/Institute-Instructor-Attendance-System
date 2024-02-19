# Institute Instructor Attendance System

This project is used to manage the attendance of the instructor. 

---
## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environement.

### Node
- #### Node installation

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).


If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g


## Install

    $ git clone https://github.com/YOUR_USERNAME/PROJECT_TITLE
    $ cd PROJECT_TITLE
    $ npm install

## Running the project

    $ npm start

## Simple build and run for production

    $ npm run build:start


## API Information

An API to manage the in & out times:

 1. Below are the points of assumptions
    - Multiple check-in is not possible if instructor is in check-in state.
    - Check-in and check-out should be less than current time.
    - Check-out time should be less then check-in time.

 2. Endponint: "http://localhost:8000/v1/attendance-system/attendance/add"

 3. Request method: `POST`
 4. Payload:
    ```
    // checkInTime and checkOutTime should be in ISO 8601
    {
       "checkInTime":"2024-02-18T14:35:37.000+00:00"
    }
    OR
    {
        "checkOutTime":"2024-02-18T14:35:37.000+00:00"
    }
    ```

An API for the aggregated monthly report:

 1. Endponint: "http://localhost:8000/v1/attendance-system/attendance/find-check-in-info"

 2. Request method: `POST`
 3. Payload:
    ```
    {
       "year":"2024",
       "month":"02"
    }
    ```

 **_NOTE:_**  For testing, Import the postman scripts, all the details information is given in the scripts and other out of scope API are also present. If any doubt regarding API you can contanct me. 