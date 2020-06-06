# Image Upload Using Multer and GridFS
    The repo contains an api/app to upload, store and view images using multer, multer-gridfs-storage and gridfs-stream.
    The file names are generated using the crypto module available with Nodejs.
    Method-Override package is used to override the POST request to DELETE request while deleting a particular file.
    Only images are rendered.

### Tech Stack
- Express
- Multer
- Crypto
- Multer-Gridfs-Storage
- Gridfs-Stream
- Method-override

`npm install`

Change the MONGODB_URI with your Connection string

## Running the app
`npm start` Or `npm run dev`

### Routes
1. GET `/` to get the form and all the uploaded images being displayed
2. POST `/upload` to post the image and save it to the database as well as render on the main page
3. GET `/files` to view all the file data in json format
4. GET `/files/:filename` to get details about a particular file in json format
5. GET `/image/:filename` to view the image separately in the browser.
6. DELETE `/files/:id` to delete a particular image from the page as well as the database.