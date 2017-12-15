# node_gz

    $ git clone https://github.com/randgars/node_gz.git

    $ npm install
    $ npm start

Node.js v8.9.1

MongoDB v3.4.7

### API endpoint:
#### Post archive to the server

##### POST ```/api/archives```
Content-Type: multipart/form-data

  * title: String (unique and required)
  
  * description: String
  
  * expiration_date: String
  
  * archive(.txt.gz)
  
#### Get all archives from the server

##### GET ```/api/archives?first={first}&max={max}```
   * {first} - index of an element to start with

   * {max} - number of the elements to get

#### Get archive lines

##### GET ```/api/archives/:id/:lines```
   * /:id/ - archive id

   * /:lines - number of lines
