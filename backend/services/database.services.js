import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import mongoose from 'mongoose'
config()
const uri =
  'mongodb+srv://messithinh12345:iz6OH5hpuU1f2jmV@cluster0.jnlhnou.mongodb.net/personal-project?retryWrites=true&w=majority'

class databaseService {
  connect() {
    return mongoose
      .connect(
        'mongodb+srv://messithinh12345:iz6OH5hpuU1f2jmV@cluster0.jnlhnou.mongodb.net/personal-project?retryWrites=true&w=majority'
      )
      .then(() => {
        console.log('Connected to MongoDB')
      })
      .catch((err) => {
        console.log(err)
      })
  }
  // #client
  // #db

  // constructor() {
  //   this.#client = new MongoClient(uri)
  //   this.#db = this.#client.db('rental-car')
  // }

  // async connect() {
  //   try {
  //     await this.#db.command({ ping: 1 })
  //     console.log('Pinged your deployment. You successfully connected to MongoDB!')
  //   } catch {
  //     console.dir
  //   }
  // }

  // get users() {
  //   return this.#db.collection('User')
  // }
}

const databaseServices = new databaseService()

export default databaseServices
