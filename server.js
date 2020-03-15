const mongo = require('mongodb').MongoClient
const io = require('socket.io').listen(process.env.PORT || 4000).sockets
const assert = require('assert')

// Connect to mongo
mongo.connect(process.env.MONGODB_URI || 'mongodb://localhost/mongopixel', {useUnifiedTopology: true, useNewUrlParser: true}, (err, database) => {
  assert.equal(err, null)

  console.log('MongoDB connected...')

  console.log('Listening on port 4000...')

  // Connect to socket io
  io.on('connection', (socket) => {
    let db = database.db(process.env.MONGODB_NAME || 'mongopixel')
    let pixelsCollection = db.collection('pixels')

    console.log("New connection...")

    console.log(io.server.engine.clientsCount)

    let userCount = io.server.engine.clientsCount
    io.emit('user count', userCount)


    // Get pixels from mongo collections
    pixelsCollection.find({}).toArray((err, result) => {
      assert.equal(err, null)

      pixels = {}

      console.log("Found the following pixels")

      pixels.maxRow = result[0].maxRow
      pixels.maxCol = result[0].maxCol

      for (var i=1; i<result.length; i++) {
        var color
        var index
        for (var data in result[i]) {
          if (data == "_id") continue
          if (data == "id") index = result[i][data]
          if (data == "color") color = result[i][data]
        }
        pixels[index] = color

      }

      // Emit the pixels
      socket.emit('pixels', pixels)
    })

    //Handle event
    socket.on('change color', (data) => {

      console.log("Color change event")

      newData = {}

      for (var index in data) {
        newData.id = index
        newData.color = data[index]
      }


      pixelsCollection.find(newData).toArray((err, results) => {
        if (results.length == 0) {
          console.log("NETU")
          pixelsCollection.insertOne(newData)
        } else {
          console.log("EST")
          for (var id in data) {
            pixelsCollection.updateOne({id: id}, {$set: {color: data[id]}},
              (err, results) => {
                console.log("Changed color in DB")

              })
          }
        }
        io.emit('color changed', data)

      })

    })

    socket.on('disconnect', () => {
      
      let userCount = io.server.engine.clientsCount
      io.emit('user count', userCount)
    })
  })

})
