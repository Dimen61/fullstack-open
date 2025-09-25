const mongoose = require('mongoose')

if (process.argv.length < 3 || process.argv.length > 5 || process.argv.length ===4) {
  console.info('unexpect command parameter number')
  process.exit(1)
} else {
  const password = process.argv[2]
  const url = `mongodb+srv://dimen61_db_user:${password}@cluster0.pgoc91q.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

  mongoose.set('strictQuery',false)
  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
  })
  const Person = mongoose.model('Person', personSchema)

  if (process.argv.length === 3) {
    Person.find({}).then(result => {
      console.info('phonebook:')

      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })

      mongoose.connection.close()
    })
  } else if (process.argv.length === 5) {
    let name = process.argv[3]
    if (name.startsWith('"') && name.endsWith('"')) {
      name = name.slice(1, -1)
    }

    const number = process.argv[4]
    console.info(`name: ${name}`)
    console.info(`number: ${number}`)

    const person = new Person({
      name: name,
      number: number
    })

    person.save().then(result => {
      console.log(`added ${name} ${number} to phonebook`)
      mongoose.connection.close()
    })
  }
}
