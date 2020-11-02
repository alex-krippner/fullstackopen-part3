const express = require('express');
const app = express();
const morgan = require('morgan')
const cors = require('cors')

morgan.token('content', function(req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))


let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    }
  ]

  const generateId = () => {
    const newId = Math.floor(Math.random() * 100000)
    if (persons.find(p => p.id !== newId))  return newId;
    generateId()   
  }

app.get('/', (req, res) => {
    res.send('Welcome to your Phonebook')
})

app.get('/api/persons', (req, res) => {
            res.json(persons)
            }
        )

app.get('/info', (req, res) => {
    const dateProcessed =  new Date() 

    res.send(`Phonebook has info for ${persons.length} people \n${dateProcessed}`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const result = persons.find( p => p.id === id);

    if (result){
        res.status(200).send(result)
    } else {
        res.status(404).json({
            error: 'person not found'
        })
    }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const { body } = req

  if (!body.name) {
    return res.status(400).json({
      error: 'name is missing'
    })
  } else if (!body.number) {
    return res.status(400).json({
      error: 'number is missing'
    })
  } else if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(newPerson)

  res.json(newPerson)

})
    
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})