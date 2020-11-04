require('dotenv').config()
const express = require('express');
const app = express();
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors');
const { response } = require('express');

morgan.token('content', function(req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

 

app.get('/', (req, res, next) => {
    res.send('Welcome to your Phonebook')
      .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {

  Person.find({})
    .then(persons => { 
      res.json(persons)
      })
    .catch(error => next(error))

})
     
 

app.get('/info', (req, res, next) => {
    const dateProcessed =  new Date() 

    Person.find({}).then(persons => { 
      res.send(`Phonebook has info for ${persons.length} people \n${dateProcessed}`)
      })
      .catch( error => next(error))
    })



app.get('/api/persons/:id', (req, res, next
  ) => {
    const { id } = req.params
     Person.findById(id).then(person => {
       if (person) {
      res.status(200).json(person) 
    } else {
      res.status(404).end()
    }
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch( error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const { body } = req

  const person = new Person({
    name: body.name,
    number: body.number, 
  })

  // if (!body.name) {
  //   return res.status(400).json({
  //     error: 'name is missing'
  //   })
  // } else if (!body.number) {
  //   return res.status(400).json({
  //     error: 'number is missing'
  //   })
  // } 

  
  person
  .save()
  .then(savedPerson => savedPerson.toJSON())
  .then( savedAndFormattedPerson => {
    res.json(savedAndFormattedPerson)
  })
  .catch( error => next(error))


})

app.put('/api/persons/:id', (req, res, next) => {

  const { body } = req

  const person =  {
    name: body.name,
    number: body.number,
}

  Person.findByIdAndUpdate(req.params.id, person, { new: true })    
  .then( updatedPerson => {
       res.json(updatedPerson)
  })
  .catch( error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint '})
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if( error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if ( error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message})
  }

  next(error)
}

app.use(errorHandler)
app.use(unknownEndpoint)
    
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})