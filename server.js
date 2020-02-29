const mongo = require('mongodb').MongoClient
// const app = require('express')()
// const server = require('http').Server(app)
const io = require('socket.io').listen(process.env.PORT || 4000).sockets
const assert = require('assert')

// Connect to mongo
mongo.connect(process.env.MONGODB_URI || 'mongodb://localhost/mongopixel', {useUnifiedTopology: true, useNewUrlParser: true}, (err, database) => {
  assert.equal(err, null)

  console.log('MongoDB connected...')


  // server.listen(4000, () => {
  console.log('Listening on port 4000...')

  // Connect to socket io
  io.on('connection', (socket) => {
    let db = database.db(process.env.MONGODB_NAME || 'mongopixel')
    let pixelsCollection = db.collection('pixels')

    console.log("New connection...")

    //Function to send status
    // sendStatus = (s) => {
    //   socket.emit('status', s)
    // }

    // Get pixels from mongo collections
    pixelsCollection.find({}).toArray((err, result) => {
      assert.equal(err, null)

      console.log("Found the following pixels")
      // console.log(result)

      // Emit the pixels
      socket.emit('pixels', result)
    })

    //Handle event
    socket.on('change color', (data) => {
      let id = parseInt(data.id)
      let color = data.color

      console.log("Color change event")


      pixelsCollection.updateOne(
        {id: id},
        {
          $set: {
            color: color
          }
        },
        (err, result) => {
          assert.equal(err, null)

          // assert.equal(1, result.result.n);

          console.log("Changed color in DB")
          // console.log(results)

          // Get pixels from mongo collections
          // pixelsCollection = db.collection('pixels')

          console.log(data)

          io.emit('color changed', [data])

        })
    })
  })

  // })

})
